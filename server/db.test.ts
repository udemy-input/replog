// Tests für die Startdaten in server/db.ts
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "replog-db-"));
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  rmSync(dir, { recursive: true, force: true });
});

/** Lädt server/db.ts frisch mit der angegebenen Datenbankdatei */
async function ladeDb(file: string) {
  vi.stubEnv("DB_FILE", file);
  const { db } = await import("./db");
  return db;
}

function findeUebung(db: DatabaseSync, name: string) {
  return db.prepare("SELECT category, level FROM exercises WHERE name = ?").get(name);
}

describe("Startdaten", () => {
  it("legt Muscle-up in einer neuen Datenbank an", async () => {
    const db = await ladeDb(join(dir, "neu.db"));
    expect(findeUebung(db, "Muscle-up")).toEqual({ category: "pull", level: 4 });
    db.close();
  });

  it("ergänzt Muscle-up in einer bestehenden Datenbank", async () => {
    const file = join(dir, "alt.db");
    const alt = new DatabaseSync(file);
    alt.exec(`
      CREATE TABLE exercises (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        level INTEGER NOT NULL
      );
      INSERT INTO exercises (name, category, level) VALUES ('Klimmzüge', 'pull', 2);
    `);
    alt.close();

    const db = await ladeDb(file);
    expect(findeUebung(db, "Muscle-up")).toEqual({ category: "pull", level: 4 });
    // Vorhandene Übungen werden nicht doppelt angelegt
    const n = db.prepare("SELECT COUNT(*) AS n FROM exercises WHERE name = 'Klimmzüge'").get();
    expect(n).toEqual({ n: 1 });
    db.close();
  });
});
