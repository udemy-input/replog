// Tests für die API-Routen (server/routes.ts): Datumsprüfung, Sätze, Workout-Liste und Coach
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

// db-Modul durch eine In-Memory-Datenbank ersetzen (node:sqlite, keine nativen Pakete).
// Der Mock greift auch in ./coach und ./stats, die routes.ts importiert.
vi.mock("./db", async () => {
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE exercises (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      level INTEGER NOT NULL
    );
    CREATE TABLE workouts (
      id INTEGER PRIMARY KEY,
      date TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      notes TEXT
    );
    CREATE TABLE sets (
      id INTEGER PRIMARY KEY,
      workout_id INTEGER NOT NULL REFERENCES workouts(id),
      exercise_id INTEGER NOT NULL REFERENCES exercises(id),
      reps INTEGER,
      seconds INTEGER
    );
    INSERT INTO exercises (id, name, category, level) VALUES
      (1, 'Klimmzüge', 'pull', 2),
      (2, 'L-Sit', 'core', 2),
      (3, 'Dips', 'push', 2),
      (4, 'Australian Rows', 'pull', 1);
  `);
  return { db };
});

import { db } from "./db";
import { handleApi, isValidIsoDate, MAX_SAETZE, MAX_SATZWERT, pruefeSaetze } from "./routes";

/** Liste mit n gleichen gültigen Sätzen */
function vieleSaetze(n: number) {
  return Array.from({ length: n }, () => ({ exerciseId: 1, reps: 8 }));
}

/** Schickt eine Anfrage an die API und liefert Status und JSON-Antwort */
async function anfrage(method: string, pfad: string, data?: unknown) {
  const chunks = data === undefined ? [] : [JSON.stringify(data)];
  const req = Readable.from(chunks) as unknown as IncomingMessage;
  req.method = method;
  let status = 0;
  let raw = "";
  const res = {
    writeHead(s: number) {
      status = s;
      return this;
    },
    end(chunk: string) {
      raw = chunk;
    },
  } as unknown as ServerResponse;
  const behandelt = await handleApi(req, res, new URL(`http://localhost${pfad}`));
  return { behandelt, status, body: raw ? JSON.parse(raw) : undefined };
}

/** Schickt einen POST an /api/workouts und liefert Status und JSON-Antwort */
async function postWorkout(data: unknown) {
  return anfrage("POST", "/api/workouts", data);
}

/** Schickt einen GET an den angegebenen Pfad */
async function get(pfad: string) {
  return anfrage("GET", pfad);
}

function countWorkouts() {
  return (db.prepare("SELECT COUNT(*) AS n FROM workouts").get() as { n: number }).n;
}

function countSets() {
  return (db.prepare("SELECT COUNT(*) AS n FROM sets").get() as { n: number }).n;
}

beforeEach(() => {
  // Sätze zuerst, da sie auf Workouts verweisen
  db.exec("DELETE FROM sets");
  db.exec("DELETE FROM workouts");
});

describe("isValidIsoDate", () => {
  it.each(["2026-10-16", "2024-02-29", "2000-02-29", "1999-12-31", "2026-01-01"])("akzeptiert %s", (d) => {
    expect(isValidIsoDate(d)).toBe(true);
  });

  it.each([
    "2026-13-01", // Monat 13
    "2026-00-10", // Monat 0
    "2026-02-30", // 30. Februar
    "2025-02-29", // kein Schaltjahr
    "1900-02-29", // kein Schaltjahr (Jahrhundert)
    "2026-04-31", // April hat 30 Tage
    "2026-10-00", // Tag 0
    "2026-1-05", // Monat einstellig
    "2026-10-5", // Tag einstellig
    "26-10-16", // Jahr zweistellig
    "16.10.2026", // deutsches Format
    "2026/10/16", // falsches Trennzeichen
    "2026-10-16T10:00:00Z", // mit Uhrzeit
    " 2026-10-16", // führendes Leerzeichen
    "2026-10-16\n", // abschließender Zeilenumbruch
    "",
  ])("lehnt %j ab", (d) => {
    expect(isValidIsoDate(d)).toBe(false);
  });

  it.each([20261016, null, undefined, {}, ["2026-10-16"]])("lehnt Nicht-String %j ab", (d) => {
    expect(isValidIsoDate(d)).toBe(false);
  });
});

describe("pruefeSaetze", () => {
  it.each([undefined, null])("liefert bei %j keine Sätze", (v) => {
    expect(pruefeSaetze(v)).toEqual({ saetze: [] });
  });

  it("liefert bei leerer Liste keine Sätze", () => {
    expect(pruefeSaetze([])).toEqual({ saetze: [] });
  });

  it("übernimmt gültige Sätze in Eingabereihenfolge, der jeweils andere Wert ist null", () => {
    expect(
      pruefeSaetze([
        { exerciseId: 1, reps: 8 },
        { exerciseId: 2, seconds: 20 },
        { exerciseId: 1, reps: 6, seconds: null },
      ]),
    ).toEqual({
      saetze: [
        { exerciseId: 1, reps: 8, seconds: null },
        { exerciseId: 2, reps: null, seconds: 20 },
        { exerciseId: 1, reps: 6, seconds: null },
      ],
    });
  });

  it.each([{}, "abc", 5, true])("meldet sets=%j als keine Liste", (v) => {
    expect(pruefeSaetze(v)).toEqual({ error: "sets muss eine Liste sein" });
  });

  it.each([null, 5, "Satz"])("meldet Eintrag %j als ungültig", (eintrag) => {
    expect(pruefeSaetze([eintrag])).toEqual({ error: "Satz 1: ungültiger Eintrag" });
  });

  it.each([
    ["0", 0],
    ["negativ", -1],
    ["Kommazahl", 2.5],
    ["Text", "1"],
    ["fehlend", undefined],
    ["null", null],
    ["nicht vorhanden", 999],
  ])("meldet exerciseId %s als unbekannte Übung", (_, exerciseId) => {
    expect(pruefeSaetze([{ exerciseId, reps: 8 }])).toEqual({ error: "Satz 1: unbekannte Übung" });
  });

  it.each([
    ["reps und seconds gleichzeitig", { exerciseId: 1, reps: 8, seconds: 20 }],
    ["keins von beiden", { exerciseId: 1 }],
    ["beide null", { exerciseId: 1, reps: null, seconds: null }],
  ])("verlangt genau einen Wert: %s", (_, satz) => {
    expect(pruefeSaetze([satz])).toEqual({
      error: "Satz 1: entweder Wiederholungen oder Sekunden angeben",
    });
  });

  it.each([0, -1, 2.5, "8"])("lehnt reps=%j ab", (reps) => {
    expect(pruefeSaetze([{ exerciseId: 1, reps }])).toEqual({
      error: "Satz 1: Wiederholungen müssen eine ganze Zahl ab 1 sein",
    });
  });

  it.each([0, -1, 2.5, "8"])("lehnt seconds=%j ab", (seconds) => {
    expect(pruefeSaetze([{ exerciseId: 2, seconds }])).toEqual({
      error: "Satz 1: Sekunden müssen eine ganze Zahl ab 1 sein",
    });
  });

  it.each([
    [
      2,
      [
        { exerciseId: 1, reps: 8 },
        { exerciseId: 999, reps: 8 },
      ],
      "unbekannte Übung",
    ],
    [
      3,
      [
        { exerciseId: 1, reps: 8 },
        { exerciseId: 2, seconds: 20 },
        { exerciseId: 1, reps: 0 },
      ],
      "Wiederholungen müssen eine ganze Zahl ab 1 sein",
    ],
    [2, [{ exerciseId: 1, reps: 8 }, null], "ungültiger Eintrag"],
  ])("nennt den richtigen Index Satz %i in der Meldung", (n, saetze, rest) => {
    expect(pruefeSaetze(saetze)).toEqual({ error: `Satz ${n}: ${rest}` });
  });
});

describe("pruefeSaetze – Grenzen", () => {
  it("exportiert die Grenzwerte 200 Sätze und 10000 pro Satz", () => {
    expect(MAX_SAETZE).toBe(200);
    expect(MAX_SATZWERT).toBe(10000);
  });

  it(`akzeptiert genau ${MAX_SAETZE} Sätze`, () => {
    const r = pruefeSaetze(vieleSaetze(MAX_SAETZE));
    expect("saetze" in r && r.saetze.length).toBe(MAX_SAETZE);
  });

  it(`lehnt ${MAX_SAETZE + 1} Sätze ab`, () => {
    expect(pruefeSaetze(vieleSaetze(MAX_SAETZE + 1))).toEqual({ error: "Höchstens 200 Sätze pro Training" });
  });

  it("prüft die Höchstzahl vor den einzelnen Sätzen", () => {
    const saetze = [null, ...vieleSaetze(MAX_SAETZE)];
    expect(pruefeSaetze(saetze)).toEqual({ error: "Höchstens 200 Sätze pro Training" });
  });

  it.each([
    ["reps", "Wiederholungen"],
    ["seconds", "Sekunden"],
  ])(`akzeptiert %s = ${MAX_SATZWERT}`, (feld) => {
    expect(pruefeSaetze([{ exerciseId: 1, [feld]: MAX_SATZWERT }])).toEqual({
      saetze: [
        {
          exerciseId: 1,
          reps: feld === "reps" ? MAX_SATZWERT : null,
          seconds: feld === "seconds" ? MAX_SATZWERT : null,
        },
      ],
    });
  });

  it.each([
    ["reps", "Wiederholungen", 10001],
    ["seconds", "Sekunden", 10001],
    ["reps", "Wiederholungen", 1_000_000],
    ["seconds", "Sekunden", Number.MAX_SAFE_INTEGER],
  ])("lehnt %s = %i mit Obergrenze ab", (feld, was, wert) => {
    expect(pruefeSaetze([{ exerciseId: 1, [feld]: wert }])).toEqual({
      error: `Satz 1: ${was} dürfen höchstens 10000 sein`,
    });
  });

  it("nennt bei Überschreitung den richtigen Satz", () => {
    expect(
      pruefeSaetze([
        { exerciseId: 1, reps: 8 },
        { exerciseId: 2, seconds: 10001 },
      ]),
    ).toEqual({
      error: "Satz 2: Sekunden dürfen höchstens 10000 sein",
    });
  });

  it.each([
    ["reps", "Wiederholungen", 1e300],
    ["seconds", "Sekunden", 1e300],
    ["reps", "Wiederholungen", Number.MAX_SAFE_INTEGER + 1],
    ["seconds", "Sekunden", Infinity],
  ])("lehnt %s = %d als keine sichere Ganzzahl ab", (feld, was, wert) => {
    expect(pruefeSaetze([{ exerciseId: 1, [feld]: wert }])).toEqual({
      error: `Satz 1: ${was} müssen eine ganze Zahl ab 1 sein`,
    });
  });

  it("lehnt exerciseId 1e300 als unbekannte Übung ab", () => {
    expect(pruefeSaetze([{ exerciseId: 1e300, reps: 8 }])).toEqual({ error: "Satz 1: unbekannte Übung" });
  });
});

describe("POST /api/workouts", () => {
  it("speichert ein Workout mit gültigem Datum", async () => {
    const r = await postWorkout({ date: "2026-10-16", minutes: 30 });
    expect(r.status).toBe(201);
    expect(r.body.id).toEqual(expect.any(Number));
    expect(countWorkouts()).toBe(1);
    expect(countSets()).toBe(0);
  });

  it.each(["2026-02-30", "16.10.2026", "2026-10-16T10:00", "heute"])(
    "antwortet bei date=%j mit 400 und deutscher Meldung",
    async (date) => {
      const r = await postWorkout({ date, minutes: 30 });
      expect(r.status).toBe(400);
      expect(r.body.error).toBe("date muss ein gültiges Datum im Format YYYY-MM-DD sein");
      expect(countWorkouts()).toBe(0);
    },
  );

  it("antwortet bei date als Zahl mit 400", async () => {
    const r = await postWorkout({ date: 20261016, minutes: 30 });
    expect(r.status).toBe(400);
    expect(countWorkouts()).toBe(0);
  });

  it("meldet fehlendes date weiterhin als Pflichtfeld", async () => {
    const r = await postWorkout({ minutes: 30 });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe("date und minutes sind Pflicht");
  });

  it("speichert Sätze mit richtiger workout_id in Eingabereihenfolge", async () => {
    const r = await postWorkout({
      date: "2026-10-16",
      minutes: 30,
      sets: [
        { exerciseId: 1, reps: 8 },
        { exerciseId: 2, seconds: 20 },
        { exerciseId: 1, reps: 6 },
      ],
    });
    expect(r.status).toBe(201);
    expect(countWorkouts()).toBe(1);
    const zeilen = db
      .prepare("SELECT workout_id, exercise_id, reps, seconds FROM sets ORDER BY id")
      .all()
      .map((z) => ({ ...z }));
    expect(zeilen).toEqual([
      { workout_id: r.body.id, exercise_id: 1, reps: 8, seconds: null },
      { workout_id: r.body.id, exercise_id: 2, reps: null, seconds: 20 },
      { workout_id: r.body.id, exercise_id: 1, reps: 6, seconds: null },
    ]);
  });

  it("speichert mit sets: null ein Workout ohne Sätze", async () => {
    const r = await postWorkout({ date: "2026-10-16", minutes: 30, sets: null });
    expect(r.status).toBe(201);
    expect(countWorkouts()).toBe(1);
    expect(countSets()).toBe(0);
  });

  it.each([
    ["sets kein Array", { exerciseId: 1, reps: 8 }, "sets muss eine Liste sein"],
    [
      "unbekannte Übung",
      [
        { exerciseId: 1, reps: 8 },
        { exerciseId: 999, reps: 8 },
      ],
      "Satz 2: unbekannte Übung",
    ],
    [
      "reps und seconds",
      [{ exerciseId: 1, reps: 8, seconds: 20 }],
      "Satz 1: entweder Wiederholungen oder Sekunden angeben",
    ],
    ["reps 0", [{ exerciseId: 1, reps: 0 }], "Satz 1: Wiederholungen müssen eine ganze Zahl ab 1 sein"],
    [
      "seconds als Text",
      [{ exerciseId: 2, seconds: "20" }],
      "Satz 1: Sekunden müssen eine ganze Zahl ab 1 sein",
    ],
  ])("antwortet bei %s mit 400 und speichert weder Workout noch Satz", async (_, sets, meldung) => {
    const r = await postWorkout({ date: "2026-10-16", minutes: 30, sets });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe(meldung);
    expect(countWorkouts()).toBe(0);
    expect(countSets()).toBe(0);
  });

  it(`antwortet bei ${MAX_SAETZE + 1} Sätzen mit 400 und speichert nichts`, async () => {
    const r = await postWorkout({ date: "2026-10-16", minutes: 30, sets: vieleSaetze(MAX_SAETZE + 1) });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe("Höchstens 200 Sätze pro Training");
    expect(countWorkouts()).toBe(0);
    expect(countSets()).toBe(0);
  });

  it(`speichert genau ${MAX_SAETZE} Sätze`, async () => {
    const r = await postWorkout({ date: "2026-10-16", minutes: 30, sets: vieleSaetze(MAX_SAETZE) });
    expect(r.status).toBe(201);
    expect(countWorkouts()).toBe(1);
    expect(countSets()).toBe(MAX_SAETZE);
  });

  it("antwortet bei Satzwert über 10000 mit 400 und speichert nichts", async () => {
    const r = await postWorkout({ date: "2026-10-16", minutes: 30, sets: [{ exerciseId: 1, reps: 10001 }] });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe("Satz 1: Wiederholungen dürfen höchstens 10000 sein");
    expect(countWorkouts()).toBe(0);
    expect(countSets()).toBe(0);
  });
});

describe("GET /api/workouts", () => {
  it("liefert eine leere Liste ohne Workouts", async () => {
    const r = await get("/api/workouts");
    expect(r.status).toBe(200);
    expect(r.body).toEqual([]);
  });

  it("liefert ein leeres sets-Array für Workouts ohne Sätze", async () => {
    await postWorkout({ date: "2026-10-16", minutes: 30, notes: "locker" });
    const r = await get("/api/workouts");
    expect(r.status).toBe(200);
    expect(r.body).toEqual([
      { id: expect.any(Number), date: "2026-10-16", minutes: 30, notes: "locker", sets: [] },
    ]);
  });

  it("liefert pro Workout nur dessen Sätze mit Übungsname in Eingabereihenfolge", async () => {
    const a = await postWorkout({
      date: "2026-10-15",
      minutes: 30,
      sets: [
        { exerciseId: 1, reps: 8 },
        { exerciseId: 2, seconds: 20 },
      ],
    });
    const b = await postWorkout({
      date: "2026-10-16",
      minutes: 45,
      sets: [
        { exerciseId: 3, reps: 10 },
        { exerciseId: 1, reps: 6 },
      ],
    });
    const leer = await postWorkout({ date: "2026-10-14", minutes: 20 });

    const r = await get("/api/workouts");
    expect(r.status).toBe(200);
    // Sortierung: neuestes Datum zuerst
    expect(r.body.map((w: { id: number }) => w.id)).toEqual([b.body.id, a.body.id, leer.body.id]);
    expect(r.body[0].sets).toEqual([
      { exerciseId: 3, name: "Dips", reps: 10, seconds: null },
      { exerciseId: 1, name: "Klimmzüge", reps: 6, seconds: null },
    ]);
    expect(r.body[1].sets).toEqual([
      { exerciseId: 1, name: "Klimmzüge", reps: 8, seconds: null },
      { exerciseId: 2, name: "L-Sit", reps: null, seconds: 20 },
    ]);
    expect(r.body[2].sets).toEqual([]);
  });
});

describe("GET /api/coach", () => {
  it("antwortet mit 200 und einem Eintrag pro Kategorie", async () => {
    const r = await get("/api/coach");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body)).toBe(true);
    // Mock-Übungen: core, pull (2 Übungen), push
    expect(r.body.map((e: { category: string }) => e.category)).toEqual(["core", "pull", "push"]);
  });

  it("liefert in jedem Eintrag zielTage: 3", async () => {
    const r = await get("/api/coach");
    expect(r.body.length).toBeGreaterThan(0);
    for (const e of r.body) expect(e.zielTage).toBe(3);
  });
});

describe("unbekannte Routen", () => {
  it("gibt false zurück, wenn keine Route passt", async () => {
    const r = await get("/api/gibtsnicht");
    expect(r.behandelt).toBe(false);
  });
});
