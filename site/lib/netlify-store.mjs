import { getStore } from "@netlify/blobs";

// Lecture forte pour que les résultats comptent bien tous les votes déjà écrits.
export function storeNetlify() {
  // Nouveau nom pour la remise à zéro : les votes de test restent dans l'ancien stockage, inutilisés.
  const store = getStore({ name: "agent-de-l-annee-officiel", consistency: "strong" });
  return {
    async list(prefix) {
      const { blobs } = await store.list({ prefix });
      return blobs.map((b) => b.key);
    },
    get: (key) => store.get(key),
    set: (key, value) => store.set(key, value),
  };
}
