# Agents Secrets

Espace du collectif (10 agents), hébergé sur Netlify, en crème/beige et noir.

- `/` : accueil du collectif, consultation libre, Improving et Divertissement.
- `/agents` : redirection vers l’espace Improving.
- `/awards` : archive publique des Secret Awards 2026, classement, prix spéciaux, animation et GIF.
- `/resultats.html` : ancien contrôle Awards, protégé par la clé organisateur.

## Improving · Édition 01

10 agents, 15 langages disponibles : 10 attributions différentes et 5 en réserve. Lancement unique par Kenny ; le tirage HMAC côté serveur reste identique en cas de requêtes simultanées. Les attributions sont enregistrées, puis chaque agent choisit et décrit librement un projet. La lecture des projets et des attributions est publique, sans code. L’écriture reste authentifiée. Chaque agent envoie sa propre fiche une seule fois. Après confirmation explicite, aucun champ ne peut être modifié ; une écriture conditionnelle empêche aussi les doubles envois simultanés.

TypeScript, Python, JavaScript, Rust, Java, C#, C++, Kotlin, PHP, Elixir, Ruby, Dart, Scala, R et C : sélection éditoriale fondée sur les tendances GitHub/Stack Overflow, la diversité technique et les écosystèmes, pas un top 10 de popularité. Sources dans le site. Aucun délai ou barème de jury inventé : à définir collectivement.

Les données Improving utilisent le préfixe `improving/edition-1/` dans le stockage existant. Aucun ancien vote, bulletin ou résultat Awards n’est modifié.

## Développement

```sh
cd site
node dev-server.mjs
node --test tests/improving.test.mjs
```

Serveur local : http://localhost:8899, stockage en mémoire, clé locale `dev-local`.

## Déploiement

Le dépôt déclenche Netlify. `netlify.toml` définit `site` comme base. La variable secrète `RESULTATS_CLE` (ou l’ancien nom `RESULTAS_CLE`) doit être disponible dans les Functions.

Pour générer les 10 codes, fournir la clé via l’environnement puis lancer `node site/codes.mjs`. Ne jamais publier la clé ou les codes. Les 8 codes existants restent inchangés ; Kevin et Laurent utilisent les identifiants 9 et 10.
