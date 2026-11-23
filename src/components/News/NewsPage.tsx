import {useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import NewsCard from './NewsCard';
import {TYPE_LABEL, typeStyle, useNewsLang, type NewsItem} from './shared';
import styles from './news.module.css';

export default function NewsPage({data}: {data: {news: NewsItem[]}}): ReactNode {
  const {lang, ui} = useNewsLang();
  const [filter, setFilter] = useState('all');
  const types = [...new Set(data.news.map((n) => n.type))];
  const shown = filter === 'all' ? data.news : data.news.filter((n) => n.type === filter);
  return (
    <Layout title={ui.title}>
      <main className="container margin-vert--lg">
        <Link to="/">{ui.home}</Link>
        <h1>{ui.title}</h1>
        {data.news.length === 0 && <p>{ui.empty}</p>}
        {types.length > 1 && (
          <div className={styles.filters} role="group" aria-label={ui.filter}>
            {['all', ...types].map((t) => (
              <button key={t} type="button" aria-pressed={filter === t} style={t === 'all' ? undefined : typeStyle(t)} className={filter === t ? styles.chipOn : styles.chip} onClick={() => setFilter(t)}>
                {t === 'all' ? ui.allTypes : TYPE_LABEL[lang][t] ?? t}
              </button>
            ))}
          </div>
        )}
        <div className={styles.list}>
          {shown.map((n) => <NewsCard key={n.id} n={n} lang={lang} />)}
        </div>
      </main>
    </Layout>
  );
}
