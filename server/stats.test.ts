// Tests für die Wochenstatistik (server/stats.ts)
//
// Erwartete Spezifikation (aus Funktionsname/Projektregeln abgeleitet):
// weeklyMinutes summiert die Minuten aller Workouts der letzten 7 Kalendertage
// nach LOKALEM Datum, d. h. heute und die 6 Tage davor (heute-6 … heute).
// heute-7 und älter zählt nicht, Einträge in der Zukunft zählen nicht.
// Das Ergebnis darf nicht von der Uhrzeit innerhalb des Tages abhängen.
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
    CREATE TABLE workouts (
      id INTEGER PRIMARY KEY,
      date TEXT NOT NULL,
      minutes INTEGER NOT NULL,
      notes TEXT
    );
  `);
  return { db };
});

import { db } from "./db";
import { weeklyMinutes } from "./stats";

function addWorkout(date: string, minutes: number) {
  db.prepare("INSERT INTO workouts (date, minutes) VALUES (?, ?)").run(date, minutes);
}

/** Lokale Uhrzeit setzen (Monat 1-basiert) */
function setLocalNow(y: number, m: number, d: number, h = 12, min = 0) {
  vi.setSystemTime(new Date(y, m - 1, d, h, min));
}

beforeEach(() => {
  db.exec("DELETE FROM workouts");
  process.env.TZ = "Europe/Berlin";
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  process.env.TZ = "Europe/Berlin";
});

// Ursprüngliche Zeitzone nach allen Tests wiederherstellen
afterAll(() => {
  if (originalTZ === undefined) delete process.env.TZ;
  else process.env.TZ = originalTZ;
});

describe("weeklyMinutes – Normalfälle", () => {
  it("liefert 0 bei leerer Datenbank", () => {
    setLocalNow(2026, 10, 16);
    expect(weeklyMinutes()).toBe(0);
  });

  it("summiert die Minuten mehrerer Workouts innerhalb der Woche", () => {
    setLocalNow(2026, 10, 16);
    addWorkout("2026-10-16", 30);
    addWorkout("2026-10-14", 45);
    addWorkout("2026-10-12", 20);
    expect(weeklyMinutes()).toBe(95);
  });

  it("zählt mehrere Workouts am selben Tag zusammen", () => {
    setLocalNow(2026, 10, 16);
    addWorkout("2026-10-15", 10);
    addWorkout("2026-10-15", 15);
    expect(weeklyMinutes()).toBe(25);
  });

  it("ignoriert Workouts, die deutlich älter als eine Woche sind", () => {
    setLocalNow(2026, 10, 16);
    addWorkout("2026-09-01", 60);
    addWorkout("2026-10-15", 30);
    expect(weeklyMinutes()).toBe(30);
  });

  it("verwendet ein explizit übergebenes Datum statt der Systemzeit", () => {
    setLocalNow(2026, 10, 16);
    addWorkout("2026-03-10", 40);
    addWorkout("2026-10-16", 30);
    expect(weeklyMinutes(new Date(2026, 2, 10, 12, 0))).toBe(40);
  });

  it("verändert das übergebene Datum nicht", () => {
    const today = new Date(2026, 9, 16, 12, 0);
    const vorher = today.getTime();
    weeklyMinutes(today);
    expect(today.getTime()).toBe(vorher);
  });

  it("funktioniert über einen Monatswechsel hinweg", () => {
    setLocalNow(2026, 11, 2);
    addWorkout("2026-10-29", 25);
    addWorkout("2026-11-01", 35);
    expect(weeklyMinutes()).toBe(60);
  });
});

describe("weeklyMinutes – Grenzen des 7-Tage-Fensters", () => {
  it("zählt einen Eintrag von heute", () => {
    setLocalNow(2026, 10, 16);
    addWorkout("2026-10-16", 30);
    expect(weeklyMinutes()).toBe(30);
  });

  it("zählt einen Eintrag von vor 6 Tagen (letzter Tag im Fenster)", () => {
    setLocalNow(2026, 10, 16);
    addWorkout("2026-10-10", 30);
    expect(weeklyMinutes()).toBe(30);
  });

  it("schließt einen Eintrag von vor 7 Tagen aus (mittags)", () => {
    setLocalNow(2026, 10, 16, 12, 0);
    addWorkout("2026-10-09", 30);
    expect(weeklyMinutes()).toBe(0);
  });

  it("schließt einen Eintrag von vor 7 Tagen auch kurz nach Mitternacht aus", () => {
    setLocalNow(2026, 10, 16, 0, 15);
    addWorkout("2026-10-09", 30);
    expect(weeklyMinutes()).toBe(0);
  });

  it("schließt einen Eintrag von vor 8 Tagen aus", () => {
    setLocalNow(2026, 10, 16);
    addWorkout("2026-10-08", 30);
    expect(weeklyMinutes()).toBe(0);
  });

  it("liefert unabhängig von der Uhrzeit am selben Tag dasselbe Ergebnis", () => {
    for (const d of ["2026-10-08", "2026-10-09", "2026-10-10", "2026-10-16"]) addWorkout(d, 10);
    const ergebnisse = [
      [0, 0],
      [0, 15],
      [1, 59],
      [12, 0],
      [23, 59],
    ].map(([h, m]) => {
      setLocalNow(2026, 10, 16, h, m);
      return weeklyMinutes();
    });
    expect(new Set(ergebnisse).size).toBe(1);
  });
});

describe("weeklyMinutes – Zeitzonen und Mitternacht", () => {
  it("Europe/Berlin 00:15 (UTC noch Vortag): Eintrag von heute zählt", () => {
    setLocalNow(2026, 10, 16, 0, 15);
    // Plausibilitätsprüfung: UTC ist tatsächlich noch der Vortag
    expect(new Date().toISOString().slice(0, 10)).toBe("2026-10-15");
    addWorkout("2026-10-16", 30);
    expect(weeklyMinutes()).toBe(30);
  });

  it("Europe/Berlin 00:15: Eintrag von vor 6 Tagen zählt", () => {
    setLocalNow(2026, 10, 16, 0, 15);
    addWorkout("2026-10-10", 20);
    expect(weeklyMinutes()).toBe(20);
  });

  it("Europe/Berlin Winterzeit 00:15: Eintrag von heute zählt", () => {
    setLocalNow(2026, 1, 15, 0, 15);
    addWorkout("2026-01-15", 30);
    expect(weeklyMinutes()).toBe(30);
  });

  it("über die Zeitumstellung (Ende Sommerzeit) bleibt die Fenstergrenze korrekt", () => {
    // 25.10.2026 Umstellung auf Winterzeit
    setLocalNow(2026, 10, 29, 0, 15);
    addWorkout("2026-10-23", 15); // heute-6 → zählt
    addWorkout("2026-10-22", 50); // heute-7 → zählt nicht
    expect(weeklyMinutes()).toBe(15);
  });

  it("America/New_York 23:30 (UTC schon Folgetag): Eintrag von vor 6 Tagen zählt", () => {
    process.env.TZ = "America/New_York";
    setLocalNow(2026, 10, 16, 23, 30);
    expect(new Date().toISOString().slice(0, 10)).toBe("2026-10-17");
    addWorkout("2026-10-10", 20);
    expect(weeklyMinutes()).toBe(20);
  });

  it("America/New_York 23:30: Eintrag von heute zählt", () => {
    process.env.TZ = "America/New_York";
    setLocalNow(2026, 10, 16, 23, 30);
    addWorkout("2026-10-16", 30);
    expect(weeklyMinutes()).toBe(30);
  });
});

describe("weeklyMinutes – Einträge in der Zukunft", () => {
  it("zählt einen Eintrag von morgen nicht mit", () => {
    setLocalNow(2026, 10, 16);
    addWorkout("2026-10-17", 30);
    expect(weeklyMinutes()).toBe(0);
  });

  it("zählt weit in der Zukunft liegende Einträge nicht mit", () => {
    setLocalNow(2026, 10, 16);
    addWorkout("2027-01-01", 60);
    addWorkout("2026-10-15", 20);
    expect(weeklyMinutes()).toBe(20);
  });

  it("Europe/Berlin 00:15: Eintrag von morgen zählt nicht", () => {
    setLocalNow(2026, 10, 16, 0, 15);
    addWorkout("2026-10-17", 30);
    expect(weeklyMinutes()).toBe(0);
  });
});
