// Affiche le code personnel de chaque agent pour le vote des prix spéciaux.
// Utilisation : RESULTATS_CLE=ta-cle node codes.mjs
import { AGENTS, codeAgent } from "./lib/core.mjs";

if (!process.env.RESULTATS_CLE) {
  console.error("Indique la clé : RESULTATS_CLE=ta-cle node codes.mjs");
  process.exit(1);
}
for (const agent of AGENTS) {
  console.log(`${agent.nom} : ${await codeAgent(agent.numero, process.env)}`);
}
