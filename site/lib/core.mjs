// Logique du site, indépendante de l'hébergeur : le stockage est passé en paramètre.
// store : { list(prefix) -> tableau de clés, get(key) -> texte ou null, set(key, value) }

export const AGENTS = [
  { numero: 1, nom: "Arsene Sefu" },
  { numero: 2, nom: "Audrey Audra" },
  { numero: 3, nom: "Jean Mkb" },
  { numero: 4, nom: "jenokal_31" },
  { numero: 5, nom: "Jess Kb" },
  { numero: 6, nom: "Kenny" },
  { numero: 7, nom: "Lionel" },
  { numero: 8, nom: "Wilfried Musanzi" },
];

export const PRIX = [
  { id: "dossier", nom: "Dossier Compromettant", autoVote: false },
  { id: "comique", nom: "Agent Comique", autoVote: false },
  { id: "infiltre", nom: "L'Agent Infiltré", autoVote: false },
  { id: "photographe", nom: "Le Photographe du Service", autoVote: false },
  { id: "mission", nom: "Mission Échouée", autoVote: true },
  { id: "retard", nom: "Agent Toujours en Retard", autoVote: false },
];

const BAREME = [10, 7, 5, 3, 1];

const COOKIE = "agent_annee_vote_officiel";
const UN_AN = 60 * 60 * 24 * 365;
// Assez haut pour les réseaux mobiles, où beaucoup de gens partagent la même adresse IP.
const MAX_VOTES_PAR_IP = 50;
const CLE_REVELE = "etat/revele";

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });
}

async function sha256(texte) {
  const octets = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
  return [...new Uint8Array(octets)].map((o) => o.toString(16).padStart(2, "0")).join("");
}

async function lireCorps(request) {
  try {
    const corps = await request.json();
    return corps && typeof corps === "object" ? corps : {};
  } catch {
    return {};
  }
}

// Samedi 7 novembre, heure de Lubumbashi : le 8e à 16 h, puis un agent par heure, le 1er à 23 h.
const DEBUT_REVELATION = "2026-11-07T16:00:00+02:00";
const UNE_HEURE = 60 * 60 * 1000;
const NB_ETAPES = 8;

// Le drapeau sert de secours : il permet de tout révéler d'un coup depuis la page de contrôle.
async function progression(store, env) {
  const force = (await store.get(CLE_REVELE)) === "oui";
  const debut = Date.parse(env.DEBUT_REVELATION || DEBUT_REVELATION);
  const ecoule = Date.now() - debut;
  const etape = force ? NB_ETAPES : ecoule < 0 ? 0 : Math.min(NB_ETAPES, Math.floor(ecoule / UNE_HEURE) + 1);
  return {
    force,
    etape,
    ferme: etape > 0,
    termine: etape >= NB_ETAPES,
    prochaine: etape < NB_ETAPES ? new Date(debut + etape * UNE_HEURE).toISOString() : null,
  };
}

async function cleValide(cle, env) {
  return Boolean(env.RESULTATS_CLE) && (await sha256(String(cle ?? ""))) === (await sha256(env.RESULTATS_CLE));
}

// Chaque agent a son propre code, calculé à partir de la clé des résultats.
export async function codeAgent(numero, env) {
  const cle = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.RESULTATS_CLE),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cle, new TextEncoder().encode(`agent:${numero}`));
  return [...new Uint8Array(signature)].slice(0, 4).map((o) => o.toString(16).padStart(2, "0")).join("").toUpperCase();
}

async function agentDuCode(code, env) {
  if (!env.RESULTATS_CLE) return null;
  const saisi = String(code ?? "").trim().toUpperCase();
  for (const agent of AGENTS) {
    if ((await codeAgent(agent.numero, env)) === saisi) return agent;
  }
  return null;
}

async function lireBulletins(store) {
  const cles = await store.list("bulletins/");
  return Promise.all(cles.map(async (k) => JSON.parse(await store.get(k))));
}

// Une voix du public vaut 1 point. Le top 5 de chaque agent rapporte les points du barème.
// Égalité : le plus de 1res places d'agents, puis de 2es places. Sinon, ex æquo.
async function classement(store) {
  const tops = (await lireBulletins(store)).map((b) => b.annee).filter(Array.isArray);
  const comptes = await Promise.all(
    AGENTS.map(async (a) => {
      const pub = (await store.list(`votes/${a.numero}/`)).length;
      const agents = tops.reduce((somme, top) => somme + (BAREME[top.indexOf(a.numero)] ?? 0), 0);
      return {
        nom: a.nom,
        points: pub + agents,
        public: pub,
        agents,
        premieres: tops.filter((top) => top[0] === a.numero).length,
        deuxiemes: tops.filter((top) => top[1] === a.numero).length,
      };
    }),
  );
  const ecart = (a, b) => b.points - a.points || b.premieres - a.premieres || b.deuxiemes - a.deuxiemes;
  comptes.sort(ecart);
  return comptes.map((c) => ({
    nom: c.nom,
    points: c.points,
    public: c.public,
    agents: c.agents,
    rang: 1 + comptes.filter((x) => ecart(c, x) > 0).length,
  }));
}

async function prixSpeciaux(store) {
  const bulletins = await lireBulletins(store);
  const prix = PRIX.map((p) => {
    const voix = AGENTS.map((a) => ({
      nom: a.nom,
      votes: bulletins.filter((b) => b[p.id] === a.numero).length,
    }));
    const meilleur = Math.max(...voix.map((v) => v.votes));
    return {
      nom: p.nom,
      votes: meilleur,
      gagnants: meilleur > 0 ? voix.filter((v) => v.votes === meilleur).map((v) => v.nom) : [],
    };
  });
  return { prix, bulletins: bulletins.length };
}

async function vote(request, store, env) {
  if ((await progression(store, env)).ferme) return json(403, { code: "ferme", erreur: "Le vote est terminé." });

  const cookies = request.headers.get("cookie") || "";
  if (cookies.split(/;\s*/).some((c) => c.startsWith(`${COOKIE}=`))) {
    return json(409, { code: "deja_vote", erreur: "Ton vote est déjà enregistré." });
  }

  const { agent } = await lireCorps(request);
  if (!AGENTS.some((a) => a.numero === agent)) {
    return json(400, { erreur: "Choisis un agent de la liste." });
  }

  // On ne garde jamais l'adresse IP, seulement une empreinte salée.
  const ip = request.headers.get("x-nf-client-connection-ip") || "inconnue";
  const empreinte = await sha256(`${env.RESULTATS_CLE || ""}:${ip}`);
  if ((await store.list(`ip/${empreinte}/`)).length >= MAX_VOTES_PAR_IP) {
    return json(429, { code: "trop_de_votes", erreur: "Trop de votes depuis cette connexion." });
  }

  const id = crypto.randomUUID();
  await store.set(`votes/${agent}/${id}`, "1");
  await store.set(`ip/${empreinte}/${id}`, "1");
  return json(200, { ok: true }, {
    "set-cookie": `${COOKIE}=${id}; Max-Age=${UN_AN}; Path=/; HttpOnly; Secure; SameSite=Lax`,
  });
}

async function etat(store, env) {
  const p = await progression(store, env);
  if (!p.ferme) return json(200, { revele: false, prochaine: p.prochaine });
  // Version publique : seulement les agents déjà révélés. Rien d'autre ne quitte le serveur.
  // Du dernier au premier, une place par étape. Les ex æquo à la 1re place arrivent ensemble à la fin.
  const liste = await classement(store);
  const visibles = [...liste]
    .reverse()
    .filter((c, i) => (c.rang === 1 ? NB_ETAPES - 1 : i) < p.etape)
    .map(({ nom, points, rang }) => ({
      nom,
      points,
      rang,
      egalite: liste.filter((x) => x.rang === rang).length > 1,
    }));
  return json(200, { revele: true, etape: p.etape, termine: p.termine, prochaine: p.prochaine, classement: visibles });
}

// Un bulletin envoyé avant l'ajout de l'Agent de l'année peut encore être complété.
async function bulletinComplet(store, numero) {
  const texte = await store.get(`bulletins/${numero}`);
  return texte !== null && Array.isArray(JSON.parse(texte).annee);
}

async function groupeVerifier(request, store, env) {
  const agent = await agentDuCode((await lireCorps(request)).code, env);
  if (!agent) return json(401, { erreur: "Ce code n'est pas valide." });
  const { ferme, termine } = await progression(store, env);
  return json(200, {
    agent,
    agents: AGENTS,
    prix: PRIX,
    deja: await bulletinComplet(store, agent.numero),
    ferme,
    termine,
    laureats: termine ? (await prixSpeciaux(store)).prix : [],
  });
}

// Classement en direct : seulement pour ceux qui ont déjà voté.
async function direct(request, store, env) {
  const cookies = request.headers.get("cookie") || "";
  let autorise = cookies.split(/;\s*/).some((c) => c.startsWith(`${COOKIE}=`));
  if (!autorise) {
    const agent = await agentDuCode((await lireCorps(request)).code, env);
    autorise = Boolean(agent) && (await bulletinComplet(store, agent.numero));
  }
  if (!autorise) return json(403, { erreur: "Vote d'abord pour voir le classement." });
  const { ferme } = await progression(store, env);
  if (ferme) return json(200, { revele: true, classement: [] });
  // Le direct ne montre que les voix du public : les points des agents restent secrets.
  const liste = (await classement(store))
    .map(({ nom, public: voix }) => ({ nom, voix }))
    .sort((a, b) => b.voix - a.voix);
  return json(200, {
    revele: false,
    classement: liste.map((c) => ({ ...c, rang: 1 + liste.filter((x) => x.voix > c.voix).length })),
  });
}

async function groupeVote(request, store, env) {
  const { code, choix } = await lireCorps(request);
  const agent = await agentDuCode(code, env);
  if (!agent) return json(401, { erreur: "Ce code n'est pas valide." });
  if ((await progression(store, env)).ferme) return json(403, { code: "ferme", erreur: "Le vote est terminé." });
  if (await bulletinComplet(store, agent.numero)) {
    return json(409, { code: "deja_vote", erreur: "Ton bulletin est déjà enregistré." });
  }

  const annee = choix?.annee;
  if (
    !Array.isArray(annee) ||
    annee.length !== BAREME.length ||
    new Set(annee).size !== BAREME.length ||
    !annee.every((n) => AGENTS.some((a) => a.numero === n))
  ) {
    return json(400, { erreur: "Classe 5 agents différents pour l'Agent de l'année." });
  }
  if (annee.includes(agent.numero)) {
    return json(400, { erreur: "Tu ne peux pas te classer toi-même à l'Agent de l'année." });
  }

  const bulletin = { annee };
  for (const p of PRIX) {
    const candidat = choix?.[p.id];
    if (!AGENTS.some((a) => a.numero === candidat)) {
      return json(400, { erreur: `Choisis un agent pour le prix ${p.nom}.` });
    }
    if (candidat === agent.numero && !p.autoVote) {
      return json(400, { erreur: `Tu ne peux pas voter pour toi au prix ${p.nom}.` });
    }
    bulletin[p.id] = candidat;
  }
  await store.set(`bulletins/${agent.numero}`, JSON.stringify(bulletin));
  return json(200, { ok: true });
}

async function resultats(request, store, env) {
  if (!env.RESULTATS_CLE) return json(503, { erreur: "La clé des résultats n'est pas configurée." });
  if (!(await cleValide((await lireCorps(request)).cle, env))) {
    return json(401, { erreur: "Clé incorrecte." });
  }
  const liste = await classement(store);
  const { prix, bulletins } = await prixSpeciaux(store);
  const p = await progression(store, env);
  return json(200, {
    revele: p.force,
    etape: p.etape,
    prochaine: p.prochaine,
    total: liste.reduce((somme, c) => somme + c.public, 0),
    classement: liste,
    prix,
    bulletins,
  });
}

async function reveler(request, store, env) {
  const { cle, revele } = await lireCorps(request);
  if (!(await cleValide(cle, env))) return json(401, { erreur: "Clé incorrecte." });
  await store.set(CLE_REVELE, revele === true ? "oui" : "non");
  return json(200, { revele: revele === true });
}

export async function handleApi(request, store, env) {
  const { pathname } = new URL(request.url);
  if (pathname === "/api/etat" && request.method === "GET") return etat(store, env);
  if (request.method !== "POST") return json(405, { erreur: "Méthode non autorisée." });
  switch (pathname) {
    case "/api/vote": return vote(request, store, env);
    case "/api/direct": return direct(request, store, env);
    case "/api/groupe/verifier": return groupeVerifier(request, store, env);
    case "/api/groupe/vote": return groupeVote(request, store, env);
    case "/api/resultats": return resultats(request, store, env);
    case "/api/reveler": return reveler(request, store, env);
    default: return json(404, { erreur: "Adresse inconnue." });
  }
}
