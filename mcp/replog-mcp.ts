// RepLog-MCP-Server: stellt Trainingsdaten über stdio bereit (nur lesend)
// Wichtig: stdout gehört dem MCP-Protokoll – Meldungen nur über console.error ausgeben.
import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { trainingsImZeitraum, uebungen } from "./abfragen";

const DB_FILE = process.env.DB_FILE ?? "replog.db";

if (!existsSync(DB_FILE)) {
  console.error(`RepLog-Datenbank nicht gefunden: ${DB_FILE} – erst die App starten (npm run dev)`);
  process.exit(1);
}

// readOnly: Der MCP-Server darf die Daten der App niemals verändern
const db = new DatabaseSync(DB_FILE, { readOnly: true });

const server = new McpServer({ name: "replog", version: "0.1.0" });

const isoDatum = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD");

/** Ergebnis als JSON-Text verpacken; Fehler werden dem Modell als Tool-Fehler gemeldet */
function antwort(erzeuge: () => unknown) {
  try {
    return { content: [{ type: "text" as const, text: JSON.stringify(erzeuge(), null, 2) }] };
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `Fehler: ${text}` }], isError: true };
  }
}

server.registerTool(
  "trainings_zeitraum",
  {
    title: "Trainings im Zeitraum",
    description:
      "Liefert alle in RepLog erfassten Trainingseinheiten zwischen zwei Daten (beide inklusive) " +
      "mit Datum, Dauer in Minuten und Notizen, dazu die Summe der Trainingsminuten im Zeitraum. " +
      "Geeignet für Fragen wie „Wie viel habe ich im Oktober trainiert?“ oder „Wann war mein letztes Training?“.",
    inputSchema: {
      von: isoDatum.describe("Erster Tag des Zeitraums als ISO-Datum, z. B. 2026-10-01"),
      bis: isoDatum.describe("Letzter Tag des Zeitraums als ISO-Datum (inklusive), z. B. 2026-10-31"),
    },
    annotations: { readOnlyHint: true },
  },
  ({ von, bis }) => antwort(() => trainingsImZeitraum(db, von, bis)),
);

server.registerTool(
  "uebungen",
  {
    title: "Übungen",
    description:
      "Liefert die Calisthenics-Übungen aus RepLog mit Name, Kategorie und Schwierigkeitslevel " +
      "(1 = Einsteiger, höher = schwerer), sortiert nach Level. " +
      "Optional nach Kategorie filtern: pull, push, legs, core oder skill.",
    inputSchema: {
      kategorie: z
        .string()
        .optional()
        .describe("Nur Übungen dieser Kategorie liefern, z. B. „pull“. Weglassen für alle Übungen."),
    },
    annotations: { readOnlyHint: true },
  },
  ({ kategorie }) => antwort(() => uebungen(db, kategorie)),
);

await server.connect(new StdioServerTransport());
console.error(`RepLog-MCP-Server läuft (Datenbank: ${DB_FILE})`);
