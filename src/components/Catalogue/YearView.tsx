import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useLang, useUI, pick, type Module, type Options} from './i18n';
import styles from './styles.module.css';

type Props = {catalogue: {options: Options; modules: Module[]}};

export default function YearView({catalogue}: Props): ReactNode {
  const lang = useLang();
  const ui = useUI();
  const byYear = new Map<string, Module[]>();
  for (const m of catalogue.modules) {
    for (const e of m.editions) {
      byYear.set(e.year, [...(byYear.get(e.year) ?? []), m]);
    }
  }
  const years = [...byYear.keys()].sort().reverse();

  return (
    <Layout title={ui.byYear}>
      <main className="container margin-vert--lg">
        <Link to="/enseignement">← {ui.byModule}</Link>
        <h1>{ui.byYear}</h1>
        {years.map((y) => (
          <section key={y} className={styles.yearBlock}>
            <h2>{y}</h2>
            <ul>
              {byYear.get(y)!.map((m) => (
                <li key={m.id}>
                  <Link to={`/enseignement/${m.id}`}>{pick(m.title, lang)}</Link>
                  {m.level && <> ({m.level}{m.institution ? `, ${m.institution}` : ''})</>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </Layout>
  );
}
