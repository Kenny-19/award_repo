# Agent de l'année 2026

Site de vote et affiches des Awards du groupe Agents Secrets. Révélation le vendredi 6 novembre 2026.

## Contenu

- `site/public/index.html` : nommés, vote public, critères, prix spéciaux, révélation et GIF.
- `site/public/groupe.html` : vote des prix spéciaux avec un code personnel.
- `site/public/resultats.html` : résultats en direct et lancement de la révélation, avec la clé secrète.
- `site/lib/core.mjs` : règles du vote.
- `site/netlify/functions/api.mjs` : API en ligne sur Netlify.
- `affiche-*.html` et `affiche-*.png` : affiches.

## Tester en local

```bash
cd site
node dev-server.mjs
```

Le site s'ouvre sur http://localhost:8899. Les votes sont gardés en mémoire et la clé de test est `dev-local`.

## Mettre en ligne

Le site a besoin d'un hébergeur avec un serveur : GitHub Pages seul ne peut pas enregistrer les votes.

Sur Netlify, définis la variable `RESULTATS_CLE` avec une longue clé secrète. Ne la mets jamais dans ce dépôt.

Pour obtenir les 8 codes personnels :

```bash
cd site
RESULTATS_CLE=ta-cle node codes.mjs
```
