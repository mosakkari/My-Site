import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Mohamed SAKKARI',
  tagline: 'Enseignant-chercheur IUT de La Rochelle & L3i',
  favicon: 'img/med.jpg',

  // Set the production url of your site here

  url: 'https://mosakkari.github.io',
  baseUrl: '/My-Site/',  // Vérifie bien le nom du repo ici !
  trailingSlash: false,   // Ajoute ceci pour éviter les problèmes GitHub Pages
  organizationName: 'mosakkari', // Ton nom GitHub
  projectName: 'My-Site', // Le nom du repo, exact
  deploymentBranch: 'gh-pages',


  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    localeConfigs: {
      fr: {label: 'Français'},
      en: {label: 'English'},
    },
  },

  plugins: ['./plugins/catalogue'],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['fr', 'en'],
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  // Referencement : donnees structurees (Person) lues par les moteurs de recherche.
  headTags: [
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Mohamed SAKKARI',
        jobTitle: 'Enseignant-chercheur',
        affiliation: {'@type': 'CollegeOrUniversity', name: 'IUT de La Rochelle'},
        url: 'https://mosakkari.github.io/My-Site/',
        sameAs: ['https://github.com/mosakkari'],
      }),
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    image: 'img/social-card.png',
    metadata: [
      {name: 'description', content: 'Cours, TD et TP de bases de données, données et intelligence artificielle. IUT de La Rochelle.'},
    ],
    navbar: {
      title: 'Mohamed SAKKARI',
      logo: {
        alt: 'Mohamed SAKKARI',
        src: 'img/med.jpg',
      },
      items: [
        {to: '/apropos', label: 'À propos', position: 'left'},
        {to: '/enseignement', label: 'Enseignement', position: 'left'},
        {to: '/recherche', label: 'Recherche', position: 'left'},
        {type: 'search', position: 'right'},
        {type: 'localeDropdown', position: 'right'},
        {
          href: 'https://github.com/mosakkari',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Enseignement',
          items: [
            {label: 'Tous les modules', to: '/enseignement'},
            {label: 'Par année universitaire', to: '/enseignement/annees'},
            {label: 'Bilan de l’enseignement', to: '/enseignement/bilan'},
          ],
        },
        {
          title: 'Liens',
          items: [
            {label: 'À propos', to: '/apropos'},
            {label: 'GitHub', href: 'https://github.com/mosakkari'},
            {label: 'QR code du site', to: '/qr'},
            {label: 'Mentions légales', to: '/mentions-legales'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Mohamed SAKKARI. Site construit avec Docusaurus.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
