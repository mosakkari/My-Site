// Routes complementaires du dashboard : profil, fichiers orphelins, publication Git, CV.
// Meme garde-fous que server.js (127.0.0.1, Host et X-Admin verifies avant d'arriver ici).

const fs = require('fs');
const path = require('path');
const {execFile} = require('child_process');

const SAFE_PATH = /^(files|img)\/[A-Za-z0-9._\-\/]+$/;
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

module.exports = function makeHandler(ctx) {
  const {ROOT, FILES_DIR, CATALOGUE, send, readBody, MAX_UPLOAD, isHttp} = ctx;
  const PROFILE = path.join(ROOT, 'data', 'profile.json');

  const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

  function validateProfile(p) {
    const errs = [];
    if (!p || typeof p !== 'object') return ['profil invalide'];
    if (!p.name || !String(p.name).trim()) errs.push('Profil : le nom est obligatoire');
    for (const [k, v] of Object.entries(p.links || {})) if (v && !isHttp(v)) errs.push(`Profil : lien ${k} doit commencer par http:// ou https://`);
    if (p.email && !EMAIL.test(p.email)) errs.push('Profil : adresse email invalide');
    for (const [i, t] of (p.timeline || []).entries()) {
      if (t.category && !['enseignement', 'rd', 'industrie'].includes(t.category)) errs.push(`Profil : étape ${i + 1}, catégorie invalide`);
    }
    for (const f of [p.photo, p.cv && p.cv.fr, p.cv && p.cv.en]) {
      if (f && (!SAFE_PATH.test(f) || f.includes('..'))) errs.push(`Profil : chemin de fichier invalide (${f})`);
    }
    return errs;
  }

  const NEWS = path.join(ROOT, 'data', 'news.json');
  const NEWS_TYPES = ['nouvelle', 'projet', 'publication', 'recherche', 'participation', 'enseignement'];
  const NEWS_STATUS = ['', 'en-cours', 'soumis', 'accepte', 'publie'];

  function validateNews(n) {
    if (!n || !Array.isArray(n.items)) return ['actualités invalides'];
    const errs = [];
    const seen = new Set();
    n.items.forEach((it, i) => {
      const w = `Actualité ${i + 1}`;
      if (!/^[a-z0-9][a-z0-9-]*$/.test(it.id || '')) errs.push(`${w} : identifiant invalide (minuscules, chiffres, tirets)`);
      if (seen.has(it.id)) errs.push(`${w} : identifiant en double`);
      seen.add(it.id);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(it.date || '') || Number.isNaN(Date.parse(it.date))) errs.push(`${w} : date invalide (format AAAA-MM-JJ)`);
      if (!NEWS_TYPES.includes(it.type)) errs.push(`${w} : type invalide`);
      if (!it.title || !String(it.title.fr || '').trim()) errs.push(`${w} : titre français manquant`);
      if (it.link && !isHttp(it.link)) errs.push(`${w} : le lien doit commencer par http:// ou https://`);
      if (it.status && !NEWS_STATUS.includes(it.status)) errs.push(`${w} : statut invalide`);
      if (it.image && (!SAFE_PATH.test(it.image) || it.image.includes('..') || !/\.(png|jpe?g|webp)$/i.test(it.image))) errs.push(`${w} : chemin d’image invalide`);
      if (it.imageFit && !['cover', 'contain'].includes(it.imageFit)) errs.push(`${w} : cadrage d’image invalide`);
      for (const k of ['with', 'venue']) if (it[k] && String(it[k]).length > 300) errs.push(`${w} : champ « ${k} » trop long (300 caractères max)`);
      for (const f of [it.title, it.text, it.context]) for (const v of Object.values(f || {})) if (String(v).length > 600) errs.push(`${w} : texte trop long (600 caractères max)`);
    });
    return errs;
  }

  function referencedFiles() {
    const set = new Set();
    const c = readJson(CATALOGUE);
    for (const m of c.modules || []) for (const e of m.editions || []) for (const s of e.sessions || []) for (const r of s.resources || []) if (r.file) set.add(r.file);
    const p = readJson(PROFILE);
    for (const f of [p.photo, p.cv && p.cv.fr, p.cv && p.cv.en]) if (f) set.add(f);
    return set;
  }

  function listFiles(dir, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) listFiles(full, out);
      else if (e.isFile()) out.push({file: 'files/' + path.relative(FILES_DIR, full).split(path.sep).join('/'), size: fs.statSync(full).size});
    }
    return out;
  }

  function git(args, timeout = 60000) {
    return new Promise((resolve) => {
      execFile('git', args, {cwd: ROOT, timeout, windowsHide: true, maxBuffer: 4 * 1024 * 1024}, (err, stdout, stderr) => {
        resolve({ok: !err, code: err ? err.code : 0, out: (stdout || '') + (stderr || '')});
      });
    });
  }

  const PUBLISH_PATHS = ['data', 'static/files', 'static/img', 'i18n'];

  return async function handle(req, res, url) {
    const p = url.pathname;

    if (req.method === 'GET' && p === '/api/profile') {
      send(res, 200, fs.readFileSync(PROFILE, 'utf8'));
      return true;
    }
    if (req.method === 'PUT' && p === '/api/profile') {
      const prof = JSON.parse((await readBody(req, 1024 * 1024)).toString('utf8'));
      const errs = validateProfile(prof);
      if (errs.length) { send(res, 400, {errors: errs}); return true; }
      for (const k of Object.keys(prof.links || {})) if (!prof.links[k]) prof.links[k] = '';
      const tmp = PROFILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(prof, null, 2) + '\n', 'utf8');
      fs.renameSync(tmp, PROFILE);
      send(res, 200, {ok: true});
      return true;
    }

    if (req.method === 'GET' && p === '/api/news') {
      send(res, 200, fs.existsSync(NEWS) ? fs.readFileSync(NEWS, 'utf8') : JSON.stringify({items: []}));
      return true;
    }
    if (req.method === 'PUT' && p === '/api/news') {
      const news = JSON.parse((await readBody(req, 1024 * 1024)).toString('utf8'));
      const errs = validateNews(news);
      if (errs.length) { send(res, 400, {errors: errs}); return true; }
      const tmp = NEWS + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(news, null, 2) + '\n', 'utf8');
      fs.renameSync(tmp, NEWS);
      send(res, 200, {ok: true});
      return true;
    }

    // Import de publications depuis HAL (API publique). Seul l'idHal saisi est envoye, a api.archives-ouvertes.fr.
    if (req.method === 'POST' && p === '/api/hal') {
      const {idhal} = JSON.parse((await readBody(req, 4 * 1024)).toString('utf8'));
      if (!/^[A-Za-z0-9_-]{2,60}$/.test(String(idhal || ''))) { send(res, 400, {error: 'idHal invalide (lettres, chiffres, - et _)'}); return true; }
      const fl = 'docid,title_s,authFullName_s,producedDateY_i,producedDate_s,journalTitle_s,conferenceTitle_s,bookTitle_s,doiId_s,uri_s,docType_s,fileMain_s';
      const api = `https://api.archives-ouvertes.fr/search/?q=${encodeURIComponent(`authIdHal_s:"${idhal}"`)}&fl=${fl}&rows=200&sort=${encodeURIComponent('producedDate_tdate desc')}&wt=json`;
      let json;
      try {
        const r = await fetch(api, {signal: AbortSignal.timeout(15000), headers: {Accept: 'application/json'}});
        if (!r.ok) throw new Error('HAL a répondu ' + r.status);
        json = JSON.parse((await r.text()).slice(0, 8 * 1024 * 1024));
      } catch (e) { send(res, 502, {error: 'HAL injoignable : ' + e.message}); return true; }
      const str = (v) => (Array.isArray(v) ? v[0] : v);
      const text = (v) => (typeof str(v) === 'string' ? str(v).trim() : '');
      const url = (v) => (isHttp(text(v)) ? text(v) : '');
      const docs = ((json.response && json.response.docs) || []).map((d) => ({
        id: String(d.docid),
        title: text(d.title_s),
        authors: Array.isArray(d.authFullName_s) ? d.authFullName_s.join(', ') : text(d.authFullName_s),
        year: Number(d.producedDateY_i) || '',
        date: /^\d{4}-\d{2}-\d{2}$/.test(text(d.producedDate_s)) ? text(d.producedDate_s) : (d.producedDateY_i ? `${d.producedDateY_i}-01-01` : ''),
        venue: text(d.journalTitle_s) || text(d.conferenceTitle_s) || text(d.bookTitle_s),
        kind: text(d.docType_s),
        doi: text(d.doiId_s) ? `https://doi.org/${text(d.doiId_s)}` : '',
        url: url(d.uri_s),
        pdf: url(d.fileMain_s),
      })).filter((d) => d.title);
      send(res, 200, {total: (json.response && json.response.numFound) || docs.length, docs});
      return true;
    }

    // image d'actualite : PNG, JPEG ou WebP reconnus par leur contenu (pas seulement l'extension), 5 Mo max
    if (req.method === 'POST' && p === '/api/upload-news-image') {
      const body = await readBody(req, 5 * 1024 * 1024);
      const h = body.slice(0, 12);
      const ext = h.slice(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) ? 'png'
        : h.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ? 'jpg'
        : (h.slice(0, 4).toString('latin1') === 'RIFF' && h.slice(8, 12).toString('latin1') === 'WEBP') ? 'webp' : '';
      if (!ext) { send(res, 400, {error: 'image refusée : PNG, JPEG ou WebP uniquement'}); return true; }
      const base = path.basename(url.searchParams.get('name') || 'image').replace(/\.[^.]*$/, '').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 40) || 'image';
      const dir = path.join(ROOT, 'static', 'img', 'news');
      fs.mkdirSync(dir, {recursive: true});
      let name = `${base}.${ext}`;
      for (let n = 2; fs.existsSync(path.join(dir, name)); n++) name = `${base}-${n}.${ext}`;
      fs.writeFileSync(path.join(dir, name), body);
      send(res, 200, {file: `img/news/${name}`, bytes: body.length});
      return true;
    }

    // CV : un seul PDF par langue, ecrase l'ancien
    if (req.method === 'POST' && p === '/api/upload-cv') {
      const lang = url.searchParams.get('lang');
      if (!['fr', 'en'].includes(lang)) { send(res, 400, {error: 'langue invalide'}); return true; }
      const body = await readBody(req, MAX_UPLOAD);
      if (body.slice(0, 5).toString('latin1') !== '%PDF-') { send(res, 400, {error: 'ce fichier n’est pas un PDF'}); return true; }
      const dir = path.join(FILES_DIR, 'profil');
      fs.mkdirSync(dir, {recursive: true});
      fs.writeFileSync(path.join(dir, `cv-${lang}.pdf`), body);
      send(res, 200, {file: `files/profil/cv-${lang}.pdf`, bytes: body.length});
      return true;
    }

    // fichiers presents dans static/files mais cites nulle part
    if (req.method === 'GET' && p === '/api/orphans') {
      const used = referencedFiles();
      send(res, 200, {files: listFiles(FILES_DIR).filter((f) => !used.has(f.file))});
      return true;
    }
    if (req.method === 'POST' && p === '/api/orphans/delete') {
      const {files} = JSON.parse((await readBody(req, 256 * 1024)).toString('utf8'));
      const used = referencedFiles();
      const deleted = [], refused = [];
      for (const f of files || []) {
        const full = path.resolve(ROOT, 'static', String(f));
        if (!full.startsWith(FILES_DIR + path.sep) || used.has(f) || !fs.existsSync(full)) { refused.push(f); continue; }
        fs.unlinkSync(full);
        deleted.push(f);
        // supprime les dossiers devenus vides, sans jamais sortir de static/files
        for (let d = path.dirname(full); d.startsWith(FILES_DIR + path.sep) && fs.readdirSync(d).length === 0; d = path.dirname(d)) fs.rmdirSync(d);
      }
      send(res, 200, {deleted, refused});
      return true;
    }

    // Git : ne touche qu'aux dossiers du contenu, jamais au code
    if (req.method === 'GET' && p === '/api/git/status') {
      const paths = PUBLISH_PATHS.filter((x) => fs.existsSync(path.join(ROOT, x)));
      const st = await git(['status', '--short', '--', ...paths]);
      const br = await git(['rev-parse', '--abbrev-ref', 'HEAD']);
      send(res, 200, {branch: br.out.trim(), changes: st.out.split('\n').filter(Boolean)});
      return true;
    }
    if (req.method === 'POST' && p === '/api/git/publish') {
      const {message} = JSON.parse((await readBody(req, 16 * 1024)).toString('utf8'));
      const msg = String(message || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 100) || 'Mise à jour du contenu';
      const paths = PUBLISH_PATHS.filter((x) => fs.existsSync(path.join(ROOT, x)));
      const log = [];
      let r = await git(['add', '--', ...paths]); log.push('$ git add ' + paths.join(' '), r.out);
      if (!r.ok) { send(res, 500, {ok: false, log: log.join('\n')}); return true; }
      r = await git(['commit', '-m', msg]); log.push('$ git commit', r.out);
      if (!r.ok && !/nothing to commit|rien à valider|no changes added/i.test(r.out)) { send(res, 500, {ok: false, log: log.join('\n')}); return true; }
      r = await git(['push'], 120000); log.push('$ git push', r.out);
      send(res, r.ok ? 200 : 500, {ok: r.ok, log: log.join('\n')});
      return true;
    }

    return false;
  };
};
