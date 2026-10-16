// Tests für den RepLog-MCP-Server: Datenbank-Abfragen und Start über stdio
import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { trainingsImZeitraum, uebungen } from "./abfragen";

let dir: string;
let dbFile: string;
let db: DatabaseSync;

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "replog-mcp-"));
  dbFile = join(dir, "test.db");
  // Schema und Startübungen kommen aus server/db.ts, damit der Test synchron zur App bleibt
  vi.stubEnv("DB_FILE", dbFile);
  ({ db } = await import("../server/db"));
  vi.unstubAllEnvs();

  const add = db.prepare("INSERT INTO workouts (date, minutes, notes) VALUES (?, ?, ?)");
  add.run("2026-09-30", 20, "vor dem Zeitraum");
  add.run("2026-10-01", 45, "Zug");
  add.run("2026-10-15", 30, null);
  add.run("2026-10-31", 60, "Push");
  add.run("2026-11-01", 25, "nach dem Zeitraum");
});

afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("trainingsImZeitraum", () => {
  it("liefert Trainings inklusive Grenztagen und summiert die Minuten", () => {
    const ergebnis = trainingsImZeitraum(db, "2026-10-01", "2026-10-31");
    expect(ergebnis.trainings.map((t) => t.date)).toEqual(["2026-10-01", "2026-10-15", "2026-10-31"]);
    expect(ergebnis.summeMinuten).toBe(135);
  });

  it("liefert eine leere Liste und 0 Minuten für einen Zeitraum ohne Trainings", () => {
    expect(trainingsImZeitraum(db, "2025-01-01", "2025-01-31")).toEqual({
      von: "2025-01-01",
      bis: "2025-01-31",
      trainings: [],
      summeMinuten: 0,
    });
  });

  it("lehnt ungültige Daten und vertauschte Grenzen ab", () => {
    expect(() => trainingsImZeitraum(db, "1.10.2026", "2026-10-31")).toThrow("YYYY-MM-DD");
    expect(() => trainingsImZeitraum(db, "2026-10-31", "2026-10-01")).toThrow("nicht nach");
  });
});

describe("uebungen", () => {
  it("liefert alle Übungen mit Kategorie und Level, sortiert nach Level", () => {
    const alle = uebungen(db);
    expect(alle.length).toBeGreaterThanOrEqual(10);
    expect(alle).toContainEqual(expect.objectContaining({ name: "Muscle-up", category: "pull", level: 4 }));
    const level = alle.map((u) => u.level);
    expect(level).toEqual([...level].sort((a, b) => a - b));
  });

  it("filtert nach Kategorie", () => {
    const pull = uebungen(db, "pull");
    expect(pull.map((u) => u.name)).toEqual(["Australian Rows", "Klimmzüge", "Muscle-up"]);
  });

  it("liefert eine leere Liste für eine unbekannte Kategorie", () => {
    expect(uebungen(db, "gibtsnicht")).toEqual([]);
  });
});

describe("MCP-Server", () => {
  it("startet über stdio, listet seine Tools und beantwortet einen Aufruf", async () => {
    const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [tsxCli, join(import.meta.dirname, "replog-mcp.ts")],
      env: { ...process.env, DB_FILE: dbFile } as Record<string, string>,
      stderr: "ignore",
    });
    const client = new Client({ name: "replog-test", version: "0.0.0" });
    await client.connect(transport);
    try {
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name).sort()).toEqual(["trainings_zeitraum", "uebungen"]);

      const ergebnis = await client.callTool({
        name: "trainings_zeitraum",
        arguments: { von: "2026-10-01", bis: "2026-10-31" },
      });
      const [inhalt] = ergebnis.content as { type: string; text: string }[];
      expect(JSON.parse(inhalt.text).summeMinuten).toBe(135);
    } finally {
      await client.close();
    }
  }, 20_000);
});
