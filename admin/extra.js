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
    for (const f of [p.photo, p.cv && p.cv.fr, p.cv && p.cv.en]) {
      if (f && (!SAFE_PATH.test(f) || f.includes('..'))) errs.push(`Profil : chemin de fichier invalide (${f})`);
    }
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
