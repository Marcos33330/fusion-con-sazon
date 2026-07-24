import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ContentDict } from "../types";

// Carga todos los bloques de texto una sola vez y expone un getter por key,
// con un fallback por si todavía no existe esa key en la base de datos.
export function useContent() {
  const [content, setContent] = useState<ContentDict>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ContentDict>("/content")
      .then(setContent)
      .catch(() => setContent({}))
      .finally(() => setLoading(false));
  }, []);

  function get(key: string, fallback = "") {
    return content[key]?.body ?? fallback;
  }

  return { content, get, loading };
}
