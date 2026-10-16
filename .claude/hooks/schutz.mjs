// PreToolUse-Hook: verhindert Änderungen an geschützten Dateien.
// Exit-Code 2 blockiert die Aktion, die Meldung auf stderr bekommt Claude als Rückmeldung.
const input = JSON.parse(await new Response(process.stdin).text());
const datei = (input.tool_input?.file_path ?? "").replaceAll("\\", "/");

const geschuetzt = [
  { muster: /(^|\/)\.env(\.|$)/, grund: "Umgebungsdateien enthalten Geheimnisse" },
  { muster: /package-lock\.json$/, grund: "wird nur von npm verwaltet" },
  { muster: /\.db$/, grund: "Datenbankdateien nie direkt bearbeiten" },
  { muster: /(^|\/)\.git\//, grund: "Git-Interna" },
];

const treffer = geschuetzt.find((g) => g.muster.test(datei));
if (treffer) {
  console.error(`Blockiert: ${datei} ist geschützt (${treffer.grund}).`);
  process.exit(2);
}
