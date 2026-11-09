import { AGENTS, codeAgent } from './core.mjs';

export const PARTICIPANTS = [...AGENTS, { numero: 9, nom: 'Kevin Milenda' }, { numero: 10, nom: 'Laurent Mutombo' }];
export const LANGUAGES = [
  { id: 'typescript', name: 'TypeScript', field: 'Applications & outils', brief: 'Types avancés, architecture applicative et expérience utilisateur.', url: 'https://www.typescriptlang.org/docs/' },
  { id: 'python', name: 'Python', field: 'Données & automatisation', brief: 'Pipelines fiables, traitement de données ou systèmes intelligents évaluables.', url: 'https://docs.python.org/3/' },
  { id: 'javascript', name: 'JavaScript', field: 'Web & applications', brief: 'Applications interactives, services Node.js et outils web.', url: 'https://developer.mozilla.org/fr/docs/Web/JavaScript' },
  { id: 'rust', name: 'Rust', field: 'Systèmes & fiabilité', brief: 'Gestion mémoire, sûreté et performances mesurées.', url: 'https://www.rust-lang.org/learn' },
  { id: 'java', name: 'Java', field: 'Architecture & backend', brief: 'Architecture modulaire, concurrence et systèmes robustes.', url: 'https://dev.java/learn/' },
  { id: 'csharp', name: 'C#', field: 'Applications & services', brief: 'Programmation asynchrone, applications ou services .NET.', url: 'https://learn.microsoft.com/dotnet/csharp/' },
  { id: 'cpp', name: 'C++', field: 'Calcul & performance', brief: 'Algorithmes, maîtrise des ressources et benchmarks.', url: 'https://isocpp.org/get-started' },
  { id: 'kotlin', name: 'Kotlin', field: 'Mobile & multiplateforme', brief: 'Coroutines, conception mobile ou services multiplateformes.', url: 'https://kotlinlang.org/docs/home.html' },
  { id: 'php', name: 'PHP', field: 'Web & backend', brief: 'Applications serveur, API et architecture web robuste.', url: 'https://www.php.net/manual/fr/' },
  { id: 'elixir', name: 'Elixir', field: 'Temps réel & résilience', brief: 'Processus, tolérance aux pannes et systèmes réactifs.', url: 'https://elixir-lang.org/learning.html' },
];
LANGUAGES.push(
  { id: 'ruby', name: 'Ruby', field: 'Applications & automatisation', brief: 'Conception expressive, applications web et outils métiers.', url: 'https://www.ruby-lang.org/fr/documentation/' },
  { id: 'dart', name: 'Dart', field: 'Applications multiplateformes', brief: 'Applications Flutter, interfaces réactives et programmation asynchrone.', url: 'https://dart.dev/guides' },
  { id: 'scala', name: 'Scala', field: 'Fonctionnel & données', brief: 'Modélisation typée, traitement de données et programmation fonctionnelle.', url: 'https://docs.scala-lang.org/' },
  { id: 'r', name: 'R', field: 'Statistiques & visualisation', brief: 'Analyse reproductible, modèles statistiques et exploration des données.', url: 'https://www.r-project.org/other-docs.html' },
  { id: 'c', name: 'C', field: 'Systèmes & ressources', brief: 'Structures de données, gestion mémoire et outils proches du système.', url: 'https://www.gnu.org/software/gnu-c-manual/' },
);
// Pistes facultatives : le langage reste attribué, le framework reste libre.
const FRAMEWORKS = {
  "java": [
    {
      "name": "Spring Boot",
      "use": "Applications backend et API avec l’écosystème Spring.",
      "url": "https://spring.io/projects/spring-boot/"
    },
    {
      "name": "Quarkus",
      "use": "Microservices et applications Java orientées cloud.",
      "url": "https://quarkus.io/"
    },
    {
      "name": "Micronaut",
      "use": "Services JVM et injection de dépendances à la compilation.",
      "url": "https://micronaut.io/"
    }
  ],
  "javascript": [
    {
      "name": "Express",
      "use": "API et applications serveur avec Node.js.",
      "url": "https://expressjs.com/"
    },
    {
      "name": "Fastify",
      "use": "API Node.js avec validation des données et plugins.",
      "url": "https://fastify.dev/"
    },
    {
      "name": "Nuxt",
      "use": "Applications web basées sur Vue, côté client et serveur.",
      "url": "https://nuxt.com/docs"
    },
    {
      "name": "SvelteKit",
      "use": "Applications web complètes avec Svelte.",
      "url": "https://svelte.dev/docs/kit"
    }
  ],
  "python": [
    {
      "name": "Django",
      "use": "Applications web avec ORM, authentification et administration.",
      "url": "https://www.djangoproject.com/"
    },
    {
      "name": "FastAPI",
      "use": "API typées avec validation et documentation OpenAPI.",
      "url": "https://fastapi.tiangolo.com/"
    },
    {
      "name": "Flask",
      "use": "Applications web et API avec une structure légère et extensible.",
      "url": "https://flask.palletsprojects.com/"
    }
  ],
  "typescript": [
    {
      "name": "Angular",
      "use": "Applications frontend structurées en TypeScript.",
      "url": "https://angular.dev/"
    },
    {
      "name": "NestJS",
      "use": "API et services backend modulaires sous Node.js.",
      "url": "https://docs.nestjs.com/"
    },
    {
      "name": "Next.js",
      "use": "Applications React avec rendu serveur et fonctionnalités full-stack.",
      "url": "https://nextjs.org/docs"
    },
    {
      "name": "AdonisJS",
      "use": "Applications backend TypeScript avec un cadre intégré.",
      "url": "https://adonisjs.com/"
    }
  ],
  "php": [
    {
      "name": "Laravel",
      "use": "Applications web, API et outils métiers.",
      "url": "https://laravel.com/"
    },
    {
      "name": "Symfony",
      "use": "Applications PHP modulaires et composants réutilisables.",
      "url": "https://symfony.com/"
    },
    {
      "name": "CodeIgniter",
      "use": "Applications web PHP avec un framework léger.",
      "url": "https://codeigniter.com/user_guide/"
    }
  ],
  "dart": [
    {
      "name": "Flutter",
      "use": "Applications mobiles, web et desktop avec Dart.",
      "url": "https://flutter.dev/"
    },
    {
      "name": "Serverpod",
      "use": "Backend Dart et API intégrées à une application Flutter.",
      "url": "https://docs.serverpod.dev/"
    },
    {
      "name": "Dart Frog",
      "use": "API et services backend en Dart.",
      "url": "https://dart-frog.dev/"
    }
  ]
};
for (const language of LANGUAGES) language.frameworks = FRAMEWORKS[language.id] || [];
const respond = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
async function body(req) { try { const value = await req.json(); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; } }
export async function identify(req, env) {
  if (!env.RESULTATS_CLE) return null;
  const code = (req.headers.get('x-agent-code') || '').trim().toUpperCase();
  if (!/^[A-F0-9]{8}$/.test(code)) return null;
  for (const a of PARTICIPANTS) if (await codeAgent(a.numero, env) === code) return a;
  return null;
}
// Secret HMAC-derived shuffle: reproducible across simultaneous requests and impossible
// to predict without the server secret. The activation marker makes the draw official.
async function assignments(env) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.RESULTATS_CLE), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const ranked = await Promise.all(LANGUAGES.map(async l => {
    const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('improving:edition-1:language:' + l.id));
    return { language: l.id, order: [...new Uint8Array(bytes)].map(n => n.toString(16).padStart(2, '0')).join('') };
  }));
  ranked.sort((a,b) => a.order.localeCompare(b.order));
  return PARTICIPANTS.map((a,i) => ({ numero: a.numero, language: ranked[i].language }));
}
async function readDraw(store) { const raw = await store.get('improving/edition-1/draw'); return raw ? JSON.parse(raw) : null; }
async function state(store, me) {
  const draw = await readDraw(store);
  const projects = (await Promise.all(PARTICIPANTS.map(a => store.get('improving/edition-1/projects/' + a.numero)))).filter(Boolean).map(JSON.parse);
  return { me, participants: PARTICIPANTS, languages: LANGUAGES, draw, projects };
}
export async function handleImproving(req, store, env) {
  const path = new URL(req.url).pathname;
  const me = await identify(req, env);
  if (path === '/api/improving/state' && req.method === 'GET') {
    if (req.headers.get('x-agent-code') && !me) return respond(401, { erreur: 'Code non reconnu. Utilise ton code personnel d’agent.' });
    return respond(200, await state(store, me));
  }
  if (!env.RESULTATS_CLE) return respond(503, { erreur: 'L’espace agents est momentanément indisponible.' });
  if (!me) return respond(401, { erreur: 'Ton code est nécessaire pour confirmer ton projet ou lancer le tirage.' });
  if (path === '/api/improving/draw' && req.method === 'POST') {
    if (me.numero !== 6) return respond(403, { erreur: 'Seul Kenny peut lancer le tirage commun.' });
    let draw = await readDraw(store);
    if (!draw) {
      // No reroll: every request yields the same assignments, even if concurrent.
      draw = { edition: 1, assignments: await assignments(env) };
      await store.set('improving/edition-1/draw', JSON.stringify(draw));
    }
    return respond(200, await state(store, me));
  }
  if (path === '/api/improving/project' && req.method === 'POST') {
    if (!(await readDraw(store))) return respond(409, { erreur: 'Le tirage doit être lancé avant de choisir ton projet.' });
    const projectKey = 'improving/edition-1/projects/' + me.numero;
    if (await store.get(projectKey)) return respond(409, { erreur: 'Ton choix de projet est définitif. Ta fiche ne peut plus être modifiée.' });
    const b = await body(req);
    const fields = { title: [5,120], problem: [20,1600], technical: [20,2400], demo: [0,800], repo: [0,300], demoUrl: [0,300] };
    const project = { agent: me.numero, updatedAt: new Date().toISOString() };
    for (const [name,[min,max]] of Object.entries(fields)) {
      const value = typeof b[name] === 'string' ? b[name].trim() : '';
      if (value.length < min || value.length > max) return respond(400, { erreur: 'Complète le titre, le problème et la démarche technique en respectant les longueurs indiquées.' });
      project[name] = value;
    }
    for (const name of ['repo','demoUrl']) if (project[name]) {
      try { const u = new URL(project[name]); if (u.protocol !== 'https:' && u.protocol !== 'http:') throw Error(); }
      catch { return respond(400, { erreur: 'Les liens doivent commencer par https:// ou http://.' }); }
    }
    if (!['idea','building','ready'].includes(b.status)) return respond(400, { erreur: 'Choisis un état de projet valide.' });
    project.status = b.status;
    const created = await store.create(projectKey, JSON.stringify(project));
    if (!created) return respond(409, { erreur: 'Ton choix de projet est définitif. Ta fiche ne peut plus être modifiée.' });
    return respond(200, await state(store, me));
  }
  return respond(405, { erreur: 'Action non disponible.' });
}
