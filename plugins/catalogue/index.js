// Plugin Docusaurus : transforme data/catalogue.json en pages.
//   /enseignement            liste des modules (filtres niveau / theme)
//   /enseignement/annees     vue chronologique par annee universitaire
//   /enseignement/<id>       page d'un module
// Les ressources "hidden" sont retirees ici, avant d'etre envoyees au navigateur.

const fs = require('fs');
const path = require('path');

// Seuls les liens http(s) sont conserves : on ecarte javascript:, data:, etc.
const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u.trim()) ? u.trim() : undefined);

function cleanLinks(links) {
  const out = {};
  for (const [k, v] of Object.entries(links || {})) {
    const u = safeUrl(v);
    if (u) out[k] = u;
  }
  return out;
}

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
// Fichiers servis par le site : uniquement sous files/ ou img/, sans remontee de dossier.
const safeFile = (f) => (typeof f === 'string' && /^(files|img)\/[A-Za-z0-9._\-\/]+$/.test(f) && !f.includes('..') ? f : '');

function publicProfile(profile) {
  return {
    ...profile,
    photo: safeFile(profile.photo),
    links: cleanLinks(profile.links),
    email: EMAIL_RE.test(profile.email || '') ? profile.email.trim() : '',
    cv: {fr: safeFile(profile.cv && profile.cv.fr), en: safeFile(profile.cv && profile.cv.en)},
    themes: (profile.themes || []).filter((t) => t && (t.fr || t.en)),
    timeline: (profile.timeline || []).filter((t) => t && t.title && (t.title.fr || t.title.en)),
  };
}

function publicView(catalogue) {
  const modules = catalogue.modules.map((m) => ({
    ...m,
    links: cleanLinks(m.links),
    editions: (m.editions || []).map((e) => ({
      ...e,
      links: cleanLinks(e.links),
      sessions: (e.sessions || []).map((s) => ({
        ...s,
        resources: (s.resources || [])
          .filter((r) => r.visibility === 'public')
          .map((r) => ({...r, url: safeUrl(r.url)}))
          .filter((r) => r.file || r.url),
      })),
    })),
  }));
  const research = (catalogue.research || [])
    .filter((r) => r.visibility !== 'hidden')
    .map((r) => ({...r, links: cleanLinks(r.links)}));
  return {options: catalogue.options, modules, research};
}

module.exports = function cataloguePlugin(context) {
  const file = path.join(context.siteDir, 'data', 'catalogue.json');
  const profileFile = path.join(context.siteDir, 'data', 'profile.json');
  // Les routes d'un plugin doivent porter le baseUrl (et la locale) : /My-Site/ ou /My-Site/en/
  const route = (p) => path.posix.join(context.baseUrl, p);
  return {
    name: 'catalogue-plugin',

    getPathsToWatch() {
      return [file, profileFile];
    },

    async contentLoaded({actions}) {
      const {createData, addRoute} = actions;
      const catalogue = publicView(JSON.parse(fs.readFileSync(file, 'utf8')));

      const catalogueData = await createData('catalogue.json', JSON.stringify(catalogue));

      addRoute({
        path: route('/enseignement'),
        exact: true,
        component: '@site/src/components/Catalogue/ModuleList',
        modules: {catalogue: catalogueData},
      });

      addRoute({
        path: route('/enseignement/annees'),
        exact: true,
        component: '@site/src/components/Catalogue/YearView',
        modules: {catalogue: catalogueData},
      });

      const profile = publicProfile(JSON.parse(fs.readFileSync(profileFile, 'utf8')));
      const profileData = await createData('profile.json', JSON.stringify(profile));
      addRoute({path: route('/apropos'), exact: true, component: '@site/src/components/Catalogue/About', modules: {data: profileData}});
      addRoute({path: route('/mentions-legales'), exact: true, component: '@site/src/components/Catalogue/Legal', modules: {data: profileData}});
      addRoute({path: route('/enseignement/bilan'), exact: true, component: '@site/src/components/Catalogue/Summary', modules: {catalogue: catalogueData}});

      const researchData = await createData('research.json', JSON.stringify({research: catalogue.research}));
      addRoute({
        path: route('/recherche'),
        exact: true,
        component: '@site/src/components/Catalogue/ResearchList',
        modules: {data: researchData},
      });

      for (const m of catalogue.modules) {
        const moduleData = await createData(`module-${m.id}.json`, JSON.stringify({module: m, options: catalogue.options}));
        addRoute({
          path: route(`/enseignement/${m.id}`),
          exact: true,
          component: '@site/src/components/Catalogue/ModulePage',
          modules: {data: moduleData},
        });
      }
    },
  };
};
