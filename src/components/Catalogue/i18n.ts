import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export type Loc = {fr: string; en: string};
export type Lang = 'fr' | 'en';

export type Resource = {
  type: string;
  title: Loc | string;
  file?: string; // chemin relatif a static/, ex. files/bd5/2026-2027/cours.pdf
  url?: string; // OU un lien externe (depot, site...) : l'un des deux suffit
  colab?: boolean;
  visibility: 'public' | 'hidden';
};
export type Session = {id: string; label: string; title: Loc; status: 'ready' | 'draft' | 'upcoming'; resources: Resource[]};
export type Links = {repo?: string; [k: string]: string | undefined};
export type Hours = {cm?: number; td?: number; tp?: number};
export type Edition = {year: string; hours?: Hours; links?: Links; sessions: Session[]};
export type Research = {
  id: string; title: Loc | string; authors?: string; year?: number | string; venue?: string;
  kind?: string; abstract?: Loc | string; links: {paper?: string; pdf?: string; doi?: string; repo?: string};
};
export type License = {label: string; url: string};
export type Module = {
  id: string; code: string; title: Loc; level: string; speciality: string;
  institution: string; theme: string; summary: Loc; license?: string; links?: Links; editions: Edition[];
};
export type Options = {
  levels: string[]; specialities: string[]; institutions: string[];
  themes: Record<string, Loc>; licenses?: Record<string, License>;
};
export type TimelineCategory = 'enseignement' | 'rd' | 'industrie';
export type TimelineItem = {period: string; title: Loc; place?: string; detail?: Loc; category?: TimelineCategory | ''};
export type Profile = {
  name: string; photo?: string; role: Loc; affiliation: Loc; bio: Loc;
  themes: Loc[]; timeline: TimelineItem[];
  links: {github?: string; linkedin?: string; orcid?: string; hal?: string; scholar?: string};
  email?: string; cv: {fr?: string; en?: string};
};

export function useLang(): Lang {
  const {i18n} = useDocusaurusContext();
  return i18n.currentLocale === 'en' ? 'en' : 'fr';
}

export function pick(v: Loc | string | undefined, lang: Lang): string {
  if (!v) return '';
  return typeof v === 'string' ? v : v[lang] || v.fr || '';
}

const UI = {
  fr: {
    teaching: 'Enseignement', allLevels: 'Tous les niveaux', allThemes: 'Tous les thèmes',
    byYear: 'Par année universitaire', byModule: 'Par module', noModule: 'Aucun module ne correspond.',
    inPreparation: 'En préparation', current: 'Version actuelle', archives: 'Archives',
    noResources: 'Les ressources de cette séance seront bientôt disponibles.',
    upcoming: 'À venir', draft: 'En préparation', ready: 'Disponible',
    sessions: 'Séances', year: 'Année', back: '← Tous les enseignements', openColab: 'Ouvrir dans Colab',
    download: 'Télécharger', details: 'Détails', level: 'Niveau', speciality: 'Spécialité',
    institution: 'Établissement', code: 'Code', license: 'Licence', hours: 'Volume horaire',
    repo: 'Dépôt GitHub', paper: 'Article', pdf: 'PDF', doi: 'DOI', research: 'Recherche',
    noResearch: 'Les travaux de recherche seront publiés prochainement.',
    noEdition: 'Ce module est en préparation : aucune séance n’est encore publiée.',
    about: 'À propos', themesTitle: 'Thèmes de recherche', career: 'Parcours', contact: 'Contact',
    cv: 'Télécharger mon CV', email: 'Écrire', summary: 'Bilan de l’enseignement',
    summaryIntro: 'Vue d’ensemble calculée à partir des modules publiés sur ce site.',
    modules: 'Modules', editionsLabel: 'Années', sessionsLabel: 'Séances', resourcesLabel: 'Ressources',
    totalHours: 'Heures déclarées', hoursNote: 'Les heures ne sont comptées que lorsqu’elles sont renseignées.',
    byLevel: 'Par niveau', byYearTitle: 'Par année', cm: 'CM', td: 'TD', tp: 'TP', total: 'Total',
    legal: 'Mentions légales', legalTitle: 'Mentions légales',
    editor: 'Éditeur du site', host: 'Hébergeur', cookies: 'Cookies et données personnelles',
    cookiesText: 'Ce site ne dépose aucun cookie de suivi, n’utilise aucun outil de mesure d’audience et ne collecte aucune donnée personnelle sur ses visiteurs.',
    contentLicense: 'Propriété intellectuelle',
    contentText: 'Sauf mention contraire sur la page d’un module, les contenus de ce site sont la propriété de leur auteur.',
    types: {cours: 'Cours', td: 'TD', tp: 'TP', notebook: 'Notebook', data: 'Données', kit: 'Kit de départ', qcm: 'QCM', corrige: 'Corrigé', autre: 'Autre'},
  },
  en: {
    teaching: 'Teaching', allLevels: 'All levels', allThemes: 'All topics',
    byYear: 'By academic year', byModule: 'By module', noModule: 'No module matches.',
    inPreparation: 'In preparation', current: 'Current version', archives: 'Archives',
    noResources: 'Resources for this session will be available soon.',
    upcoming: 'Upcoming', draft: 'In preparation', ready: 'Available',
    sessions: 'Sessions', year: 'Year', back: '← All courses', openColab: 'Open in Colab',
    download: 'Download', details: 'Details', level: 'Level', speciality: 'Speciality',
    institution: 'Institution', code: 'Code', license: 'License', hours: 'Teaching hours',
    repo: 'GitHub repository', paper: 'Paper', pdf: 'PDF', doi: 'DOI', research: 'Research',
    noResearch: 'Research work will be published soon.',
    noEdition: 'This module is in preparation: no session has been published yet.',
    about: 'About', themesTitle: 'Research topics', career: 'Career', contact: 'Contact',
    cv: 'Download my CV', email: 'Email', summary: 'Teaching summary',
    summaryIntro: 'Overview computed from the modules published on this site.',
    modules: 'Modules', editionsLabel: 'Years', sessionsLabel: 'Sessions', resourcesLabel: 'Resources',
    totalHours: 'Declared hours', hoursNote: 'Hours are only counted when they have been entered.',
    byLevel: 'By level', byYearTitle: 'By year', cm: 'Lectures', td: 'Tutorials', tp: 'Labs', total: 'Total',
    legal: 'Legal notice', legalTitle: 'Legal notice',
    editor: 'Site publisher', host: 'Hosting', cookies: 'Cookies and personal data',
    cookiesText: 'This site sets no tracking cookies, uses no analytics and collects no personal data about its visitors.',
    contentLicense: 'Intellectual property',
    contentText: 'Unless stated otherwise on a module page, the content of this site belongs to its author.',
    types: {cours: 'Lecture', td: 'Tutorial', tp: 'Lab', notebook: 'Notebook', data: 'Data', kit: 'Starter kit', qcm: 'Quiz', corrige: 'Solutions', autre: 'Other'},
  },
};

export function useUI() {
  return UI[useLang()];
}
