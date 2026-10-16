// Stop-Hook: Claude darf erst fertig sein, wenn alle Tests grün sind.
import { execSync } from "node:child_process";

const input = JSON.parse(await new Response(process.stdin).text());
// Schutz vor Endlosschleifen: Hat dieser Hook Claude gerade schon weitergeschickt, nicht erneut blockieren.
if (input.stop_hook_active) process.exit(0);

// Nur prüfen, wenn TypeScript-Dateien geändert wurden.
const geaendert = execSync("git status --porcelain", { encoding: "utf8" });
if (!/\.ts\b/.test(geaendert)) process.exit(0);

try {
  execSync("npx vitest run", { encoding: "utf8", stdio: "pipe" });
} catch (err) {
  const ausgabe = `${err.stdout ?? ""}${err.stderr ?? ""}`;
  const fehler = ausgabe.split("\n").filter((z) => /FAIL|✗|×|AssertionError|Expected|Received/.test(z)).slice(0, 15).join("\n");
  console.log(JSON.stringify({ decision: "block", reason: `Die Tests schlagen fehl. Bitte beheben, bevor du fertig bist:\n${fehler}` }));
}
