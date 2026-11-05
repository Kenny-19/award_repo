import { handleApi } from "../../lib/core.mjs";
import { storeNetlify } from "../../lib/netlify-store.mjs";

export default (request) => {
  const cle = globalThis.Netlify?.env?.get("RESULTATS_CLE") ?? process.env.RESULTATS_CLE;
  return handleApi(request, storeNetlify(), { RESULTATS_CLE: cle?.trim() });
};

export const config = { path: "/api/*" };
