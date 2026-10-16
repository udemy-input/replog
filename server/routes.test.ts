// Tests für die Datumsprüfung in POST /api/workouts (server/routes.ts)
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
import { handleApi, isValidIsoDate } from "./routes";

/** Schickt einen POST an /api/workouts und liefert Status und JSON-Antwort */
async function postWorkout(data: unknown) {
  const req = Readable.from([JSON.stringify(data)]) as unknown as IncomingMessage;
  req.method = "POST";
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
  await handleApi(req, res, new URL("http://localhost/api/workouts"));
  return { status, body: JSON.parse(raw) };
}

function countWorkouts() {
  return (db.prepare("SELECT COUNT(*) AS n FROM workouts").get() as { n: number }).n;
}

beforeEach(() => {
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

describe("POST /api/workouts", () => {
  it("speichert ein Workout mit gültigem Datum", async () => {
    const r = await postWorkout({ date: "2026-10-16", minutes: 30 });
    expect(r.status).toBe(201);
    expect(r.body.id).toEqual(expect.any(Number));
    expect(countWorkouts()).toBe(1);
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
});
