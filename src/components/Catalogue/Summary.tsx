import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useUI, type Module, type Options} from './i18n';
import styles from './extra.module.css';

type Props = {catalogue: {options: Options; modules: Module[]}};
type Row = {cm: number; td: number; tp: number};
const empty = (): Row => ({cm: 0, td: 0, tp: 0});
const sum = (r: Row) => r.cm + r.td + r.tp;

export default function Summary({catalogue}: Props): ReactNode {
  const ui = useUI();
  const published = catalogue.modules.filter((m) => m.editions.length > 0);
  const byYear = new Map<string, Row>();
  const byLevel = new Map<string, Row>();
  let sessions = 0;
  let resources = 0;
  const years = new Set<string>();
  for (const m of published) {
    for (const e of m.editions) {
      years.add(e.year);
      sessions += e.sessions.length;
      resources += e.sessions.reduce((n, s) => n + s.resources.length, 0);
      const y = byYear.get(e.year) ?? empty();
      const l = byLevel.get(m.level || '—') ?? empty();
      for (const k of ['cm', 'td', 'tp'] as const) {
        y[k] += e.hours?.[k] ?? 0;
        l[k] += e.hours?.[k] ?? 0;
      }
      byYear.set(e.year, y);
      byLevel.set(m.level || '—', l);
    }
  }
  const grand = [...byYear.values()].reduce((n, r) => n + sum(r), 0);

  const table = (title: string, rows: Map<string, Row>, keys: string[]) => (
    <section>
      <h2>{title}</h2>
      <table className={styles.table}>
        <thead><tr><th /><th>{ui.cm}</th><th>{ui.td}</th><th>{ui.tp}</th><th>{ui.total}</th></tr></thead>
        <tbody>
          {keys.map((k) => {
            const r = rows.get(k)!;
            return <tr key={k}><td>{k}</td><td>{r.cm}</td><td>{r.td}</td><td>{r.tp}</td><td><strong>{sum(r)}</strong></td></tr>;
          })}
        </tbody>
      </table>
    </section>
  );

  const stat = (n: number | string, label: string) => (
    <div className={styles.stat}><div className={styles.statNum}>{n}</div><div>{label}</div></div>
  );

  return (
    <Layout title={ui.summary}>
      <main className="container margin-vert--lg">
        <Link to="/enseignement">{ui.back}</Link>
        <h1>{ui.summary}</h1>
        <p>{ui.summaryIntro}</p>
        <div className={styles.stats}>
          {stat(published.length, ui.modules)}
          {stat(years.size, ui.editionsLabel)}
          {stat(sessions, ui.sessionsLabel)}
          {stat(resources, ui.resourcesLabel)}
          {stat(grand, ui.totalHours)}
        </div>
        <p className={styles.note}>{ui.hoursNote}</p>
        {grand > 0 && table(ui.byYearTitle, byYear, [...byYear.keys()].sort().reverse())}
        {grand > 0 && table(ui.byLevel, byLevel, [...byLevel.keys()].sort())}
      </main>
    </Layout>
  );
}
