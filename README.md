# Site personnel : Mohamed SAKKARI

Site bilingue (FR/EN) d'enseignement et de recherche, construit avec [Docusaurus](https://docusaurus.io/) et publié sur GitHub Pages : https://mosakkari.github.io/My-Site/

## Principe

Le contenu est décrit dans deux fichiers, qu'on n'édite normalement **pas à la main** mais avec le dashboard :

| Fichier | Contenu |
|---|---|
| `data/catalogue.json` | modules, années universitaires, séances, ressources, travaux de recherche |
| `data/profile.json` | page À propos : présentation, liens, thèmes, parcours, CV |

Les fichiers publiés (PDF, notebooks, données) sont dans `static/files/`. Le dépôt est **public** : ne jamais y mettre de copies d'étudiants, de notes ni de fichiers dont les droits sont incertains.

## Utilisation courante

```
npm install        # une seule fois
npm run admin      # dashboard local : http://127.0.0.1:4000
npm start          # site en français : http://localhost:3000/My-Site/
npm run start:en   # site en anglais : http://localhost:3000/My-Site/en/
npm run preview    # les DEUX langues ensemble, comme en ligne (build puis serveur)
```

En mode développement, Docusaurus ne sert qu'une langue à la fois : avec `npm start`, le sélecteur de langue mène donc à « Page introuvable ». C'est normal en local ; en ligne, les deux langues sont publiées. Utilisez `npm run preview` pour tester le changement de langue.

Dans le dashboard :

- **Modules** : créer un module, une année, des séances, des ressources (fichier, lien externe ou masquée), les heures, la licence, le dépôt GitHub du cours (optionnel).
- **Recherche** : travaux avec lien vers l'article et/ou le dépôt (tous optionnels).
- **Importer depuis un dossier** : analyse un dossier de cours, bloque les fichiers sensibles, copie seulement ce que vous cochez.
- **Profil** : page À propos et CV.
- **Publication** : nettoie les fichiers orphelins, puis `git add` + `commit` + `push`.

Cliquer sur **Enregistrer** avant de publier. Chaque push sur `main` déclenche le déploiement (`.github/workflows/deploy.yml`).

## Règles de visibilité

- Une ressource `hidden` n'est jamais affichée et son fichier n'est pas copié dans ce dépôt.
- Les liens non `http(s)` sont ignorés.
- Le dashboard n'écoute que sur `127.0.0.1`.

## Structure

```
data/            catalogue.json, profile.json
plugins/catalogue/   génère les pages à partir des données
src/components/Catalogue/   pages : modules, années, bilan, recherche, à propos, mentions légales
admin/           dashboard local (Node, sans dépendance)
i18n/en/         traductions anglaises de la navigation
static/files/    fichiers publiés
docs/cours/      anciens brouillons, à migrer puis supprimer
```

## Déploiement manuel

```
GIT_USER=<utilisateur GitHub> npm run deploy
```
