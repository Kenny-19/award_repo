// Serveur de test local : mêmes règles qu'en ligne, données gardées en mémoire.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { handleApi } from "./lib/core.mjs";

const racine = join(fileURLToPath(new URL(".", import.meta.url)), "public");
const memoire = new Map();
const store = {
  list: async (prefix) => [...memoire.keys()].filter((k) => k.startsWith(prefix)),
  get: async (key) => memoire.get(key) ?? null,
  set: async (key, value) => void memoire.set(key, value),
};
const env = { RESULTATS_CLE: "dev-local" };
const types = { ".html": "text/html; charset=utf-8", ".png": "image/png" };

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:8899");
  if (url.pathname.startsWith("/api/")) {
    const morceaux = [];
    for await (const m of req) morceaux.push(m);
    const requete = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method === "POST" ? Buffer.concat(morceaux) : undefined,
    });
    const reponse = await handleApi(requete, store, env);
    res.writeHead(reponse.status, Object.fromEntries(reponse.headers));
    res.end(await reponse.text());
    return;
  }
  const chemin = url.pathname === "/" ? "/index.html" : url.pathname;
  try {
    const contenu = await readFile(join(racine, normalize(chemin)));
    res.writeHead(200, { "content-type": types[extname(chemin)] || "application/octet-stream" });
    res.end(contenu);
  } catch {
    res.writeHead(404).end("Introuvable");
  }
}).listen(8899);
