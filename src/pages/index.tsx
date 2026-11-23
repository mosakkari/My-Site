import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {usePluginData} from '@docusaurus/useGlobalData';
import NewsCarousel from '../components/News/NewsCarousel';
import CardArt from '../components/News/CardArt';
import styles from './index.module.css';

// Accueil = vitrine de profil : texte minimal, le carrousel d'actualites porte le contenu.
const TEXT = {
  fr: {
    role: 'Enseignant-chercheur · IUT de La Rochelle · L3i',
    tagline: 'Enseignement, R&D et expérience industrielle.',
    description: 'Mohamed SAKKARI, enseignant-chercheur : enseignement, recherche & développement et expérience industrielle.',
    cta: 'À propos',
    cta2: 'Enseignements',
    cta3: 'R&D',
    pillars: [
      {id: 'teaching', title: 'Enseignement', text: 'Cours, TD et TP en BUT Informatique.'},
      {id: 'rd', title: 'Recherche & développement', text: 'Données et intelligence artificielle.'},
      {id: 'industry', title: 'Expérience industrielle', text: 'Développement en entreprise.'},
    ],
  },
  en: {
    role: 'Lecturer-researcher · IUT de La Rochelle · L3i',
    tagline: 'Teaching, R&D and industry experience.',
    description: 'Mohamed SAKKARI, lecturer-researcher: teaching, research & development and industry experience.',
    cta: 'About',
    cta2: 'Teaching',
    cta3: 'R&D',
    pillars: [
      {id: 'teaching', title: 'Teaching', text: 'Lectures, tutorials and labs in Computer Science (BUT).'},
      {id: 'rd', title: 'Research & development', text: 'Data and artificial intelligence.'},
      {id: 'industry', title: 'Industry experience', text: 'Software development in industry.'},
    ],
  },
};

export default function Home(): ReactNode {
  const {siteConfig, i18n} = useDocusaurusContext();
  const t = TEXT[i18n.currentLocale === 'en' ? 'en' : 'fr'];
  const {sections} = usePluginData('catalogue-plugin') as {sections: {rd: boolean; industrie: boolean}};
  // Chaque repere pointe vers une section qui existe vraiment sur la page A propos (sinon vers la page la plus proche).
  const target: Record<string, string> = {
    teaching: '/enseignement',
    rd: sections?.rd ? '/apropos#rd' : '/recherche',
    industry: sections?.industrie ? '/apropos#industrie' : '/apropos',
  };
  return (
    <Layout title={siteConfig.title} description={t.description}>
      <header className={styles.heroBanner}>
        <div className={styles.heroArt} aria-hidden="true">
          <CardArt seed="mohamed-sakkari" type="hero" cols={26} rows={14} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <p className={styles.role}>{t.role}</p>
          <h1 className={styles.name}>{siteConfig.title}</h1>
          <p className={styles.tagline}>{t.tagline}</p>
          <div className={styles.buttons}>
            <Link className={styles.btnMain} to="/apropos">{t.cta}</Link>
            <Link className={styles.btnGhost} to="/enseignement">{t.cta2}</Link>
            <Link className={styles.btnGhost} to={target.rd}>{t.cta3}</Link>
          </div>
        </div>
      </header>
      <main className="container">
        <NewsCarousel />
        <div className={styles.pillars}>
          {t.pillars.map((p) => (
            <Link key={p.id} to={target[p.id]} className={styles.pillar}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}
