// Tests für den Progressions-Coach (server/coach.ts)
//
// Spezifikation: coachVorschlaege(today) betrachtet heute und die 13 Tage davor
// (lokales Datum). Trainingstage = verschiedene Workout-Daten mit mindestens einem
// Satz der Übung. Pro Kategorie genau ein Eintrag, sortiert nach Kategorie.
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Zeitzone vor allen Date-Operationen festlegen
const originalTZ = vi.hoisted(() => {
  const tz = process.env.TZ;
  process.env.TZ = "Europe/Berlin";
  return tz;
});

// db-Modul durch eine In-Memory-Datenbank ersetzen (node:sqlite, keine nativen Pakete)
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
  `);
  const add = db.prepare("INSERT INTO exercises (name, category, level) VALUES (?, ?, ?)");
  for (const [name, category, level] of [
    ["Klimmzüge", "pull", 2],
    ["Australian Rows", "pull", 1],
    ["Muscle-up", "pull", 4],
    ["Dips", "push", 2],
    ["Liegestütze", "push", 1],
    ["Pike Push-ups", "push", 2],
    ["Pistol Squats", "legs", 3],
    ["L-Sit", "core", 2],
    ["Handstand an der Wand", "skill", 2],
    ["Front Lever Tuck", "skill", 3],
  ] as const)
    add.run(name, category, level);
  return { db };
});

import { db } from "./db";
import { coachVorschlaege, MIN_TAGE, naechsteUebung, type CoachEintrag, type Uebung } from "./coach";

/** Übung anhand des Namens aus der Mock-DB holen */
function uebung(name: string): Uebung {
  const u = db.prepare("SELECT id, name, category, level FROM exercises WHERE name = ?").get(name) as
    Uebung | undefined;
  if (!u) throw new Error(`Übung nicht gefunden: ${name}`);
  return { ...u };
}

function alleUebungen(): Uebung[] {
  return (db.prepare("SELECT id, name, category, level FROM exercises").all() as Uebung[]).map((u) => ({
    ...u,
  }));
}

/** Workout am Datum anlegen, mit je einem Satz pro angegebener Übung */
function training(date: string, ...uebungsNamen: string[]) {
  const { lastInsertRowid } = db.prepare("INSERT INTO workouts (date, minutes) VALUES (?, ?)").run(date, 30);
  for (const name of uebungsNamen) {
    db.prepare("INSERT INTO sets (workout_id, exercise_id, reps) VALUES (?, ?, ?)").run(
      lastInsertRowid,
      uebung(name).id,
      10,
    );
  }
}

/** Lokale Uhrzeit setzen (Monat 1-basiert) */
function setLocalNow(y: number, m: number, d: number, h = 12, min = 0) {
  vi.setSystemTime(new Date(y, m - 1, d, h, min));
}

/** Eintrag einer Kategorie aus dem Ergebnis holen */
function eintrag(ergebnis: CoachEintrag[], category: string): CoachEintrag {
  const e = ergebnis.find((x) => x.category === category);
  if (!e) throw new Error(`Kategorie fehlt: ${category}`);
  return e;
}

beforeEach(() => {
  db.exec("DELETE FROM sets; DELETE FROM workouts;");
  process.env.TZ = "Europe/Berlin";
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  process.env.TZ = "Europe/Berlin";
});

afterAll(() => {
  if (originalTZ === undefined) delete process.env.TZ;
  else process.env.TZ = originalTZ;
});

describe("coachVorschlaege – leere Datenbank und Struktur", () => {
  it("liefert bei leerer Datenbank für alle Kategorien den Einstieg", () => {
    setLocalNow(2026, 10, 16);
    const ergebnis = coachVorschlaege();
    expect(ergebnis.map((e) => e.category)).toEqual(["core", "legs", "pull", "push", "skill"]);
    for (const e of ergebnis) {
      expect(e.status).toBe("einstieg");
      expect(e.tage).toBe(0);
      expect(e.aktuell).toBeNull();
    }
    expect(eintrag(ergebnis, "pull").vorschlag).toEqual(uebung("Australian Rows"));
    expect(eintrag(ergebnis, "push").vorschlag).toEqual(uebung("Liegestütze"));
    expect(eintrag(ergebnis, "legs").vorschlag).toEqual(uebung("Pistol Squats"));
    expect(eintrag(ergebnis, "core").vorschlag).toEqual(uebung("L-Sit"));
    expect(eintrag(ergebnis, "skill").vorschlag).toEqual(uebung("Handstand an der Wand"));
  });

  it("liefert pro Kategorie genau einen Eintrag, sortiert nach Kategorie", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-16", "Klimmzüge", "Dips", "L-Sit", "Pike Push-ups");
    const kategorien = coachVorschlaege().map((e) => e.category);
    expect(kategorien).toEqual(["core", "legs", "pull", "push", "skill"]);
  });

  it("vorschlag und aktuell enthalten keine Zählerfelder", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-16", "Klimmzüge");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(Object.keys(pull.aktuell!).sort()).toEqual(["category", "id", "level", "name"]);
    expect(Object.keys(pull.vorschlag).sort()).toEqual(["category", "id", "level", "name"]);
  });

  it("jeder Eintrag enthält zielTage === MIN_TAGE, unabhängig vom Status", () => {
    setLocalNow(2026, 10, 16);
    expect(MIN_TAGE).toBe(3);
    // einstieg (core, legs, skill), dranbleiben (push), aufsteigen (pull)
    training("2026-10-16", "Dips");
    for (const d of ["2026-10-10", "2026-10-13", "2026-10-16"]) training(d, "Australian Rows");
    const ergebnis = coachVorschlaege();
    expect(new Set(ergebnis.map((e) => e.status))).toEqual(
      new Set(["einstieg", "dranbleiben", "aufsteigen"]),
    );
    for (const e of ergebnis) expect(e.zielTage).toBe(MIN_TAGE);
  });

  it("zielTage steht auch beim Status maximum im Eintrag", () => {
    setLocalNow(2026, 10, 16);
    for (const d of ["2026-10-10", "2026-10-12", "2026-10-16"]) training(d, "Muscle-up");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.status).toBe("maximum");
    expect(pull.zielTage).toBe(MIN_TAGE);
  });

  it("Workouts ohne Sätze beeinflussen nichts", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-16");
    training("2026-10-15");
    training("2026-10-14");
    for (const e of coachVorschlaege()) expect(e.status).toBe("einstieg");
  });
});

describe("coachVorschlaege – Trainingstage und Status", () => {
  it("2 Trainingstage → dranbleiben mit tage 2", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-14", "Australian Rows");
    training("2026-10-16", "Australian Rows");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.status).toBe("dranbleiben");
    expect(pull.tage).toBe(2);
    expect(pull.aktuell).toEqual(uebung("Australian Rows"));
    expect(pull.vorschlag).toEqual(uebung("Australian Rows"));
  });

  it("3 Trainingstage → aufsteigen von Australian Rows zu Klimmzügen", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-10", "Australian Rows");
    training("2026-10-13", "Australian Rows");
    training("2026-10-16", "Australian Rows");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.status).toBe("aufsteigen");
    expect(pull.tage).toBe(3);
    expect(pull.aktuell).toEqual(uebung("Australian Rows"));
    expect(pull.vorschlag).toEqual(uebung("Klimmzüge"));
  });

  it("3 Sätze am selben Tag zählen als 1 Trainingstag", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-16", "Australian Rows", "Australian Rows", "Australian Rows");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.tage).toBe(1);
    expect(pull.status).toBe("dranbleiben");
  });

  it("mehrere Workouts am selben Tag zählen als 1 Trainingstag", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-16", "Australian Rows");
    training("2026-10-16", "Australian Rows");
    training("2026-10-16", "Australian Rows");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.tage).toBe(1);
    expect(pull.status).toBe("dranbleiben");
  });

  it("Muscle-up an 3 Tagen → maximum, Vorschlag bleibt Muscle-up", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-10", "Muscle-up");
    training("2026-10-12", "Muscle-up");
    training("2026-10-16", "Muscle-up");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.status).toBe("maximum");
    expect(pull.tage).toBe(3);
    expect(pull.aktuell).toEqual(uebung("Muscle-up"));
    expect(pull.vorschlag).toEqual(uebung("Muscle-up"));
  });

  it("Liegestütze an 3 Tagen → Dips (alphabetisch vor Pike Push-ups)", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-10", "Liegestütze");
    training("2026-10-12", "Liegestütze");
    training("2026-10-16", "Liegestütze");
    const push = eintrag(coachVorschlaege(), "push");
    expect(push.status).toBe("aufsteigen");
    expect(push.vorschlag).toEqual(uebung("Dips"));
  });

  it("Lücke im Level: Klimmzüge an 3 Tagen → Muscle-up (Level 4)", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-10", "Klimmzüge");
    training("2026-10-12", "Klimmzüge");
    training("2026-10-16", "Klimmzüge");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.status).toBe("aufsteigen");
    expect(pull.vorschlag).toEqual(uebung("Muscle-up"));
  });

  it("höheres Level im Fenster gewinnt gegenüber häufiger trainiertem niedrigerem", () => {
    setLocalNow(2026, 10, 16);
    for (const d of ["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13"]) training(d, "Australian Rows");
    training("2026-10-16", "Klimmzüge");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.aktuell).toEqual(uebung("Klimmzüge"));
    expect(pull.tage).toBe(1);
    expect(pull.status).toBe("dranbleiben");
    expect(pull.vorschlag).toEqual(uebung("Klimmzüge"));
  });

  it("Gleichstand im Level: mehr Trainingstage gewinnt", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-14", "Dips");
    training("2026-10-14", "Pike Push-ups");
    training("2026-10-15", "Pike Push-ups");
    const push = eintrag(coachVorschlaege(), "push");
    expect(push.aktuell).toEqual(uebung("Pike Push-ups"));
    expect(push.tage).toBe(2);
  });

  it("Gleichstand im Level und bei den Tagen: alphabetisch erste gewinnt", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-14", "Pike Push-ups", "Dips");
    const push = eintrag(coachVorschlaege(), "push");
    expect(push.aktuell).toEqual(uebung("Dips"));
  });

  it("Pike Push-ups an 3 Tagen → maximum, Dips mit gleichem Level ist kein Aufstieg", () => {
    setLocalNow(2026, 10, 16);
    for (const d of ["2026-10-10", "2026-10-12", "2026-10-14"]) training(d, "Pike Push-ups");
    const push = eintrag(coachVorschlaege(), "push");
    // Dips hat dasselbe Level, ist also kein Aufstieg
    expect(push.status).toBe("maximum");
    expect(push.vorschlag).toEqual(uebung("Pike Push-ups"));
  });

  it("nur außerhalb des Fensters trainiert → dranbleiben mit tage 0", () => {
    setLocalNow(2026, 10, 16);
    training("2026-09-01", "Australian Rows");
    training("2026-09-02", "Klimmzüge");
    training("2026-09-03", "Klimmzüge");
    training("2026-09-04", "Klimmzüge");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.status).toBe("dranbleiben");
    expect(pull.tage).toBe(0);
    expect(pull.aktuell).toEqual(uebung("Klimmzüge"));
    expect(pull.vorschlag).toEqual(uebung("Klimmzüge"));
  });

  it("im Fenster trainierte Übung hat Vorrang vor höherer, nur früher trainierter Übung", () => {
    setLocalNow(2026, 10, 16);
    training("2026-09-01", "Muscle-up");
    training("2026-10-16", "Australian Rows");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.aktuell).toEqual(uebung("Australian Rows"));
    expect(pull.tage).toBe(1);
  });

  it("nur in der Zukunft trainiert → zählt weder für tage noch als jemals trainiert", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-17", "Klimmzüge");
    training("2026-10-18", "Klimmzüge");
    training("2027-01-01", "Klimmzüge");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.status).toBe("einstieg");
    expect(pull.aktuell).toBeNull();
    expect(pull.vorschlag).toEqual(uebung("Australian Rows"));
  });
});

describe("coachVorschlaege – Grenzen des 14-Tage-Fensters", () => {
  it("heute-13 zählt als Trainingstag", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-03", "Australian Rows");
    expect(eintrag(coachVorschlaege(), "pull").tage).toBe(1);
  });

  it("heute-14 zählt nicht (tage 0, aber jemals trainiert)", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-02", "Australian Rows");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.tage).toBe(0);
    expect(pull.status).toBe("dranbleiben");
  });

  it("morgen zählt nicht", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-15", "Australian Rows");
    training("2026-10-16", "Australian Rows");
    training("2026-10-17", "Australian Rows");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.tage).toBe(2);
    expect(pull.status).toBe("dranbleiben");
  });

  it("heute-13, heute und dazwischen ergeben genau 3 Tage → aufsteigen", () => {
    setLocalNow(2026, 10, 16);
    training("2026-10-02", "Australian Rows"); // heute-14 → zählt nicht
    training("2026-10-03", "Australian Rows");
    training("2026-10-09", "Australian Rows");
    training("2026-10-16", "Australian Rows");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.tage).toBe(3);
    expect(pull.status).toBe("aufsteigen");
  });

  it("00:15 Uhr: Fenstergrenzen nach lokalem Datum (UTC noch Vortag)", () => {
    setLocalNow(2026, 10, 16, 0, 15);
    expect(new Date().toISOString().slice(0, 10)).toBe("2026-10-15");
    training("2026-10-02", "Australian Rows"); // heute-14 → zählt nicht
    training("2026-10-03", "Australian Rows"); // heute-13 → zählt
    training("2026-10-16", "Australian Rows"); // heute → zählt
    training("2026-10-17", "Australian Rows"); // morgen → zählt nicht
    expect(eintrag(coachVorschlaege(), "pull").tage).toBe(2);
  });

  it("Monatswechsel: heute-13 liegt im Vormonat", () => {
    setLocalNow(2026, 11, 5);
    training("2026-10-22", "Australian Rows"); // heute-14 → zählt nicht
    training("2026-10-23", "Australian Rows"); // heute-13 → zählt
    training("2026-10-31", "Australian Rows");
    training("2026-11-05", "Australian Rows");
    const pull = eintrag(coachVorschlaege(), "pull");
    expect(pull.tage).toBe(3);
    expect(pull.status).toBe("aufsteigen");
  });

  it("Jahreswechsel: heute-13 liegt im Vorjahr", () => {
    setLocalNow(2027, 1, 5);
    training("2026-12-22", "Australian Rows"); // heute-14 → zählt nicht
    training("2026-12-23", "Australian Rows"); // heute-13 → zählt
    training("2026-12-31", "Australian Rows");
    training("2027-01-05", "Australian Rows");
    expect(eintrag(coachVorschlaege(), "pull").tage).toBe(3);
  });

  it("Neujahr 00:15 (UTC noch Silvester): Fenster korrekt", () => {
    setLocalNow(2027, 1, 1, 0, 15);
    expect(new Date().toISOString().slice(0, 10)).toBe("2026-12-31");
    training("2026-12-18", "Australian Rows"); // heute-14 → zählt nicht
    training("2026-12-19", "Australian Rows"); // heute-13 → zählt
    training("2027-01-01", "Australian Rows"); // heute → zählt
    expect(eintrag(coachVorschlaege(), "pull").tage).toBe(2);
  });

  it("Zeitumstellung (Ende Sommerzeit am 25.10.2026) im Fenster", () => {
    setLocalNow(2026, 11, 2, 0, 15);
    training("2026-10-19", "Australian Rows"); // heute-14 → zählt nicht
    training("2026-10-20", "Australian Rows"); // heute-13 → zählt
    training("2026-10-25", "Australian Rows"); // Tag der Umstellung → zählt
    training("2026-11-02", "Australian Rows"); // heute → zählt
    training("2026-11-03", "Australian Rows"); // morgen → zählt nicht
    expect(eintrag(coachVorschlaege(), "pull").tage).toBe(3);
  });

  it("Ergebnis hängt nicht von der Uhrzeit innerhalb des Tages ab", () => {
    for (const d of ["2026-10-02", "2026-10-03", "2026-10-16", "2026-10-17"]) training(d, "Australian Rows");
    const tage = [
      [0, 0],
      [0, 15],
      [12, 0],
      [23, 59],
    ].map(([h, m]) => {
      setLocalNow(2026, 10, 16, h, m);
      return eintrag(coachVorschlaege(), "pull").tage;
    });
    expect(tage).toEqual([2, 2, 2, 2]);
  });
});

describe("coachVorschlaege – explizites Datum", () => {
  it("verwendet ein explizit übergebenes Datum statt der Systemzeit", () => {
    setLocalNow(2026, 10, 16);
    for (const d of ["2026-03-01", "2026-03-05", "2026-03-10"]) training(d, "Liegestütze");
    const push = eintrag(coachVorschlaege(new Date(2026, 2, 10, 12, 0)), "push");
    expect(push.tage).toBe(3);
    expect(push.status).toBe("aufsteigen");
    // Mit der Systemzeit liegen die Einträge außerhalb des Fensters
    expect(eintrag(coachVorschlaege(), "push").tage).toBe(0);
  });

  it("verändert das übergebene Datum nicht", () => {
    const today = new Date(2026, 9, 16, 12, 0);
    const vorher = today.getTime();
    coachVorschlaege(today);
    expect(today.getTime()).toBe(vorher);
  });
});

describe("naechsteUebung", () => {
  it("liefert die Übung mit dem kleinsten höheren Level", () => {
    expect(naechsteUebung(alleUebungen(), uebung("Australian Rows"))).toEqual(uebung("Klimmzüge"));
  });

  it("überspringt Lücken im Level", () => {
    expect(naechsteUebung(alleUebungen(), uebung("Klimmzüge"))).toEqual(uebung("Muscle-up"));
  });

  it("wählt bei Gleichstand alphabetisch die erste", () => {
    expect(naechsteUebung(alleUebungen(), uebung("Liegestütze"))).toEqual(uebung("Dips"));
  });

  it("ignoriert Übungen anderer Kategorien", () => {
    // Pistol Squats (legs, 3) ist die einzige legs-Übung; höhere Level anderer Kategorien zählen nicht
    expect(naechsteUebung(alleUebungen(), uebung("Pistol Squats"))).toBeNull();
    const nurAndere: Uebung[] = [
      { id: 100, name: "Fremd", category: "push", level: 2 },
      { id: 101, name: "Ziel", category: "pull", level: 5 },
    ];
    expect(naechsteUebung(nurAndere, uebung("Australian Rows"))).toEqual(nurAndere[1]);
  });

  it("liefert null beim höchsten Level", () => {
    expect(naechsteUebung(alleUebungen(), uebung("Muscle-up"))).toBeNull();
    expect(naechsteUebung(alleUebungen(), uebung("Front Lever Tuck"))).toBeNull();
  });

  it("Übung mit gleichem Level ist kein Aufstieg", () => {
    expect(naechsteUebung(alleUebungen(), uebung("Dips"))).toBeNull();
  });

  it("liefert null bei leerer Liste", () => {
    expect(naechsteUebung([], uebung("Australian Rows"))).toBeNull();
  });

  it("verändert die übergebene Liste nicht", () => {
    const liste = alleUebungen();
    const kopie = liste.map((u) => ({ ...u }));
    naechsteUebung(liste, uebung("Australian Rows"));
    expect(liste).toEqual(kopie);
  });
});
