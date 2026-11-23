import {useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useLang, useUI, pick, type Module, type Options} from './i18n';
import styles from './styles.module.css';

type Props = {catalogue: {options: Options; modules: Module[]}};

export default function ModuleList({catalogue}: Props): ReactNode {
  const lang = useLang();
  const ui = useUI();
  const [level, setLevel] = useState('');
  const [theme, setTheme] = useState('');
  const {options, modules} = catalogue;

  const shown = modules.filter((m) => (!level || m.level === level) && (!theme || m.theme === theme));

  return (
    <Layout title={ui.teaching}>
      <main className="container margin-vert--lg">
        <h1>{ui.teaching}</h1>
        <div className={styles.toolbar}>
          <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label={ui.level}>
            <option value="">{ui.allLevels}</option>
            {options.levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} aria-label="theme">
            <option value="">{ui.allThemes}</option>
            {Object.entries(options.themes).map(([k, v]) => <option key={k} value={k}>{pick(v, lang)}</option>)}
          </select>
          <Link to="/enseignement/annees">{ui.byYear} →</Link>
          <Link to="/enseignement/bilan">{ui.summary} →</Link>
        </div>

        {shown.length === 0 && <p>{ui.noModule}</p>}
        <div className={styles.grid}>
          {shown.map((m) => (
            <Link key={m.id} to={`/enseignement/${m.id}`} className={styles.card}>
              <div className={styles.badges}>
                {m.level && <span className={`${styles.badge} ${styles.badgeLevel}`}>{m.level}</span>}
                {m.code && <span className={styles.badge}>{m.code}</span>}
                {m.editions.length === 0 && <span className={`${styles.badge} ${styles.badgeSoon}`}>{ui.inPreparation}</span>}
              </div>
              <h3>{pick(m.title, lang)}</h3>
              <p>{pick(m.summary, lang)}</p>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}
