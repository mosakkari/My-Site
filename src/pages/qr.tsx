import {useEffect, useRef, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import QRCode from 'qrcode';
import styles from './qr.module.css';

const TEXT = {
  fr: {
    title: 'QR code du site',
    intro: 'À projeter pendant une présentation : le public scanne et arrive directement sur la page choisie.',
    target: 'Page à partager',
    pages: [['/', 'Accueil'], ['/apropos', 'À propos'], ['/enseignement', 'Enseignement'], ['/recherche', 'Recherche'], ['/actualites', 'Actualités']],
    png: 'Télécharger en PNG',
    svg: 'Télécharger en SVG',
    full: 'Plein écran',
    exit: 'Quitter le plein écran',
    copy: 'Copier le lien',
    copied: 'Lien copié',
    alt: 'QR code vers',
    tip: 'Astuce : en plein écran, appuyez sur Échap pour revenir. Le QR code est noir sur blanc, avec une marge, pour rester lisible depuis le fond d’une salle.',
  },
  en: {
    title: 'Site QR code',
    intro: 'Display it during a talk: the audience scans it and lands on the page you chose.',
    target: 'Page to share',
    pages: [['/', 'Home'], ['/apropos', 'About'], ['/enseignement', 'Teaching'], ['/recherche', 'Research'], ['/actualites', 'News']],
    png: 'Download PNG',
    svg: 'Download SVG',
    full: 'Full screen',
    exit: 'Exit full screen',
    copy: 'Copy link',
    copied: 'Link copied',
    alt: 'QR code for',
    tip: 'Tip: in full screen, press Esc to go back. The code is black on white with a quiet zone so it stays readable from the back of a room.',
  },
};

function download(href: string, name: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function QrPage(): ReactNode {
  const {i18n} = useDocusaurusContext();
  const {withBaseUrl} = useBaseUrlUtils();
  const t = TEXT[i18n.currentLocale === 'en' ? 'en' : 'fr'];
  const [path, setPath] = useState('/');
  const [png, setPng] = useState('');
  const [copied, setCopied] = useState(false);
  const [full, setFull] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const {siteConfig} = useDocusaurusContext();

  // URL absolue : adresse du site + base (+ /en/ pour l'anglais) + page choisie
  const url = withBaseUrl(path, {absolute: true});
  const fileName = `qr-${(path === '/' ? 'accueil' : path.slice(1)).replace(/\W+/g, '-')}`;

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(url, {errorCorrectionLevel: 'M', margin: 4, width: 1024, color: {dark: '#000000', light: '#ffffff'}})
      .then((d) => { if (alive) setPng(d); })
      .catch(() => { if (alive) setPng(''); });
    return () => { alive = false; };
  }, [url]);

  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  const downloadSvg = async () => {
    const svg = await QRCode.toString(url, {type: 'svg', errorCorrectionLevel: 'M', margin: 4, color: {dark: '#000000', light: '#ffffff'}});
    const blob = new Blob([svg], {type: 'image/svg+xml'});
    const href = URL.createObjectURL(blob);
    download(href, `${fileName}.svg`);
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void box.current?.requestFullscreen?.();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* presse-papiers indisponible : le lien reste affiche a l'ecran */ }
  };

  return (
    <Layout title={t.title} description={t.intro}>
      <main className="container margin-vert--lg">
        <h1>{t.title}</h1>
        <p>{t.intro}</p>

        <div className={styles.layout}>
          <div ref={box} className={`${styles.stage} ${full ? styles.stageFull : ''}`}>
            {png ? <img className={styles.code} src={png} alt={`${t.alt} ${url}`} /> : <div className={styles.code} />}
            <p className={styles.url}>{url.replace(/^https?:\/\//, '')}</p>
            {full && <button type="button" className={styles.exit} onClick={toggleFull}>{t.exit}</button>}
          </div>

          <div className={styles.side}>
            <label className={styles.field}>
              <span>{t.target}</span>
              <select value={path} onChange={(e) => setPath(e.target.value)}>
                {t.pages.map(([p, l]) => <option key={p} value={p}>{l}</option>)}
              </select>
            </label>
            <button type="button" className="button button--primary button--block" onClick={toggleFull}>{t.full}</button>
            <button type="button" className="button button--secondary button--block" disabled={!png} onClick={() => download(png, `${fileName}.png`)}>{t.png}</button>
            <button type="button" className="button button--secondary button--block" onClick={downloadSvg}>{t.svg}</button>
            <button type="button" className="button button--outline button--primary button--block" onClick={copy}>{copied ? t.copied : t.copy}</button>
            <p className={styles.tip}>{t.tip}</p>
            <p className={styles.tip}>{siteConfig.url}{siteConfig.baseUrl}</p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
