import { handleApi } from "../../lib/core.mjs";
import { storeNetlify } from "../../lib/netlify-store.mjs";

export default (request) => handleApi(request, storeNetlify(), process.env);

export const config = { path: "/api/*" };
