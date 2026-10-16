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

/** Eine Übungszeile im Formular, Werte roh als Text aus den Eingabefeldern */
export type SatzZeile = { exerciseId: string; anzahl: string; wert: string; einheit: "reps" | "seconds" };
/** Ein Satz, wie ihn POST /api/workouts erwartet */
export type SatzEingabe = { exerciseId: number; reps?: number; seconds?: number };

/** Höchstzahl gleicher Sätze pro Formularzeile */
export const MAX_SAETZE_PRO_ZEILE = 20;

function ganzzahl(text: string): number | null {
  const n = Number(text.trim());
  return text.trim() !== "" && Number.isInteger(n) ? n : null;
}

/**
 * Wandelt die Übungszeilen des Formulars in Sätze für die API um.
 * Jede Zeile steht für `anzahl` gleiche Sätze. Bei ungültigen Eingaben gibt es eine deutsche Fehlermeldung.
 */
export function saetzeAusZeilen(zeilen: SatzZeile[]): { sets: SatzEingabe[] } | { fehler: string } {
  const sets: SatzEingabe[] = [];
  for (const [i, z] of zeilen.entries()) {
    const nr = `Übung ${i + 1}`;
    const exerciseId = ganzzahl(z.exerciseId);
    if (exerciseId === null) return { fehler: `${nr}: Bitte eine Übung auswählen.` };
    const anzahl = ganzzahl(z.anzahl);
    if (anzahl === null || anzahl < 1 || anzahl > MAX_SAETZE_PRO_ZEILE) {
      return { fehler: `${nr}: Anzahl der Sätze muss zwischen 1 und ${MAX_SAETZE_PRO_ZEILE} liegen.` };
    }
    const wert = ganzzahl(z.wert);
    const was = z.einheit === "seconds" ? "Sekunden" : "Wiederholungen";
    if (wert === null || wert < 1) return { fehler: `${nr}: ${was} müssen eine ganze Zahl ab 1 sein.` };
    const satz: SatzEingabe =
      z.einheit === "seconds" ? { exerciseId, seconds: wert } : { exerciseId, reps: wert };
    for (let k = 0; k < anzahl; k++) sets.push({ ...satz });
  }
  return { sets };
}

/** Satz eines gespeicherten Workouts, wie ihn GET /api/workouts liefert */
export type GespeicherterSatz = { name: string; reps: number | null; seconds: number | null };

/**
 * Kurzform der Sätze, z. B. „Klimmzüge 3×8, L-Sit 2×20 s“.
 * Gleiche Werte einer Übung werden zusammengefasst, verschiedene mit „+“ verbunden.
 */
export function formatiereSaetze(saetze: GespeicherterSatz[]): string {
  const proUebung = new Map<string, Map<string, number>>();
  for (const s of saetze) {
    const wert = s.reps !== null ? String(s.reps) : `${s.seconds} s`;
    const gruppen = proUebung.get(s.name) ?? new Map<string, number>();
    gruppen.set(wert, (gruppen.get(wert) ?? 0) + 1);
    proUebung.set(s.name, gruppen);
  }
  return [...proUebung]
    .map(([name, gruppen]) => `${name} ${[...gruppen].map(([wert, n]) => `${n}×${wert}`).join(" + ")}`)
    .join(", ");
}

const KATEGORIEN: Record<string, string> = {
  pull: "Zug",
  push: "Druck",
  legs: "Beine",
  core: "Rumpf",
  skill: "Skill",
};

/** Deutscher Anzeigename einer Kategorie, unbekannte Kategorien unverändert */
export function kategorieName(category: string): string {
  return KATEGORIEN[category] ?? category;
}
