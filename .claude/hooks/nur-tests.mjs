// PreToolUse-Hook nur für den test-writer: Er darf ausschließlich Testdateien schreiben.
const input = JSON.parse(await new Response(process.stdin).text());
const datei = (input.tool_input?.file_path ?? "").replaceAll("\\", "/");

if (!/\.test\.ts$/.test(datei)) {
  console.error(`Blockiert: Der test-writer darf nur *.test.ts-Dateien ändern, nicht ${datei}. Melde den Fehler stattdessen.`);
  process.exit(2);
}
