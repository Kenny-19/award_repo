import { handleApi } from "../../lib/core.mjs";
import { storeNetlify } from "../../lib/netlify-store.mjs";

export default (request) => {
  const lire = (nom) => globalThis.Netlify?.env?.get(nom) ?? process.env[nom];
  // RESULTAS_CLE : orthographe utilisée sur le tableau de bord Netlify de ce site.
  const cle = lire("RESULTATS_CLE") ?? lire("RESULTAS_CLE");
  return handleApi(request, storeNetlify(), { RESULTATS_CLE: cle?.trim() });
};

export const config = { path: "/api/*" };
