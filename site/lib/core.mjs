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

const COOKIE = "agent_annee_vote";
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

const estRevele = async (store) => (await store.get(CLE_REVELE)) === "oui";

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

async function classement(store) {
  const comptes = await Promise.all(
    AGENTS.map(async (a) => ({ nom: a.nom, votes: (await store.list(`votes/${a.numero}/`)).length })),
  );
  comptes.sort((a, b) => b.votes - a.votes);
  return comptes.map((c) => ({ ...c, rang: 1 + comptes.filter((x) => x.votes > c.votes).length }));
}

async function prixSpeciaux(store) {
  const cles = await store.list("bulletins/");
  const bulletins = await Promise.all(cles.map(async (k) => JSON.parse(await store.get(k))));
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
  if (await estRevele(store)) return json(403, { code: "ferme", erreur: "Le vote est terminé." });

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

async function etat(store) {
  if (!(await estRevele(store))) return json(200, { revele: false });
  const liste = await classement(store);
  const { prix } = await prixSpeciaux(store);
  return json(200, {
    revele: true,
    total: liste.reduce((somme, c) => somme + c.votes, 0),
    classement: liste,
    prix,
  });
}

async function groupeVerifier(request, store, env) {
  const agent = await agentDuCode((await lireCorps(request)).code, env);
  if (!agent) return json(401, { erreur: "Ce code n'est pas valide." });
  return json(200, {
    agent,
    agents: AGENTS,
    prix: PRIX,
    deja: (await store.get(`bulletins/${agent.numero}`)) !== null,
    ferme: await estRevele(store),
  });
}

async function groupeVote(request, store, env) {
  const { code, choix } = await lireCorps(request);
  const agent = await agentDuCode(code, env);
  if (!agent) return json(401, { erreur: "Ce code n'est pas valide." });
  if (await estRevele(store)) return json(403, { code: "ferme", erreur: "Le vote est terminé." });
  if ((await store.get(`bulletins/${agent.numero}`)) !== null) {
    return json(409, { code: "deja_vote", erreur: "Ton bulletin est déjà enregistré." });
  }

  const bulletin = {};
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
  return json(200, {
    revele: await estRevele(store),
    total: liste.reduce((somme, c) => somme + c.votes, 0),
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
  if (pathname === "/api/etat" && request.method === "GET") return etat(store);
  if (request.method !== "POST") return json(405, { erreur: "Méthode non autorisée." });
  switch (pathname) {
    case "/api/vote": return vote(request, store, env);
    case "/api/groupe/verifier": return groupeVerifier(request, store, env);
    case "/api/groupe/vote": return groupeVote(request, store, env);
    case "/api/resultats": return resultats(request, store, env);
    case "/api/reveler": return reveler(request, store, env);
    default: return json(404, { erreur: "Adresse inconnue." });
  }
}
