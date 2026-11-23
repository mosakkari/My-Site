import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {useLang, useUI, pick, type Profile, type Research, type TimelineItem} from './i18n';
import styles from './extra.module.css';

const LINK_LABELS: Record<string, string> = {github: 'GitHub', linkedin: 'LinkedIn', orcid: 'ORCID', hal: 'HAL', scholar: 'Google Scholar'};

const T = {
  fr: {
    teaching: 'Enseignement', rd: 'Recherche & développement', industry: 'Expérience industrielle', other: 'Autres étapes',
    seeCourses: 'Voir mes enseignements', recent: 'Publications récentes', allPubs: 'Toutes mes publications', topics: 'Thèmes de recherche',
  },
  en: {
    teaching: 'Teaching', rd: 'Research & development', industry: 'Industry experience', other: 'Other steps',
    seeCourses: 'Browse my courses', recent: 'Recent publications', allPubs: 'All my publications', topics: 'Research topics',
  },
};

type Data = {profile: Profile; research: Research[]; sections: {rd: boolean; industrie: boolean; enseignement: boolean}};

function Timeline({items}: {items: TimelineItem[]}): ReactNode {
  const lang = useLang();
  return (
    <ol className={styles.timeline}>
      {items.map((t, i) => (
        <li key={i}>
          <span className={styles.period}>{t.period}</span>
          <strong>{pick(t.title, lang)}</strong>
          {t.place && <span> · {t.place}</span>}
          {t.detail && pick(t.detail, lang) && <p>{pick(t.detail, lang)}</p>}
        </li>
      ))}
    </ol>
  );
}

export default function About({data}: {data: Data}): ReactNode {
  const {profile, research} = data;
  const lang = useLang();
  const ui = useUI();
  const t = T[lang];
  const photo = useBaseUrl('/' + (profile.photo || ''));
  const cvPath = profile.cv[lang] || profile.cv.fr || profile.cv.en || '';
  const cv = useBaseUrl('/' + cvPath);
  const links = Object.entries(profile.links).filter(([, v]) => v);

  const by = (c: string) => profile.timeline.filter((x) => x.category === c);
  const teaching = by('enseignement');
  const rdItems = by('rd');
  const industry = by('industrie');
  const others = profile.timeline.filter((x) => !x.category);
  const latest = [...research].sort((a, b) => String(b.year ?? '').localeCompare(String(a.year ?? ''))).slice(0, 5);
  const showRd = latest.length > 0 || profile.themes.length > 0 || rdItems.length > 0;

  // Declare les ancres a Docusaurus : sans cela, le verificateur de liens croit « /apropos#rd » casse.
  const brokenLinks = useBrokenLinks();
  if (teaching.length > 0) brokenLinks.collectAnchor('enseignement');
  if (showRd) brokenLinks.collectAnchor('rd');
  if (industry.length > 0) brokenLinks.collectAnchor('industrie');
  if (others.length > 0) brokenLinks.collectAnchor('parcours');

  return (
    <Layout title={ui.about} description={pick(profile.bio, lang)}>
      <main className="container margin-vert--lg">
        <div className={styles.profile}>
          {profile.photo && <img className={styles.photo} src={photo} alt={profile.name} />}
          <div>
            <h1 style={{marginBottom: '.2rem'}}>{profile.name}</h1>
            <p className={styles.role}>{pick(profile.role, lang)}</p>
            <p className={styles.role}>{pick(profile.affiliation, lang)}</p>
            <div className={styles.buttons}>
              {cvPath && <a className="button button--primary" href={cv} download>{ui.cv}</a>}
              {profile.email && <a className="button button--outline button--primary" href={`mailto:${profile.email}`}>{ui.email}</a>}
              {links.map(([k, v]) => (
                <a key={k} className="button button--outline button--primary" href={v} target="_blank" rel="noopener noreferrer">{LINK_LABELS[k] ?? k} ↗</a>
              ))}
            </div>
          </div>
        </div>

        {pick(profile.bio, lang) && <p className={styles.bio}>{pick(profile.bio, lang)}</p>}

        {/* Les trois sections suivent l'ordre des reperes de l'accueil. Une section vide n'est pas affichee. */}
        {teaching.length > 0 && (
          <section id="enseignement" className={styles.section}>
            <h2>{t.teaching}</h2>
            <Timeline items={teaching} />
            <p><Link className="button button--outline button--primary button--sm" to="/enseignement">{t.seeCourses} →</Link></p>
          </section>
        )}

        {showRd && (
          <section id="rd" className={styles.section}>
            <h2>{t.rd}</h2>
            {profile.themes.length > 0 && (
              <>
                <h3 className={styles.subTitle}>{t.topics}</h3>
                <div className={styles.chips}>{profile.themes.map((th, i) => <span key={i} className={styles.chip}>{pick(th, lang)}</span>)}</div>
              </>
            )}
            {rdItems.length > 0 && <Timeline items={rdItems} />}
            {latest.length > 0 && (
              <>
                <h3 className={styles.subTitle}>{t.recent}</h3>
                <ul className={styles.pubs}>
                  {latest.map((r) => (
                    <li key={r.id}>
                      <span className={styles.period}>{r.year}</span>
                      {r.links.paper
                        ? <a href={r.links.paper} target="_blank" rel="noopener noreferrer">{pick(r.title, lang)}</a>
                        : pick(r.title, lang)}
                      {r.venue && <span className={styles.venue}> · {r.venue}</span>}
                    </li>
                  ))}
                </ul>
                <p><Link className="button button--outline button--primary button--sm" to="/recherche">{t.allPubs} →</Link></p>
              </>
            )}
          </section>
        )}

        {industry.length > 0 && (
          <section id="industrie" className={styles.section}>
            <h2>{t.industry}</h2>
            <Timeline items={industry} />
          </section>
        )}

        {others.length > 0 && (
          <section id="parcours" className={styles.section}>
            <h2>{profile.timeline.length === others.length ? ui.career : t.other}</h2>
            <Timeline items={others} />
          </section>
        )}
      </main>
    </Layout>
  );
}
