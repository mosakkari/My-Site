import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {usePluginData} from '@docusaurus/useGlobalData';
import NewsCard from './NewsCard';
import {useNewsLang, type NewsItem} from './shared';
import styles from './news.module.css';

const MAX_ITEMS = 12;
const DELAY_MS = 3000; // temps entre deux cartes (la barre de progression suit cette valeur)

// Nombre de cartes visibles : doit rester identique aux media queries de news.module.css
function cardsPerView(): number {
  if (typeof window === 'undefined') return 3;
  if (window.matchMedia('(max-width: 640px)').matches) return 1;
  if (window.matchMedia('(max-width: 996px)').matches) return 2;
  if (window.matchMedia('(min-width: 1200px)').matches) return 4;
  return 3;
}

/**
 * Deux modes, choisis automatiquement :
 *  - defilement : plus de cartes que de places -> la piste defile (doigt, molette, clavier, boutons, lecture auto) ;
 *  - rotation   : peu de cartes (tout tient a l'ecran) -> elles tournent en boucle avec une animation de glissement,
 *                 pour que le carrousel reste vivant meme avec 2 ou 3 actualites.
 * Une seule carte ne peut evidemment pas bouger.
 */
export default function NewsCarousel(): ReactNode {
  const {news} = usePluginData('catalogue-plugin') as {news: NewsItem[]};
  const {lang, ui} = useNewsLang();
  // Deja trie par le plugin : epingles d'abord, puis du plus recent au plus ancien.
  const items = (news ?? []).filter((n) => !n.archiveOnly).slice(0, MAX_ITEMS);
  const scroller = useRef<HTMLDivElement>(null);
  const [perView, setPerView] = useState(3);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [rot, setRot] = useState(0);
  const [focused, setFocused] = useState(false); // focus clavier : on ne fait pas defiler sous les doigts de l'utilisateur
  const [paused, setPaused] = useState(false);

  const n = items.length;
  const rotating = n > 1 && n <= perView;
  const positions = rotating ? n : Math.max(1, n - perView + 1);
  const current = rotating ? rot % n : scrollIndex;
  const moving = positions > 1;
  // Pas de pause au survol de la souris : le carrousel doit rester vivant. Pause = bouton, balayage tactile ou clavier.
  const auto = moving && !paused && !focused;
  const moved = useRef(false); // vrai des que la rotation a demarre : pas d'animation d'entree au tout premier affichage
  if (rotating && current !== 0) moved.current = true;

  useEffect(() => {
    const update = () => setPerView(cardsPerView());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cellWidth = useCallback(() => {
    const el = scroller.current;
    return el && n ? el.scrollWidth / n : 0;
  }, [n]);

  const goTo = useCallback((i: number) => {
    const target = ((i % positions) + positions) % positions;
    if (rotating) {
      setRot(target);
      return;
    }
    scroller.current?.scrollTo({left: target * cellWidth(), behavior: 'smooth'});
  }, [positions, rotating, cellWidth]);

  // En mode defilement, l'index suit le defilement reel (doigt, molette, boutons ou lecture automatique).
  const onScroll = useCallback(() => {
    const el = scroller.current;
    const w = cellWidth();
    if (!el || !w) return;
    setScrollIndex(Math.min(positions - 1, Math.max(0, Math.round(el.scrollLeft / w))));
  }, [cellWidth, positions]);

  useEffect(() => {
    if (!auto) return undefined;
    const t = setTimeout(() => goTo(current + 1), DELAY_MS);
    return () => clearTimeout(t);
  }, [auto, current, goTo]);

  if (n === 0) return null;

  // Mode rotation : on affiche les cartes decalees de `current` ; la premiere passe a la fin.
  const list = rotating ? [...items.slice(current), ...items.slice(0, current)] : items;
  const emphasis = perView >= 3 && n >= 3;

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label={ui.title}
      onFocus={(e) => { if (e.target.matches(':focus-visible')) setFocused(true); }}
      onBlur={() => setFocused(false)}>
      <div className={styles.head}>
        <h2>{ui.title}</h2>
        <Link className={styles.allLink} to="/actualites">{ui.all} →</Link>
      </div>

      <div
        key={rotating ? `rot-${current}` : 'scroll'}
        ref={scroller}
        className={rotating && moved.current ? `${styles.viewport} ${styles.viewportEnter}` : styles.viewport}
        tabIndex={0}
        role="group"
        aria-label={ui.title}
        onScroll={onScroll}
        onTouchStart={() => setPaused(true)} /* le visiteur prend la main : on arrete la lecture automatique */
        aria-live={auto ? 'off' : 'polite'}>
        {list.map((item, i) => {
          // Effet « galerie » : une seule carte est mise en avant, la deuxieme ; les autres s'estompent.
          // A chaque passage la carte suivante prend cette place.
          const pos = rotating ? i : i - current;
          const featured = emphasis && pos === 1;
          const cls = `${styles.cell} ${emphasis ? (featured ? styles.cellFeatured : styles.cellDim) : ''}`;
          return (
            <div key={item.id} className={cls}>
              <NewsCard n={item} lang={lang} label={`${items.indexOf(item) + 1} / ${n}`} />
            </div>
          );
        })}
      </div>

      {moving && (
        <div className={styles.progress} aria-hidden="true">
          {/* se remplit pendant DELAY_MS puis la carte suivante arrive ; repart de zero a chaque changement */}
          <span
            key={`${current}-${auto}`}
            className={auto ? styles.progressBar : styles.progressIdle}
            style={{animationDuration: `${DELAY_MS}ms`}}
          />
        </div>
      )}

      {moving && (
        <div className={styles.controls}>
          <button type="button" className={styles.arrow} onClick={() => goTo(current - 1)} aria-label={ui.prev}>‹</button>
          <div className={styles.dots}>
            {Array.from({length: positions}, (_, i) => (
              <button key={i} type="button" className={i === current ? styles.dotOn : styles.dot} onClick={() => goTo(i)} aria-label={`${ui.goto} ${i + 1}`} aria-current={i === current} />
            ))}
          </div>
          <button type="button" className={styles.arrow} onClick={() => goTo(current + 1)} aria-label={ui.next}>›</button>
          <button type="button" className={styles.pause} onClick={() => setPaused((p) => !p)} aria-label={paused ? ui.play : ui.pause}>{paused ? '▶' : '⏸'}</button>
        </div>
      )}
    </section>
  );
}
