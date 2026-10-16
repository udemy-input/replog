// DOM-freie Hilfsfunktionen für das Frontend (in Vitest unter Node testbar)

/** Maskiert Text, damit er gefahrlos per innerHTML eingesetzt werden kann */
export function escapeHtml(text: unknown): string {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Liefert für eine fehlgeschlagene Antwort eine deutsche Fehlermeldung,
 * bei Erfolg null. Nutzt die Meldung des Servers, falls vorhanden.
 */
export async function fehlerAusAntwort(res: Response): Promise<string | null> {
  if (res.ok) return null;
  let detail = "";
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body.error === "string") detail = body.error;
  } catch {
    // Antwort war kein JSON – allgemeine Meldung verwenden
  }
  return `Speichern fehlgeschlagen (${res.status})${detail ? `: ${detail}` : "."}`;
}
