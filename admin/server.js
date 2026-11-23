// Dashboard local : edite data/catalogue.json et depose les fichiers dans static/files/.
// Lancement : npm run admin   (puis http://127.0.0.1:4000)
// Securite : ecoute sur 127.0.0.1 uniquement, Host et en-tete X-Admin verifies, aucune dependance.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CATALOGUE = path.join(ROOT, 'data', 'catalogue.json');
const FILES_DIR = path.join(ROOT, 'static', 'files');
const PORT = Number(process.env.ADMIN_PORT || 4000);
const MAX_UPLOAD = 90 * 1024 * 1024; // GitHub refuse au-dela de 100 Mo
const EXT = new Set(['.pdf', '.zip', '.ipynb', '.csv', '.md', '.txt', '.png', '.jpg', '.jpeg', '.json']);

const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const YEAR_RE = /^\d{4}-\d{4}$/;
const TYPES = ['cours', 'td', 'tp', 'notebook', 'data', 'kit', 'qcm', 'corrige', 'autre'];
const STATUS = ['ready', 'draft', 'upcoming'];

const isHttp = (u) => typeof u === 'string' && /^https?:\/\//i.test(u.trim());
const send = (res, code, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(code, {'Content-Type': type, 'Cache-Control': 'no-store'});
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};

// ---- validation : renvoie la liste des problemes, vide si tout est correct
function validate(c) {
  const errs = [];
  const seen = new Set();
  const link = (u, where) => { if (u && !isHttp(u)) errs.push(`${where} : le lien doit commencer par http:// ou https://`); };
  if (!c || !Array.isArray(c.modules)) return ['catalogue invalide'];
  for (const m of c.modules) {
    const w = `Module ${m.id || '?'}`;
    if (!ID_RE.test(m.id || '')) errs.push(`${w} : identifiant invalide (minuscules, chiffres, tirets)`);
    if (seen.has(m.id)) errs.push(`${w} : identifiant en double`);
    seen.add(m.id);
    if (!m.title || !m.title.fr) errs.push(`${w} : titre français manquant`);
    link(m.links && m.links.repo, `${w} dépôt`);
    if (m.license && !(c.options && c.options.licenses && c.options.licenses[m.license])) errs.push(`${w} : licence inconnue`);
    const years = new Set();
    for (const e of m.editions || []) {
      if (!YEAR_RE.test(e.year || '')) errs.push(`${w} : année « ${e.year} » invalide (format 2026-2027)`);
      if (years.has(e.year)) errs.push(`${w} : année ${e.year} en double`);
      years.add(e.year);
      link(e.links && e.links.repo, `${w} ${e.year} dépôt`);
      for (const [k, v] of Object.entries(e.hours || {})) {
        if (!['cm', 'td', 'tp'].includes(k) || typeof v !== 'number' || !(v >= 0) || v > 1000) errs.push(`${w} ${e.year} : heures ${k} invalides`);
      }
      const sids = new Set();
      for (const s of e.sessions || []) {
        if (!ID_RE.test(s.id || '')) errs.push(`${w} ${e.year} : séance « ${s.id} » identifiant invalide`);
        if (sids.has(s.id)) errs.push(`${w} ${e.year} : séance ${s.id} en double`);
        sids.add(s.id);
        if (!STATUS.includes(s.status)) errs.push(`${w} ${e.year} ${s.id} : statut invalide`);
        for (const r of s.resources || []) {
          const rw = `${w} ${e.year} ${s.id} ressource « ${typeof r.title === 'string' ? r.title : ''} »`;
          if (!TYPES.includes(r.type)) errs.push(`${rw} : type invalide`);
          if (!['public', 'hidden'].includes(r.visibility)) errs.push(`${rw} : visibilité invalide`);
          if (r.visibility === 'public' && !r.file && !r.url) errs.push(`${rw} : ni fichier ni lien`);
          if (r.url) link(r.url, rw);
          if (r.file && (!/^files\/[A-Za-z0-9._\-\/]+$/.test(r.file) || r.file.includes('..'))) errs.push(`${rw} : chemin de fichier invalide`);
          if (r.visibility === 'hidden' && r.file) errs.push(`${rw} : une ressource masquée ne doit pas avoir de fichier`);
        }
      }
    }
  }
  for (const r of c.research || []) {
    if (!ID_RE.test(r.id || '')) errs.push(`Recherche « ${r.id} » : identifiant invalide`);
    for (const [k, v] of Object.entries(r.links || {})) if (v) link(v, `Recherche ${r.id} ${k}`);
  }
  return errs;
}


// ---- import depuis un dossier de cours : analyse (aucune copie) puis copie des fichiers choisis
const SKIP_DIRS = new Set(['.git', 'node_modules', '__pycache__', '.venv', 'venv', 'build', '.ipynb_checkpoints', '.idea', '.vscode']);
const WORK_EXT = new Set(['.aux', '.log', '.nav', '.out', '.snm', '.toc', '.vrb', '.gz', '.pyc', '.db', '.tmp', '.ppt', '.pptx', '.docx', '.xlsx', '.xls', '.tex', '.py', '.sql']);
const IMG_EXT = new Set(['.png', '.jpg', '.jpeg']);

function flagsFor(rel, ext, size) {
  const f = [];
  const low = rel.toLowerCase();
  if (/emargement|émargement|notes?[_ -]|grtous|ds[_ -]machine|copie/.test(low) || ext === '.xlsx' || ext === '.xls' || ext === '.docx') f.push({k: 'perso', t: 'données personnelles possibles (copies, notes, émargement)'});
  if (/corrig|correction|solution/.test(low)) f.push({k: 'corrige', t: 'corrigé'});
  if (IMG_EXT.has(ext)) f.push({k: 'droits', t: 'image : vérifier les droits de diffusion'});
  if (size > MAX_UPLOAD) f.push({k: 'gros', t: 'trop volumineux pour GitHub (> 90 Mo)'});
  if (!EXT.has(ext)) f.push({k: 'bloque', t: WORK_EXT.has(ext) ? 'fichier de travail ou source : non importable' : 'type non importable'});
  return f;
}

function scanDir(root) {
  const out = [];
  const walk = (dir, depth) => {
    if (depth > 6 || out.length >= 5000) return;
    let entries;
    try { entries = fs.readdirSync(dir, {withFileTypes: true}); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(full, depth + 1); continue; }
      if (!e.isFile()) continue;
      const size = fs.statSync(full).size;
      const ext = path.extname(e.name).toLowerCase();
      const rel = path.relative(root, full).split(path.sep).join('/');
      out.push({rel, size, ext, flags: flagsFor(rel, ext, size)});
    }
  };
  walk(root, 0);
  return out;
}

function saveCatalogue(c) {
  // retire les liens vides pour garder le fichier lisible
  const prune = (o) => { if (o && o.links) for (const k of Object.keys(o.links)) if (!o.links[k]) delete o.links[k]; };
  c.modules.forEach((m) => {
    prune(m);
    if (!m.license) delete m.license;
    (m.editions || []).forEach((e) => {
      prune(e);
      if (e.hours && !Object.keys(e.hours).length) delete e.hours;
    });
  });
  (c.research || []).forEach(prune);
  const tmp = CATALOGUE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(c, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, CATALOGUE);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (d) => {
      size += d.length;
      if (size > limit) { reject(Object.assign(new Error('Fichier trop volumineux'), {code: 413})); req.destroy(); return; }
      chunks.push(d);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const extra = require('./extra')({ROOT, FILES_DIR, CATALOGUE, send, readBody, MAX_UPLOAD, isHttp});

const server = http.createServer(async (req, res) => {
  try {
    const host = (req.headers.host || '').toLowerCase();
    if (host !== `127.0.0.1:${PORT}` && host !== `localhost:${PORT}`) return send(res, 403, {error: 'host refusé'});
    const url = new URL(req.url, `http://${host}`);

    if (req.method === 'GET' && url.pathname === '/') {
      return send(res, 200, fs.readFileSync(path.join(__dirname, 'index.html')), 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && url.pathname === '/api/catalogue') {
      return send(res, 200, fs.readFileSync(CATALOGUE, 'utf8'));
    }

    // toute ecriture exige l'en-tete X-Admin : un site tiers ne peut pas l'envoyer sans autorisation CORS
    if (req.method !== 'GET' && req.headers['x-admin'] !== '1') return send(res, 403, {error: 'en-tête X-Admin manquant'});

    if (await extra(req, res, url)) return;

    if (req.method === 'PUT' && url.pathname === '/api/catalogue') {
      const catalogue = JSON.parse((await readBody(req, 5 * 1024 * 1024)).toString('utf8'));
      const errs = validate(catalogue);
      if (errs.length) return send(res, 400, {errors: errs});
      saveCatalogue(catalogue);
      return send(res, 200, {ok: true});
    }

    if (req.method === 'POST' && url.pathname === '/api/upload') {
      const mod = url.searchParams.get('module') || '';
      const year = url.searchParams.get('year') || '';
      const raw = url.searchParams.get('name') || '';
      const name = path.basename(raw).replace(/[^A-Za-z0-9._-]/g, '_');
      if (!ID_RE.test(mod) || !YEAR_RE.test(year)) return send(res, 400, {error: 'module ou année invalide'});
      if (!EXT.has(path.extname(name).toLowerCase())) return send(res, 400, {error: `extension refusée (${[...EXT].join(' ')})`});
      const dir = path.join(FILES_DIR, mod, year);
      const dest = path.join(dir, name);
      if (!dest.startsWith(FILES_DIR + path.sep)) return send(res, 400, {error: 'chemin invalide'});
      const body = await readBody(req, MAX_UPLOAD);
      fs.mkdirSync(dir, {recursive: true});
      fs.writeFileSync(dest, body);
      return send(res, 200, {file: `files/${mod}/${year}/${name}`, bytes: body.length});
    }


    if (req.method === 'POST' && url.pathname === '/api/scan') {
      const {dir} = JSON.parse((await readBody(req, 64 * 1024)).toString('utf8'));
      const root = path.resolve(String(dir || ''));
      if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return send(res, 400, {error: 'dossier introuvable'});
      return send(res, 200, {root, files: scanDir(root)});
    }

    if (req.method === 'POST' && url.pathname === '/api/import') {
      const {dir, module: mod, year, session, items} = JSON.parse((await readBody(req, 1024 * 1024)).toString('utf8'));
      const root = path.resolve(String(dir || ''));
      if (!ID_RE.test(mod || '') || !YEAR_RE.test(year || '') || !ID_RE.test(session || '')) return send(res, 400, {error: 'module, année ou séance invalide'});
      const destDir = path.join(FILES_DIR, mod, year, session);
      const done = [], refused = [];
      for (const rel of items || []) {
        const src = path.resolve(root, String(rel));
        const ext = path.extname(src).toLowerCase();
        if (!src.startsWith(root + path.sep) || !fs.existsSync(src) || !fs.statSync(src).isFile()) { refused.push({rel, why: 'introuvable'}); continue; }
        const blocking = flagsFor(String(rel), ext, fs.statSync(src).size).find((x) => x.k === 'bloque' || x.k === 'gros');
        if (blocking) { refused.push({rel, why: blocking.t}); continue; }
        let name = path.basename(src).replace(/[^A-Za-z0-9._-]/g, '_');
        let dest = path.join(destDir, name);
        for (let n = 2; fs.existsSync(dest); n++) { dest = path.join(destDir, name.replace(/(\.[^.]*)?$/, `-${n}$1`)); }
        fs.mkdirSync(destDir, {recursive: true});
        fs.copyFileSync(src, dest);
        done.push({rel, file: `files/${mod}/${year}/${session}/${path.basename(dest)}`});
      }
      return send(res, 200, {done, refused});
    }

    send(res, 404, {error: 'introuvable'});
  } catch (e) {
    send(res, e.code === 413 ? 413 : 500, {error: e.message});
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Dashboard : http://127.0.0.1:${PORT}   (Ctrl+C pour arrêter)`);
});
