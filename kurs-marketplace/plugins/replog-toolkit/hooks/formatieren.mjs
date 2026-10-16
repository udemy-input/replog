// PostToolUse-Hook: formatiert jede Datei, die Claude schreibt oder bearbeitet, mit Prettier.
import { execFileSync } from "node:child_process";

const input = JSON.parse(await new Response(process.stdin).text());
const datei = input.tool_input?.file_path ?? "";

if (/\.(ts|css|html|json|md)$/.test(datei) && !datei.includes("node_modules")) {
  try {
    execFileSync("npx", ["prettier", "--write", "--log-level", "warn", datei], { stdio: "inherit", shell: true });
  } catch {
    // Formatierungsfehler sollen Claude nicht blockieren
  }
}
