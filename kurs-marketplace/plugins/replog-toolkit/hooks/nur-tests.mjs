// PreToolUse-Hook für den test-writer: Er darf ausschließlich Testdateien schreiben.
// Plugin-Subagents dürfen keine eigenen Hooks im Frontmatter haben, deshalb läuft dieser Hook global
// und greift nur, wenn der Aufruf vom test-writer kommt (im Plugin heißt er „replog-toolkit:test-writer“).
const input = JSON.parse(await new Response(process.stdin).text());
if (!/(^|:)test-writer$/.test(input.agent_type ?? "")) process.exit(0);

const datei = (input.tool_input?.file_path ?? "").replaceAll("\\", "/");

if (!/\.test\.ts$/.test(datei)) {
  console.error(`Blockiert: Der test-writer darf nur *.test.ts-Dateien ändern, nicht ${datei}. Melde den Fehler stattdessen.`);
  process.exit(2);
}
