// Wochenbericht ohne Chat: ruft Claude Code headless auf und bekommt garantiert strukturiertes JSON zurück.
// Start: npm run bericht
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const schema = {
  type: "object",
  properties: {
    minuten_gesamt: { type: "integer" },
    trainingstage: { type: "integer" },
    laengste_einheit: { type: "string" },
    empfehlung: { type: "string" },
  },
  required: ["minuten_gesamt", "trainingstage", "laengste_einheit", "empfehlung"],
};

const ausgabe = execFileSync(
  "claude",
  [
    "-p", "Erstelle einen Wochenbericht meines Trainings der letzten 7 Tage aus RepLog.",
    "--allowedTools", "mcp__replog",
    "--output-format", "json",
    "--json-schema", JSON.stringify(schema),
  ],
  { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);

const antwort = JSON.parse(ausgabe);
const bericht = antwort.structured_output;
writeFileSync("wochenbericht.json", JSON.stringify(bericht, null, 2));
console.log(`${bericht.minuten_gesamt} Minuten an ${bericht.trainingstage} Tagen – Bericht in wochenbericht.json`);
console.log(`Geschätzte Kosten dieses Laufs: ${antwort.total_cost_usd?.toFixed(2)} USD`);
