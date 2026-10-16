# RepLog

Calisthenics-Trainingstracker, Kursprojekt aus „Claude Code in der Praxis“.

## Befehle
- `npm run dev` – App auf http://localhost:5173 (Server + Vite in einem Prozess)
- `npm run typecheck` – nach jeder Änderung ausführen, muss fehlerfrei sein
- `npm test` – Vitest

## Regeln
- UI-Texte, Kommentare und Fehlermeldungen auf **Deutsch**.
- Datenbank nur über das eingebaute `node:sqlite`. **Keine nativen Pakete** wie `better-sqlite3`: Kursteilnehmer haben oft keine Build-Tools (v. a. Windows).
- Datum immer als ISO-String `YYYY-MM-DD`, Dauer immer als ganze **Minuten**.
- Frontend bleibt Vanilla TypeScript, kein Framework.
- Typen für API-Antworten gibt es doppelt (Server und `src/main.ts`) – bei Schemaänderungen beide anpassen.

## Git
- Jede Lektion hat einen Tag wie `L1.6-ende`. Tags niemals verschieben oder löschen.
