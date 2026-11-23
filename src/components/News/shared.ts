import type {CSSProperties} from 'react';
import {useLang, type Lang, type Loc} from '../Catalogue/i18n';

export type NewsType = 'nouvelle' | 'projet' | 'publication' | 'recherche' | 'participation' | 'enseignement';
export type NewsStatus = 'en-cours' | 'soumis' | 'accepte' | 'publie';

export type NewsItem = {
  id: string;
  date: string; // AAAA-MM-JJ
  type: NewsType;
  title: Loc;
  text?: Loc;
  status?: NewsStatus; // projet / publication : ou en est-on ?
  with?: string; // « en collaboration avec … »
  context?: Loc; // « dans le cadre de … »
  venue?: string; // revue, conference, lieu
  link?: string;
  image?: string; // chemin sous static/, ex. img/news/figure-sr.png : photo, figure d'article...
  imageAlt?: Loc; // description de l'image (vide = image decorative)
  imageFit?: 'cover' | 'contain'; // contain : une figure ou un schema n'est pas rogne
  pinned?: boolean; // reste en tete du carrousel
  archiveOnly?: boolean; // visible sur /actualites seulement
};

export const TYPE_LABEL: Record<Lang, Record<string, string>> = {
  fr: {nouvelle: 'Nouvelle', projet: 'Projet', publication: 'Publication', recherche: 'Recherche', participation: 'Événement', enseignement: 'Enseignement'},
  en: {nouvelle: 'News', projet: 'Project', publication: 'Publication', recherche: 'Research', participation: 'Event', enseignement: 'Teaching'},
};

/**
 * CHARTE DES COULEURS : une teinte par type d'actualite, definie ici et nulle part ailleurs.
 * `light` : theme clair (texte blanc dessus, contraste >= 4,5) ; `dark` : theme sombre (texte noir dessus).
 * Le badge porte toujours le nom du type : la couleur n'est jamais le seul indice (daltonisme).
 */
export const TYPE_COLOR: Record<NewsType, {light: string; dark: string}> = {
  participation: {light: '#1d4ed8', dark: '#60a5fa'}, // evenement : bleu
  publication: {light: '#15803d', dark: '#4ade80'}, // article : vert
  recherche: {light: '#6d28d9', dark: '#a78bfa'}, // recherche : violet
  projet: {light: '#c2410c', dark: '#fb923c'}, // projet en cours : orange
  enseignement: {light: '#be185d', dark: '#f472b6'}, // enseignement : rose
  nouvelle: {light: '#475569', dark: '#94a3b8'}, // information generale : ardoise
};

/** Variables CSS de la couleur du type (lues par news.module.css : --tc-l clair, --tc-d sombre). */
export function typeStyle(type: string): CSSProperties | undefined {
  const c = TYPE_COLOR[type as NewsType];
  return c ? ({'--tc-l': c.light, '--tc-d': c.dark} as CSSProperties) : undefined;
}

const STATUS_LABEL: Record<Lang, Record<string, string>> = {
  fr: {'en-cours': 'En cours', soumis: 'Soumis', accepte: 'Accepté', publie: 'Publié'},
  en: {'en-cours': 'In progress', soumis: 'Submitted', accepte: 'Accepted', publie: 'Published'},
};

const FACT = {
  fr: {with: 'En collaboration avec', context: 'Dans le cadre de', venue: 'Lieu', submitted: 'Soumis à', accepted: 'Accepté à', published: 'Publié dans'},
  en: {with: 'In collaboration with', context: 'As part of', venue: 'Venue', submitted: 'Submitted to', accepted: 'Accepted at', published: 'Published in'},
};

export const UI = {
  fr: {title: 'Actualités', prev: 'Actualités précédentes', next: 'Actualités suivantes', goto: 'Aller à la page', all: 'Toutes les actualités', more: 'En savoir plus', pause: 'Pause', play: 'Lecture automatique', empty: 'Aucune actualité pour le moment.', home: '← Accueil', pinned: 'À la une', filter: 'Filtrer par type', allTypes: 'Tout'},
  en: {title: 'News', prev: 'Previous news', next: 'Next news', goto: 'Go to page', all: 'All news', more: 'Read more', pause: 'Pause', play: 'Play automatically', empty: 'No news yet.', home: '← Home', pinned: 'Featured', filter: 'Filter by type', allTypes: 'All'},
};

export const pickText = (l: Loc | undefined, lang: Lang): string => (l ? l[lang] || l.fr || l.en || '' : '');

export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
}

export function statusLabel(s: NewsStatus | undefined, lang: Lang): string {
  return s ? STATUS_LABEL[lang][s] ?? '' : '';
}

/** Lignes « libelle : valeur » composees a partir des champs renseignes (dans la langue du visiteur). */
export function factLines(n: NewsItem, lang: Lang): Array<[string, string]> {
  const t = FACT[lang];
  const out: Array<[string, string]> = [];
  if (n.with) out.push([t.with, n.with]);
  const ctx = pickText(n.context, lang);
  if (ctx) out.push([t.context, ctx]);
  if (n.venue) {
    const label = n.status === 'publie' ? t.published : n.status === 'accepte' ? t.accepted : n.status === 'soumis' ? t.submitted : t.venue;
    out.push([label, n.venue]);
  }
  return out;
}

export function useNewsLang() {
  const lang = useLang();
  return {lang, ui: UI[lang]};
}
