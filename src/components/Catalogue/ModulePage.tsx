import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLang, useUI, pick, type Edition, type Module, type Options, type Resource, type Session} from './i18n';
import styles from './styles.module.css';
import extra from './extra.module.css';

function ResourceButton({r}: {r: Resource}): ReactNode {
  const lang = useLang();
  const ui = useUI();
  const {siteConfig} = useDocusaurusContext();
  const fileHref = useBaseUrl('/' + (r.file ?? '').replace(/^\/+/, ''));
  const href = r.url ?? fileHref;
  const external = Boolean(r.url);
  const label = `${ui.types[r.type as keyof typeof ui.types] ?? r.type}${r.title ? ' : ' + pick(r.title, lang) : ''}`;
  const colab = `https://colab.research.google.com/github/${siteConfig.organizationName}/${siteConfig.projectName}/blob/main/static/${r.file}`;
  return (
    <>
      <a className="button button--primary button--sm" href={href} {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {download: true})}>{label}</a>
      {r.colab && r.file && <a className="button button--secondary button--sm" href={colab} target="_blank" rel="noopener noreferrer">{ui.openColab}</a>}
    </>
  );
}

function SessionBlock({s}: {s: Session}): ReactNode {
  const lang = useLang();
  const ui = useUI();
  return (
    <div className={styles.session}>
      <h4>
        <span className={styles.badge}>{s.label}</span>
        {pick(s.title, lang)}
        {s.status !== 'ready' && <span className={`${styles.badge} ${styles.badgeSoon}`}>{ui[s.status]}</span>}
      </h4>
      {s.resources.length === 0
        ? <p className={styles.empty}>{ui.noResources}</p>
        : <div className={styles.resources}>{s.resources.map((r, i) => <ResourceButton key={i} r={r} />)}</div>}
    </div>
  );
}

type Props = {data: {module: Module; options: Options}};

export default function ModulePage({data}: Props): ReactNode {
  const lang = useLang();
  const ui = useUI();
  const m = data.module;
  const years = [...m.editions].sort((a, b) => b.year.localeCompare(a.year));
  const lic = m.license ? data.options.licenses?.[m.license] : undefined;
  const hoursText = (h: Edition['hours']): string =>
    h ? ([['cm', ui.cm], ['td', ui.td], ['tp', ui.tp]] as const).filter(([k]) => h[k]).map(([k, l]) => `${h[k]} h ${l}`).join(' · ') : '';

  return (
    <Layout title={pick(m.title, lang)} description={pick(m.summary, lang)}>
      <main className="container margin-vert--lg">
        <Link to="/enseignement">{ui.back}</Link>
        <h1>{pick(m.title, lang)}</h1>
        <p>{pick(m.summary, lang)}</p>
        {m.links?.repo && (
          <p><a className="button button--outline button--primary" href={m.links.repo} target="_blank" rel="noopener noreferrer">{ui.repo} ↗</a></p>
        )}
        <dl className={styles.meta}>
          {m.code && <><dt>{ui.code}</dt><dd>{m.code}</dd></>}
          {m.level && <><dt>{ui.level}</dt><dd>{m.level}</dd></>}
          {m.speciality && <><dt>{ui.speciality}</dt><dd>{m.speciality}</dd></>}
          {m.institution && <><dt>{ui.institution}</dt><dd>{m.institution}</dd></>}
        </dl>

        {lic && (
          <p className={extra.licence}>{ui.license} : {lic.url ? <a href={lic.url} target="_blank" rel="noopener noreferrer">{lic.label}</a> : lic.label}</p>
        )}

        {years.length === 0 && <p className={styles.empty}>{ui.noEdition}</p>}
        {years.map((e, i) => (
          <section key={e.year} className={styles.yearBlock}>
            <h2>{e.year} {i === 0 ? <span className={styles.badge}>{ui.current}</span> : <span className={styles.badge}>{ui.archives}</span>}</h2>
            {hoursText(e.hours) && <p className={extra.licence}>{ui.hours} : {hoursText(e.hours)}</p>}
            {e.links?.repo && e.links.repo !== m.links?.repo && (
              <p><a href={e.links.repo} target="_blank" rel="noopener noreferrer">{ui.repo} ({e.year}) ↗</a></p>
            )}
            {e.sessions.map((s) => <SessionBlock key={s.id} s={s} />)}
          </section>
        ))}
      </main>
    </Layout>
  );
}
