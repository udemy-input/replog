# RepLog

Calisthenics-Trainingstracker – das Kursprojekt aus **„Claude Code in der Praxis“**.

## Starten

Voraussetzung: Node.js 22.13 oder neuer.

Herunterladen per Git (oder als ZIP aus den Kursmaterialien):

```bash
git clone https://github.com/udemy-input/replog.git
cd replog
```

Dann:

```bash
npm install
npm run dev
```

Dann im Browser http://localhost:5173 öffnen.

## Kursstände

Jede Praxis-Lektion hat einen Git-Tag. Die Tags folgen der Nummerierung in den Videos: `L3.4-ende` = Stand nach Sektion 3, Lektion 3.4. (Die laufenden Nummern auf Udemy sind andere, weil dort weitere Abschnitte davor stehen.)

```bash
git tag                   # alle Stände anzeigen
git checkout L1.6-ende    # Stand nach Lektion 1.6 laden
npm install               # nach jedem Wechsel
git switch -c mein-weg    # ab hier eigene Änderungen auf eigenem Zweig
git checkout main         # zurück zum neuesten Stand
```

Eigene Änderungen vor dem Wechsel committen oder mit `git stash` beiseitelegen. Nach `git checkout <Tag>` kannst du dich umsehen; zum Weiterarbeiten legst du mit `git switch -c` einen eigenen Zweig an.

| Tag | Stand nach | Startpunkt für |
|---|---|---|
| `L0.3-start` | Einstieg, „RepLog: unser Kursprojekt“ (Startprojekt) | Sektion 1 bis Lektion 1.3 |
| `L1.3-ende` | Sektion 1, Lektion 1.3 „CLAUDE.md, aber richtig“ | Lektion 1.4 bis 1.6 |
| `L1.6-ende` | Sektion 1, Lektion 1.6 „Praxis: RepLog aufräumen“ | Sektion 2 |
| `L2.4-ende` | Sektion 2, Lektion 2.4 „Praxis: Team-taugliches Setup für RepLog“ | Lektion 3.1 bis 3.3 |
| `L3.3-ende` | Sektion 3, Lektion 3.3 „Eigene Subagents bauen“ | Lektion 3.4 |
| `L3.4-ende` | Sektion 3, Lektion 3.4 „Praxis: Test-Agent & Review-Agent“ | Lektion 3.5 |
| `L3.5-ende` | Sektion 3, Lektion 3.5 „Parallel arbeiten mit Worktrees“ | Lektion 4.1 und 4.2 |
| `L4.2-ende` | Sektion 4, Lektion 4.2 „Anatomie eines Skills“ | Lektion 4.3 |
| `L4.3-ende` | Sektion 4, Lektion 4.3 „Praxis: Der Skill im Einsatz“ | Sektion 5 |
| `L5.5-ende` | Sektion 5, Lektion 5.5 „Benachrichtigung, wenn Claude dich braucht“ | Lektion 6.1 bis 6.3 |
| `L6.3-ende` | Sektion 6, Lektion 6.3 „Praxis: Claude testet RepLog im Browser“ | Lektion 6.4 |
| `L6.4-ende` | Sektion 6, Lektion 6.4 „Eigener MCP-Server“ | Sektion 7 |
| `L7.2-ende` | Sektion 7, Lektion 7.2 „Praxis: Das RepLog-Toolkit als Plugin“ | Lektion 8.1 |
| `L8.1-ende` | Sektion 8, Lektion 8.1 „Claude ohne Chat: Headless & Automatisierung“ | Lektion 8.2 |
| `L8.2-ende` | **Sektion 8, Lektion 8.2 „Abschlussprojekt: der Progressions-Coach“ – fertiges RepLog, 232 Tests** | Praxis-Werkstatt, Grundlagen-Demos, Extras mit RepLog, Desktop-Update |

**Praxis-Werkstatt:** Sie arbeitet – ganz gleich, an welcher Stelle im Kurs du sie ansiehst – mit dem **fertigen Stand `L8.2-ende`** (232 Tests) – z. B. in „Gute Aufträge schreiben“. Nimm dafür eine Wegwerf-Kopie: `replog_Werkstatt-start.zip` aus den Kursmaterialien oder `git checkout L8.2-ende`. Die Lektion „Texte und Dokumentation schreiben lassen“ und die Extras „Projekt von null“ arbeiten mit dem Trainingsplan-Generator: https://github.com/udemy-input/trainingsplan

## Prompts aus den Videos

Alle Aufträge und Befehle aus den Lektionen, wortgleich und nach Lektion geordnet: **[PROMPTS.md](PROMPTS.md)**
