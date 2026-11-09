// Affiche les codes personnels des participants Improving (anciens codes conservés).
// Utilisation : RESULTATS_CLE=ta-cle node codes.mjs
import { codeAgent } from "./lib/core.mjs";

import { PARTICIPANTS } from "./lib/improving.mjs";

if (!process.env.RESULTATS_CLE) {
  console.error("Indique la clé : RESULTATS_CLE=ta-cle node codes.mjs");
  process.exit(1);
}
for (const agent of PARTICIPANTS) {
  console.log(`${agent.nom} : ${await codeAgent(agent.numero, process.env)}`);
}
