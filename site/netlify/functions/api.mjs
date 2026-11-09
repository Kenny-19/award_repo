import { handleApi } from "../../lib/core.mjs";
import { handleImproving } from "../../lib/improving.mjs";
import { storeNetlify } from "../../lib/netlify-store.mjs";

export default (request) => {
  const lire = (nom) => globalThis.Netlify?.env?.get(nom) ?? process.env[nom];
  // RESULTAS_CLE : orthographe utilisée sur le tableau de bord Netlify de ce site.
  const cle = lire("RESULTATS_CLE") ?? lire("RESULTAS_CLE");
  const env = { RESULTATS_CLE: cle?.trim() };
  if (new URL(request.url).pathname.startsWith("/api/improving/")) return handleImproving(request, storeNetlify(), env);
  return handleApi(request, storeNetlify(), env);
};

export const config = { path: "/api/*" };
