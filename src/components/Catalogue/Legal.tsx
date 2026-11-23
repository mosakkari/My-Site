import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import {useLang, useUI, pick, type Profile} from './i18n';

export default function Legal({data}: {data: Profile}): ReactNode {
  const lang = useLang();
  const ui = useUI();
  return (
    <Layout title={ui.legalTitle}>
      <main className="container margin-vert--lg">
        <h1>{ui.legalTitle}</h1>
        <h2>{ui.editor}</h2>
        <p>
          {data.name}, {pick(data.role, lang).toLowerCase()}, {pick(data.affiliation, lang)}.
          {data.email && <> {ui.contact} : <a href={`mailto:${data.email}`}>{data.email}</a>.</>}
        </p>
        <h2>{ui.host}</h2>
        <p>GitHub, Inc. (GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer">pages.github.com</a></p>
        <h2>{ui.cookies}</h2>
        <p>{ui.cookiesText}</p>
        <h2>{ui.contentLicense}</h2>
        <p>{ui.contentText}</p>
      </main>
    </Layout>
  );
}
