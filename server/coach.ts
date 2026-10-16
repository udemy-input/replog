// Progressions-Coach: schlägt pro Kategorie die Übung vor, die als Nächstes dran ist
import { db } from "./db";
import { localIsoDate } from "./stats";

export type Uebung = { id: number; name: string; category: string; level: number };
export type CoachStatus = "einstieg" | "dranbleiben" | "aufsteigen" | "maximum";
export type CoachEintrag = {
  category: string;
  status: CoachStatus;
  /** Trainingstage der aktuellen Übung im Zeitfenster */
  tage: number;
  /** Nötige Trainingstage für den Aufstieg (MIN_TAGE), damit das Frontend den Wert nicht kopieren muss */
  zielTage: number;
  /** Höchste bisher trainierte Übung der Kategorie, null wenn noch nie trainiert */
  aktuell: Uebung | null;
  /** Übung, die als Nächstes trainiert werden soll */
  vorschlag: Uebung;
};

/** Länge des Zeitfensters in Kalendertagen (heute eingeschlossen) */
export const FENSTER_TAGE = 14;
/** Mindestanzahl verschiedener Trainingstage im Fenster für den Aufstieg */
export const MIN_TAGE = 3;

const nachName = (a: Uebung, b: Uebung) => a.name.localeCompare(b.name, "de");

/**
 * Nächste Übung derselben Kategorie mit höherem Level: kleinstes Level über dem
 * aktuellen, bei Gleichstand alphabetisch die erste. null, wenn es keine gibt.
 */
export function naechsteUebung(uebungen: Uebung[], aktuell: Uebung): Uebung | null {
  const hoeher = uebungen
    .filter((u) => u.category === aktuell.category && u.level > aktuell.level)
    .sort((a, b) => a.level - b.level || nachName(a, b));
  return hoeher[0] ?? null;
}

type Zeile = Uebung & { tage: number; jemals: number };

/**
 * Coach-Vorschläge für alle Kategorien, sortiert nach Kategorie.
 * Zeitfenster: heute und die 13 Tage davor (lokales Datum), Einträge in der Zukunft zählen nicht.
 * Mehrere Sätze oder Workouts am selben Tag zählen als ein Trainingstag.
 */
export function coachVorschlaege(today = new Date()): CoachEintrag[] {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (FENSTER_TAGE - 1));
  const von = localIsoDate(from);
  const bis = localIsoDate(today);
  const zeilen = db
    .prepare(
      `SELECT e.id, e.name, e.category, e.level,
         (SELECT COUNT(DISTINCT w.date) FROM sets s JOIN workouts w ON w.id = s.workout_id
            WHERE s.exercise_id = e.id AND w.date BETWEEN ? AND ?) AS tage,
         EXISTS (SELECT 1 FROM sets s JOIN workouts w ON w.id = s.workout_id
            WHERE s.exercise_id = e.id AND w.date <= ?) AS jemals
       FROM exercises e`,
    )
    .all(von, bis, bis) as Zeile[];

  const uebungen: Uebung[] = zeilen.map(({ id, name, category, level }) => ({ id, name, category, level }));
  const kategorien = [...new Set(zeilen.map((z) => z.category))].sort();

  return kategorien.map((category) => ({ ...bewerteKategorie(category), zielTage: MIN_TAGE }));

  function bewerteKategorie(category: string): Omit<CoachEintrag, "zielTage"> {
    const inKategorie = zeilen.filter((z) => z.category === category);
    const imFenster = inKategorie.filter((z) => z.tage > 0);
    // Höchstes Level gewinnt, dann mehr Trainingstage, dann Name
    const kandidaten = imFenster.length ? imFenster : inKategorie.filter((z) => z.jemals);
    const aktuellZeile = kandidaten.sort((a, b) => b.level - a.level || b.tage - a.tage || nachName(a, b))[0];

    if (!aktuellZeile) {
      const einstieg = [...inKategorie].sort((a, b) => a.level - b.level || nachName(a, b))[0];
      return { category, status: "einstieg", tage: 0, aktuell: null, vorschlag: ohneZaehler(einstieg) };
    }

    const aktuell = ohneZaehler(aktuellZeile);
    const tage = aktuellZeile.tage;
    if (tage < MIN_TAGE) return { category, status: "dranbleiben", tage, aktuell, vorschlag: aktuell };
    const naechste = naechsteUebung(uebungen, aktuell);
    return naechste
      ? { category, status: "aufsteigen", tage, aktuell, vorschlag: naechste }
      : { category, status: "maximum", tage, aktuell, vorschlag: aktuell };
  }
}

function ohneZaehler({ id, name, category, level }: Zeile): Uebung {
  return { id, name, category, level };
}
