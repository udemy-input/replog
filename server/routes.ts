// API-Routen unter /api
import type { IncomingMessage, ServerResponse } from "node:http";
import { db } from "./db";
import { coachVorschlaege } from "./coach";
import { weeklyMinutes } from "./stats";

export function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function body(req: IncomingMessage) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

// Prüft, ob value genau dem Format YYYY-MM-DD entspricht und ein existierendes Kalenderdatum ist
export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export type Satz = { exerciseId: number; reps: number | null; seconds: number | null };

/** Höchstzahl an Sätzen pro Workout */
export const MAX_SAETZE = 200;
/** Obergrenze für Wiederholungen bzw. Sekunden eines Satzes */
export const MAX_SATZWERT = 10000;

const istPositiveGanzzahl = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 1;

/**
 * Prüft die optionalen Sätze eines Workouts. Fehlt `value`, gibt es keine Sätze.
 * Jeder Satz braucht eine vorhandene Übung und genau einen Wert: Wiederholungen oder Sekunden.
 */
export function pruefeSaetze(value: unknown): { saetze: Satz[] } | { error: string } {
  if (value === undefined || value === null) return { saetze: [] };
  if (!Array.isArray(value)) return { error: "sets muss eine Liste sein" };
  if (value.length > MAX_SAETZE) return { error: `Höchstens ${MAX_SAETZE} Sätze pro Training` };
  const uebungVorhanden = db.prepare("SELECT 1 FROM exercises WHERE id = ?");
  const saetze: Satz[] = [];
  for (const [i, s] of value.entries()) {
    const nr = `Satz ${i + 1}`;
    if (typeof s !== "object" || s === null) return { error: `${nr}: ungültiger Eintrag` };
    const { exerciseId, reps, seconds } = s as Record<string, unknown>;
    if (!istPositiveGanzzahl(exerciseId) || !uebungVorhanden.get(exerciseId)) {
      return { error: `${nr}: unbekannte Übung` };
    }
    const hatReps = reps !== undefined && reps !== null;
    const hatSekunden = seconds !== undefined && seconds !== null;
    if (hatReps === hatSekunden) {
      return { error: `${nr}: entweder Wiederholungen oder Sekunden angeben` };
    }
    const wert = hatReps ? reps : seconds;
    if (!istPositiveGanzzahl(wert)) {
      return { error: `${nr}: ${hatReps ? "Wiederholungen" : "Sekunden"} müssen eine ganze Zahl ab 1 sein` };
    }
    if (wert > MAX_SATZWERT) {
      return {
        error: `${nr}: ${hatReps ? "Wiederholungen" : "Sekunden"} dürfen höchstens ${MAX_SATZWERT} sein`,
      };
    }
    saetze.push({ exerciseId, reps: hatReps ? wert : null, seconds: hatSekunden ? wert : null });
  }
  return { saetze };
}

type Workout = { id: number; date: string; minutes: number; notes: string | null };
// Antworttypen von GET /api/workouts – Gegenstück in src/main.ts
export type WorkoutSatz = { exerciseId: number; name: string; reps: number | null; seconds: number | null };
export type WorkoutMitSaetzen = Workout & { sets: WorkoutSatz[] };
type SatzMitName = WorkoutSatz & { workoutId: number };

/** Die letzten 20 Workouts, jeweils mit ihren Sätzen in Eingabereihenfolge */
function letzteWorkouts(): WorkoutMitSaetzen[] {
  const workouts = db.prepare("SELECT * FROM workouts ORDER BY date DESC LIMIT 20").all() as Workout[];
  if (!workouts.length) return [];
  const saetze = db
    .prepare(
      `SELECT s.workout_id AS workoutId, s.exercise_id AS exerciseId, e.name, s.reps, s.seconds
       FROM sets s JOIN exercises e ON e.id = s.exercise_id
       WHERE s.workout_id IN (${workouts.map(() => "?").join(", ")})
       ORDER BY s.id`,
    )
    .all(...workouts.map((w) => w.id)) as SatzMitName[];
  return workouts.map((w) => ({
    ...w,
    sets: saetze
      .filter((s) => s.workoutId === w.id)
      .map(({ exerciseId, name, reps, seconds }) => ({ exerciseId, name, reps, seconds })),
  }));
}

// Beantwortet API-Anfragen; gibt false zurück, wenn keine Route passt
export async function handleApi(req: IncomingMessage, res: ServerResponse, url: URL): Promise<boolean> {
  if (url.pathname === "/api/exercises" && req.method === "GET") {
    json(res, 200, db.prepare("SELECT * FROM exercises ORDER BY category, level").all());
    return true;
  }
  if (url.pathname === "/api/workouts" && req.method === "GET") {
    json(res, 200, letzteWorkouts());
    return true;
  }
  if (url.pathname === "/api/workouts" && req.method === "POST") {
    const b = await body(req);
    if (!b.date || !b.minutes) {
      json(res, 400, { error: "date und minutes sind Pflicht" });
      return true;
    }
    if (!isValidIsoDate(b.date)) {
      json(res, 400, { error: "date muss ein gültiges Datum im Format YYYY-MM-DD sein" });
      return true;
    }
    const geprueft = pruefeSaetze(b.sets);
    if ("error" in geprueft) {
      json(res, 400, { error: geprueft.error });
      return true;
    }
    // Workout und Sätze gemeinsam speichern: ganz oder gar nicht
    db.exec("BEGIN");
    let id: number;
    try {
      const r = db
        .prepare("INSERT INTO workouts (date, minutes, notes) VALUES (?, ?, ?)")
        .run(b.date, b.minutes, b.notes ?? null);
      id = Number(r.lastInsertRowid);
      if (geprueft.saetze.length) {
        const satz = db.prepare(
          "INSERT INTO sets (workout_id, exercise_id, reps, seconds) VALUES (?, ?, ?, ?)",
        );
        for (const s of geprueft.saetze) satz.run(id, s.exerciseId, s.reps, s.seconds);
      }
      db.exec("COMMIT");
    } catch (err) {
      try {
        db.exec("ROLLBACK");
      } catch {
        // Ursprünglichen Fehler weiterreichen, nicht den des Rollbacks
      }
      throw err;
    }
    json(res, 201, { id });
    return true;
  }
  if (url.pathname === "/api/stats" && req.method === "GET") {
    json(res, 200, { weeklyMinutes: weeklyMinutes() });
    return true;
  }
  if (url.pathname === "/api/coach" && req.method === "GET") {
    json(res, 200, coachVorschlaege());
    return true;
  }
  return false;
}
