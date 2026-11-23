import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useLang, useUI, pick, type Profile} from './i18n';
import styles from './extra.module.css';

const LINK_LABELS: Record<string, string> = {github: 'GitHub', linkedin: 'LinkedIn', orcid: 'ORCID', hal: 'HAL', scholar: 'Google Scholar'};

export default function About({data}: {data: Profile}): ReactNode {
  const lang = useLang();
  const ui = useUI();
  const photo = useBaseUrl('/' + (data.photo || ''));
  const cvPath = data.cv[lang] || data.cv.fr || data.cv.en || '';
  const cv = useBaseUrl('/' + cvPath);
  const links = Object.entries(data.links).filter(([, v]) => v);

  return (
    <Layout title={ui.about} description={pick(data.bio, lang)}>
      <main className="container margin-vert--lg">
        <div className={styles.profile}>
          {data.photo && <img className={styles.photo} src={photo} alt={data.name} />}
          <div>
            <h1 style={{marginBottom: '.2rem'}}>{data.name}</h1>
            <p className={styles.role}>{pick(data.role, lang)}</p>
            <p className={styles.role}>{pick(data.affiliation, lang)}</p>
            <div className={styles.buttons}>
              {cvPath && <a className="button button--primary" href={cv} download>{ui.cv}</a>}
              {data.email && <a className="button button--outline button--primary" href={`mailto:${data.email}`}>{ui.email}</a>}
              {links.map(([k, v]) => (
                <a key={k} className="button button--outline button--primary" href={v} target="_blank" rel="noopener noreferrer">{LINK_LABELS[k] ?? k} ↗</a>
              ))}
            </div>
          </div>
        </div>

        {pick(data.bio, lang) && <p className={styles.bio}>{pick(data.bio, lang)}</p>}

        {data.themes.length > 0 && (
          <section>
            <h2>{ui.themesTitle}</h2>
            <div className={styles.chips}>{data.themes.map((t, i) => <span key={i} className={styles.chip}>{pick(t, lang)}</span>)}</div>
          </section>
        )}

        {data.timeline.length > 0 && (
          <section>
            <h2>{ui.career}</h2>
            <ol className={styles.timeline}>
              {data.timeline.map((t, i) => (
                <li key={i}>
                  <span className={styles.period}>{t.period}</span>
                  <strong>{pick(t.title, lang)}</strong>
                  {t.place && <span> · {t.place}</span>}
                  {t.detail && <p>{pick(t.detail, lang)}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
    </Layout>
  );
}
