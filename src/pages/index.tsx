import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

const TEXT = {
  fr: {
    role: 'Enseignant-chercheur, IUT de La Rochelle · L3i',
    intro: 'Bases de données, données et intelligence artificielle. Cours, TD et TP de la 2e et 3e année de BUT Informatique. (Test de publication)',
    cta: 'Voir les enseignements',
    cta2: 'Par année universitaire',
    pillars: [
      ['Bases de données', 'Du relationnel (transactions, triggers, ORM) au NoSQL : graphe, colonnes, vectoriel.'],
      ['Données', 'ETL, qualité des données, automatisation et informatique décisionnelle.'],
      ['Intelligence artificielle', 'Statistiques multimodales, réduction de dimension, clustering, son et images.'],
    ],
  },
  en: {
    role: 'Lecturer-researcher, IUT de La Rochelle · L3i',
    intro: 'Databases, data and artificial intelligence. Lectures, tutorials and labs for 2nd and 3rd year Computer Science (BUT).',
    cta: 'Browse courses',
    cta2: 'By academic year',
    pillars: [
      ['Databases', 'From relational (transactions, triggers, ORM) to NoSQL: graph, column and vector stores.'],
      ['Data', 'ETL, data quality, automation and business intelligence.'],
      ['Artificial intelligence', 'Multimodal statistics, dimensionality reduction, clustering, sound and images.'],
    ],
  },
};

export default function Home(): ReactNode {
  const {siteConfig, i18n} = useDocusaurusContext();
  const t = TEXT[i18n.currentLocale === 'en' ? 'en' : 'fr'];
  return (
    <Layout title={siteConfig.title} description={t.intro}>
      <header className={styles.heroBanner}>
        <div className="container">
          <p className={styles.role}>{t.role}</p>
          <h1 className={styles.name}>{siteConfig.title}</h1>
          <p className={styles.intro}>{t.intro}</p>
          <div className={styles.buttons}>
            <Link className={styles.btnMain} to="/enseignement">{t.cta}</Link>
            <Link className={styles.btnGhost} to="/enseignement/annees">{t.cta2}</Link>
          </div>
        </div>
      </header>
      <main className="container">
        <div className={styles.pillars}>
          {t.pillars.map(([title, text]) => (
            <div key={title} className={styles.pillar}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
