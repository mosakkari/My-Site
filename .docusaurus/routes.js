import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/My-Site/blog',
    component: ComponentCreator('/My-Site/blog', '3c6'),
    exact: true
  },
  {
    path: '/My-Site/blog/archive',
    component: ComponentCreator('/My-Site/blog/archive', '858'),
    exact: true
  },
  {
    path: '/My-Site/blog/authors',
    component: ComponentCreator('/My-Site/blog/authors', 'fc1'),
    exact: true
  },
  {
    path: '/My-Site/blog/authors/all-sebastien-lorber-articles',
    component: ComponentCreator('/My-Site/blog/authors/all-sebastien-lorber-articles', '16d'),
    exact: true
  },
  {
    path: '/My-Site/blog/authors/yangshun',
    component: ComponentCreator('/My-Site/blog/authors/yangshun', '5e6'),
    exact: true
  },
  {
    path: '/My-Site/blog/first-blog-post',
    component: ComponentCreator('/My-Site/blog/first-blog-post', 'fa0'),
    exact: true
  },
  {
    path: '/My-Site/blog/long-blog-post',
    component: ComponentCreator('/My-Site/blog/long-blog-post', 'bc9'),
    exact: true
  },
  {
    path: '/My-Site/blog/mdx-blog-post',
    component: ComponentCreator('/My-Site/blog/mdx-blog-post', 'd36'),
    exact: true
  },
  {
    path: '/My-Site/blog/tags',
    component: ComponentCreator('/My-Site/blog/tags', '657'),
    exact: true
  },
  {
    path: '/My-Site/blog/tags/docusaurus',
    component: ComponentCreator('/My-Site/blog/tags/docusaurus', 'bab'),
    exact: true
  },
  {
    path: '/My-Site/blog/tags/facebook',
    component: ComponentCreator('/My-Site/blog/tags/facebook', 'a4c'),
    exact: true
  },
  {
    path: '/My-Site/blog/tags/hello',
    component: ComponentCreator('/My-Site/blog/tags/hello', '469'),
    exact: true
  },
  {
    path: '/My-Site/blog/tags/hola',
    component: ComponentCreator('/My-Site/blog/tags/hola', 'f9b'),
    exact: true
  },
  {
    path: '/My-Site/blog/welcome',
    component: ComponentCreator('/My-Site/blog/welcome', '529'),
    exact: true
  },
  {
    path: '/My-Site/markdown-page',
    component: ComponentCreator('/My-Site/markdown-page', 'ec0'),
    exact: true
  },
  {
    path: '/My-Site/docs',
    component: ComponentCreator('/My-Site/docs', '3c8'),
    routes: [
      {
        path: '/My-Site/docs',
        component: ComponentCreator('/My-Site/docs', '490'),
        routes: [
          {
            path: '/My-Site/docs',
            component: ComponentCreator('/My-Site/docs', '75d'),
            routes: [
              {
                path: '/My-Site/docs/category/tutorial---basics',
                component: ComponentCreator('/My-Site/docs/category/tutorial---basics', 'c70'),
                exact: true,
                sidebar: "parcoursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD_NoSQL/cm',
                component: ComponentCreator('/My-Site/docs/cours/BD_NoSQL/cm', 'eda'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD_NoSQL/intro',
                component: ComponentCreator('/My-Site/docs/cours/BD_NoSQL/intro', 'df2'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD_NoSQL/td',
                component: ComponentCreator('/My-Site/docs/cours/BD_NoSQL/td', '47b'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD_NoSQL/tp',
                component: ComponentCreator('/My-Site/docs/cours/BD_NoSQL/tp', '02c'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD2/cm',
                component: ComponentCreator('/My-Site/docs/cours/BD2/cm', 'c8f'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD2/intro',
                component: ComponentCreator('/My-Site/docs/cours/BD2/intro', '49b'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD2/td',
                component: ComponentCreator('/My-Site/docs/cours/BD2/td', 'c60'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD2/tp',
                component: ComponentCreator('/My-Site/docs/cours/BD2/tp', 'e75'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD4/cm',
                component: ComponentCreator('/My-Site/docs/cours/BD4/cm', '24d'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD4/intro',
                component: ComponentCreator('/My-Site/docs/cours/BD4/intro', 'c39'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD4/td',
                component: ComponentCreator('/My-Site/docs/cours/BD4/td', '4e3'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BD4/tp',
                component: ComponentCreator('/My-Site/docs/cours/BD4/tp', '470'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BigData/cm',
                component: ComponentCreator('/My-Site/docs/cours/BigData/cm', 'f67'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BigData/intro',
                component: ComponentCreator('/My-Site/docs/cours/BigData/intro', '5e1'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BigData/td',
                component: ComponentCreator('/My-Site/docs/cours/BigData/td', 'baf'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/BigData/tp',
                component: ComponentCreator('/My-Site/docs/cours/BigData/tp', '7a9'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/DATA5/cm',
                component: ComponentCreator('/My-Site/docs/cours/DATA5/cm', 'fde'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/DATA5/intro',
                component: ComponentCreator('/My-Site/docs/cours/DATA5/intro', '4e7'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/DATA5/td',
                component: ComponentCreator('/My-Site/docs/cours/DATA5/td', '588'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/cours/DATA5/tp',
                component: ComponentCreator('/My-Site/docs/cours/DATA5/tp', '68b'),
                exact: true,
                sidebar: "coursSidebar"
              },
              {
                path: '/My-Site/docs/enseignements/manage-docs-versions',
                component: ComponentCreator('/My-Site/docs/enseignements/manage-docs-versions', '141'),
                exact: true,
                sidebar: "enseignementSidebar"
              },
              {
                path: '/My-Site/docs/enseignements/translate-your-site',
                component: ComponentCreator('/My-Site/docs/enseignements/translate-your-site', '955'),
                exact: true,
                sidebar: "enseignementSidebar"
              },
              {
                path: '/My-Site/docs/intro',
                component: ComponentCreator('/My-Site/docs/intro', '6d9'),
                exact: true
              },
              {
                path: '/My-Site/docs/parcours-universitaire/tutorial-basics/congratulations',
                component: ComponentCreator('/My-Site/docs/parcours-universitaire/tutorial-basics/congratulations', 'd74'),
                exact: true,
                sidebar: "parcoursSidebar"
              },
              {
                path: '/My-Site/docs/parcours-universitaire/tutorial-basics/create-a-blog-post',
                component: ComponentCreator('/My-Site/docs/parcours-universitaire/tutorial-basics/create-a-blog-post', 'fde'),
                exact: true,
                sidebar: "parcoursSidebar"
              },
              {
                path: '/My-Site/docs/parcours-universitaire/tutorial-basics/create-a-document',
                component: ComponentCreator('/My-Site/docs/parcours-universitaire/tutorial-basics/create-a-document', 'eb2'),
                exact: true,
                sidebar: "parcoursSidebar"
              },
              {
                path: '/My-Site/docs/parcours-universitaire/tutorial-basics/create-a-page',
                component: ComponentCreator('/My-Site/docs/parcours-universitaire/tutorial-basics/create-a-page', '972'),
                exact: true,
                sidebar: "parcoursSidebar"
              },
              {
                path: '/My-Site/docs/parcours-universitaire/tutorial-basics/deploy-your-site',
                component: ComponentCreator('/My-Site/docs/parcours-universitaire/tutorial-basics/deploy-your-site', '361'),
                exact: true,
                sidebar: "parcoursSidebar"
              },
              {
                path: '/My-Site/docs/parcours-universitaire/tutorial-basics/markdown-features',
                component: ComponentCreator('/My-Site/docs/parcours-universitaire/tutorial-basics/markdown-features', '7c3'),
                exact: true,
                sidebar: "parcoursSidebar"
              },
              {
                path: '/My-Site/docs/tutorial-basics/congratulations',
                component: ComponentCreator('/My-Site/docs/tutorial-basics/congratulations', '43e'),
                exact: true
              },
              {
                path: '/My-Site/docs/tutorial-basics/create-a-blog-post',
                component: ComponentCreator('/My-Site/docs/tutorial-basics/create-a-blog-post', '519'),
                exact: true
              },
              {
                path: '/My-Site/docs/tutorial-basics/create-a-document',
                component: ComponentCreator('/My-Site/docs/tutorial-basics/create-a-document', 'eae'),
                exact: true
              },
              {
                path: '/My-Site/docs/tutorial-basics/create-a-page',
                component: ComponentCreator('/My-Site/docs/tutorial-basics/create-a-page', 'f26'),
                exact: true
              },
              {
                path: '/My-Site/docs/tutorial-basics/deploy-your-site',
                component: ComponentCreator('/My-Site/docs/tutorial-basics/deploy-your-site', '543'),
                exact: true
              },
              {
                path: '/My-Site/docs/tutorial-basics/markdown-features',
                component: ComponentCreator('/My-Site/docs/tutorial-basics/markdown-features', 'bb8'),
                exact: true
              },
              {
                path: '/My-Site/docs/tutorial-extras/manage-docs-versions',
                component: ComponentCreator('/My-Site/docs/tutorial-extras/manage-docs-versions', '09d'),
                exact: true
              },
              {
                path: '/My-Site/docs/tutorial-extras/translate-your-site',
                component: ComponentCreator('/My-Site/docs/tutorial-extras/translate-your-site', '2a9'),
                exact: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/My-Site/',
    component: ComponentCreator('/My-Site/', '7fa'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
