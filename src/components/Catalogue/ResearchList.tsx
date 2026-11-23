import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import {useLang, useUI, pick, type Research} from './i18n';
import styles from './styles.module.css';

type Props = {data: {research: Research[]}};

export default function ResearchList({data}: Props): ReactNode {
  const lang = useLang();
  const ui = useUI();
  const items = [...data.research].sort((a, b) => String(b.year ?? '').localeCompare(String(a.year ?? '')));
  const link = (href: string | undefined, label: string) =>
    href ? <a className="button button--outline button--primary button--sm" href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a> : null;

  return (
    <Layout title={ui.research}>
      <main className="container margin-vert--lg">
        <h1>{ui.research}</h1>
        {items.length === 0 && <p className={styles.empty}>{ui.noResearch}</p>}
        {items.map((r) => (
          <article key={r.id} className={styles.session}>
            <h4>
              {r.year && <span className={styles.badge}>{r.year}</span>}
              {pick(r.title, lang)}
            </h4>
            {(r.authors || r.venue) && <p>{[r.authors, r.venue].filter(Boolean).join(' · ')}</p>}
            {r.abstract && <p>{pick(r.abstract, lang)}</p>}
            <div className={styles.resources}>
              {link(r.links.paper, ui.paper)}
              {link(r.links.pdf, ui.pdf)}
              {link(r.links.doi, ui.doi)}
              {link(r.links.repo, ui.repo)}
            </div>
          </article>
        ))}
      </main>
    </Layout>
  );
}
