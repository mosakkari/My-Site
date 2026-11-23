import type {ReactNode} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type {Lang} from '../Catalogue/i18n';
import {TYPE_COLOR, TYPE_LABEL, UI, factLines, formatDate, pickText, statusLabel, typeStyle, type NewsItem} from './shared';
import CardArt from './CardArt';
import styles from './news.module.css';

/** Une actualite : visuel en haut, peu de texte, lien. Identique dans le carrousel et sur la page d'archive. */
export default function NewsCard({n, lang, label}: {n: NewsItem; lang: Lang; label?: string}): ReactNode {
  const ui = UI[lang];
  const facts = factLines(n, lang);
  const status = statusLabel(n.status, lang);
  const imgSrc = useBaseUrl('/' + (n.image ?? '').replace(/^\/+/, ''));
  const typeLabel = TYPE_LABEL[lang][n.type] ?? n.type;
  const title = pickText(n.title, lang);
  const text = pickText(n.text, lang);

  const body = (
    <>
      <div className={styles.meta}>
        <span className={styles.badge}>{typeLabel}</span>
        {status && <span className={styles.status}>{status}</span>}
        {n.pinned && <span className={styles.pin} title={ui.pinned}>★ {ui.pinned}</span>}
      </div>
      <time className={styles.date} dateTime={n.date}>{formatDate(n.date, lang)}</time>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {facts.length > 0 && (
        <dl className={styles.facts}>
          {facts.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      )}
      {n.link && <a href={n.link} target="_blank" rel="noopener noreferrer">{ui.more} ↗</a>}
    </>
  );

  return (
    <article className={styles.card} style={typeStyle(n.type)} aria-roledescription="slide" aria-label={label}>
      {n.image ? (
        <div className={`${styles.media} ${n.imageFit === 'contain' ? styles.mediaContain : ''}`}>
          <img src={imgSrc} alt={pickText(n.imageAlt, lang)} loading="lazy" />
        </div>
      ) : (
        <div className={styles.media} aria-hidden="true">
          <CardArt seed={n.id} color={TYPE_COLOR[n.type]?.light} />
        </div>
      )}
      <div className={styles.body}>{body}</div>
    </article>
  );
}
