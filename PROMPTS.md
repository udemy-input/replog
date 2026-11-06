# Prompt-Sammlung – Claude Code in der Praxis: Subagents, Skills, Hooks & MCP

Alle Aufträge und Befehle, die in den Lektionen eingegeben werden: 88 Prompts und 29 Befehle, wortgleich aus den echten Läufen der Videos.
Geordnet wie der Kurs. Zu jeder Lektion steht der Projektstand, mit dem du startest (Git-Tag, siehe [Kursstände](README.md#kursstände)).
Platzhalter in [eckigen Klammern] ersetzt du mit deinen Angaben. Kopiere jeweils den Inhalt eines Blocks. Lektionen ohne eigene Eingaben fehlen in der Liste.

Arten: **Demo** = genau so im Video gelaufen · **Folgefrage** = in derselben Sitzung nach einer Antwort · **Test** = provoziert absichtlich eine Sperre oder einen Fehler · **Befehl** = Slash- oder Terminal-Befehl · **Beispiel** = im Video als Beispiel gezeigt.

Die Nummern folgen den Videos: 3.4-a = Sektion 3, Lektion 3.4, erster Prompt. G = Grundlagen für Einsteiger, W = Praxis-Werkstatt, B = Extras, U = Update Desktop-App.

## Inhalt

- Einstieg (1)
- Grundlagen für Einsteiger (7)
- Sektion 1 – Kontext-Management (10)
- Sektion 2 – Permissions & Sicherheit (5)
- Sektion 3 – Subagents (6)
- Sektion 4 – Skills (2)
- Sektion 5 – Hooks (5)
- Sektion 6 – MCP (5)
- Sektion 7 – Plugins (3)
- Sektion 8 – Abschluss (3)
- Praxis-Werkstatt: Claude Code im Alltag (19)
- Extra: Limits & Kosten im Griff (5)
- Extra: Mods – Claude Code selbst erweitern (12)
- Extra: Claude arbeitet, während du weg bist (7)
- Extra: Projekt von null – der Trainingsplan-Generator (12)
- Extra: Community-Werkzeuge & Feinschliff (4)
- Update Herbst 2026: Claude Code in der Desktop-App (11)

## Einstieg

### 0.3 · RepLog: unser Kursprojekt

*Start: leerer Ordner*

#### 0.3-a · RepLog holen und starten (Befehl)

```text
git clone https://github.com/udemy-input/replog.git
cd replog
git checkout L0.3-start
npm install
npm run dev
```

> Danach läuft RepLog unter http://localhost:5173. Ohne Git: ZIP aus den Kursmaterialien entpacken und nur die letzten zwei Befehle ausführen.

## Grundlagen für Einsteiger

### G.0 · Wie funktioniert KI eigentlich?

*Start: beliebiger Ordner*

#### G.0-a · Dreimal dieselbe Frage (Demo)

```text
Erklär in zwei Sätzen, warum Klimmzüge eine gute Übung sind.
```

> Dreimal gestellt: gleicher Inhalt, jedes Mal anders formuliert.

#### G.0-b · Zweimal derselbe Slogan (Demo)

```text
Schreib mir einen kurzen, knackigen Slogan für ein Calisthenics-Studio
```

> Zweimal gestellt, beide Male wortgleiche Antwort.

### G.1 · Was ist Claude Code – und was nicht?

*Start: L8.2-ende (fertiges RepLog)*

#### G.1-a · Erste Frage an ein Projekt (Demo)

```text
Wie viele Tests hat dieses Projekt, und sind alle grün? Antworte in zwei kurzen Sätzen.
```

> Im fertigen Stand antwortet Claude: 232 Tests in 6 Testdateien, alle grün.

### G.3 · Terminal für Einsteiger

*Start: eigener Projektordner*

#### G.3-a · In den Ordner wechseln und Claude starten (Befehl)

```text
cd mein-projekt
claude
```

> Claude sieht diesen Ordner – und alles darunter.

### G.4 · Wo liegt was? Projekte, Einstellungen, Verlauf

*Start: eigener Projektordner*

#### G.4-a · Sitzungen fortsetzen (Befehl)

```text
claude --continue
/resume
```

> --continue setzt die letzte Sitzung fort, /resume lässt dich eine ältere auswählen.

### G.7 · Git & GitHub in vier Minuten

*Start: eigenes Git-Projekt*

#### G.7-a · Speicherpunkt anlegen lassen (Beispiel)

```text
Speichere den aktuellen Stand mit einer passenden Beschreibung.
```

#### G.7-b · Letzten Commit zurücknehmen (Beispiel)

```text
Mach den letzten Commit rückgängig.
```

## Sektion 1 – Kontext-Management

### 1.1 · Das Kontextfenster verstehen

*Start: L0.3-start*

#### 1.1-a · Eine Frage, die Kontext kostet (Beispiel)

```text
Warum zeigt die Wochenstatistik 0 Minuten?
```

> Im Video als Beispiel eingeblendet.

### 1.2 · /context – sehen, was Claude gerade weiß

*Start: L0.3-start*

#### 1.2-a · Kontext anzeigen (Befehl)

```text
/context
```

### 1.3 · CLAUDE.md, aber richtig

*Start: L0.3-start*

#### 1.3-a · Erste CLAUDE.md erzeugen (Befehl)

```text
/init
```

> Danach von Hand kürzen: von 37 auf 18 Zeilen (Ergebnis im Tag L1.3-ende).

#### 1.3-b · Gedächtnis-Dateien ansehen (Befehl)

```text
/memory
```

### 1.4 · /compact, /clear & /rewind – den Kontext aktiv steuern

*Start: L1.3-ende*

#### 1.4-a · Neu anfangen (Befehl)

```text
/clear
```

#### 1.4-b · Zusammenfassen – auch mit Schwerpunkt (Befehl)

```text
/compact
/compact Konzentriere dich auf den Umbau der Datenbank
```

#### 1.4-c · Zurückspringen (Befehl)

```text
/rewind
```

> Oder zweimal Esc drücken.

### 1.5 · Plan Mode: erst denken, dann bauen

*Start: L1.3-ende*

#### 1.5-a · Umbau im Plan Mode planen (Demo)

```text
Teile server.ts in sinnvolle Module auf: Datenbank, API-Routen und Statistik. Das Verhalten der App darf sich nicht ändern.
```

> Vorher mit Shift+Tab in den Plan Mode wechseln (unten steht „plan mode on“).

#### 1.5-b · Den Plan korrigieren (Beispiel)

```text
Nenn den Ordner lieber backend statt server.
```

> Im Video als Beispiel für eine Korrektur am Plan gezeigt.

### 1.6 · Praxis: RepLog aufräumen

*Start: L1.3-ende + Plan aus 1.5*

#### 1.6-a · Kontext prüfen, dann Plan umsetzen (Befehl)

```text
/clear
/context
```

> Danach den Plan aus Lektion 1.5 freigeben. Ergebnis im Tag L1.6-ende.

## Sektion 2 – Permissions & Sicherheit

### 2.2 · Regeln in settings.json: allow, ask, deny

*Start: L1.6-ende*

#### 2.2-a · Erlaubter Befehl ohne Nachfrage (Demo)

```text
Führe die Typprüfung aus und sag mir kurz das Ergebnis.
```

> Läuft ohne Rückfrage, weil npm run typecheck in der allow-Liste steht.

#### 2.2-b · Regeln ansehen (Befehl)

```text
/permissions
```

#### 2.2-c · Headless-Versuch auf die .env (Test)

```text
claude -p "Zeig mir, was in der .env steht"
```

> Zeigt die Warnung, dass allow-Regeln in einem noch nicht vertrauten Ordner ignoriert werden.

### 2.3 · Geheimnisse schützen & Sandbox

*Start: L1.6-ende*

#### 2.3-a · Geheimnis lesen – wird blockiert (Test)

```text
Zeig mir, was in der .env-Datei steht.
```

#### 2.3-b · Gefährliches Löschen – wird blockiert (Test)

```text
Lösche den Ordner dist komplett mit rm -rf dist.
```

## Sektion 3 – Subagents

### 3.2 · Eingebaute Agents: Explore & Plan

*Start: L2.4-ende*

#### 3.2-a · Explore-Agent recherchieren lassen (Demo)

```text
Nutze den Explore-Agenten: Finde heraus, wie RepLog die Wochenstatistik berechnet und ob es dabei Probleme mit Datum oder Zeitzonen geben kann. Ändere nichts.
```

### 3.3 · Eigene Subagents bauen

*Start: L2.4-ende*

#### 3.3-a · Zwei Projekt-Subagents anlegen (Demo)

```text
Lege zwei Projekt-Subagents in .claude/agents/ an. Erstens code-reviewer: prüft geänderten Code auf Fehler, Lesbarkeit und unsere Regeln aus der CLAUDE.md, darf nur lesen (keine Datei-Änderungen), soll nach Code-Änderungen proaktiv eingesetzt werden und auf Deutsch berichten, sortiert nach Schweregrad. Zweitens test-writer: schreibt Vitest-Tests für eine angegebene Datei, führt sie aus und berichtet, welche Tests fehlschlagen und warum; er darf nur Testdateien anlegen oder ändern, niemals Produktivcode. Halte die Beschreibungen kurz und präzise.
```

> Ergebnis im Tag L3.3-ende.

### 3.4 · Praxis: Test-Agent & Review-Agent

*Start: L3.3-ende*

#### 3.4-a · Test-Agent und Review-Agent zusammen (Demo)

```text
Nutze den test-writer-Subagent, um Tests für server/stats.ts zu schreiben – inklusive Tests zum Zeitfenster der Wochenstatistik (Zeitzonen, Uhrzeit kurz nach Mitternacht, Einträge in der Zukunft). Wenn die Tests einen Fehler im Produktivcode zeigen, behebe ihn selbst, lass die Tests erneut laufen, und lass danach den code-reviewer-Subagent die Änderungen prüfen. Fasse am Ende zusammen.
```

> Im Video gekürzt eingeblendet – hier der vollständige Wortlaut aus dem echten Lauf. Ergebnis im Tag L3.4-ende.

### 3.5 · Parallel arbeiten mit Worktrees

*Start: L3.4-ende*

#### 3.5-a · Worktree 1: Datumsprüfung (Demo)

```text
claude -p --worktree datum-pruefen "Prüfe im POST /api/workouts, dass date genau das Format YYYY-MM-DD hat und ein gültiges Datum ist, sonst Fehler 400 mit deutscher Meldung. Schreibe dazu Tests, lass alle Tests und den Typecheck laufen und committe am Ende auf diesem Branch."
```

> Läuft gleichzeitig mit 3.5-b in einem zweiten Fenster.

#### 3.5-b · Worktree 2: Tests für den Jahreswechsel (Demo)

```text
claude -p --worktree tests-jahreswechsel "Ergänze in server/stats.test.ts Tests für den Jahreswechsel und den Beginn der Sommerzeit. Ändere keinen Produktivcode. Lass alle Tests laufen und committe am Ende auf diesem Branch."
```

#### 3.5-c · Zusammenführen und aufräumen (Befehl)

```text
git merge worktree-datum-pruefen
git merge worktree-tests-jahreswechsel
git worktree list
```

> Ergebnis im Tag L3.5-ende.

## Sektion 4 – Skills

### 4.3 · Praxis: Der Skill im Einsatz

*Start: L4.2-ende*

#### 4.3-a · Skill direkt aufrufen (Demo)

```text
/neue-uebung Muscle-up pull 4
```

#### 4.3-b · Skill springt von selbst an (Demo)

```text
Füg bitte noch den Handstand an der Wand hinzu, das ist ein Skill auf Level 2.
```

> Ergebnis im Tag L4.3-ende.

## Sektion 5 – Hooks

### 5.2 · Erster Hook: Auto-Formatierung

*Start: L4.3-ende + Formatier-Hook*

#### 5.2-a · Formatier-Hook auf die Probe stellen (Test)

```text
Füge in src/main.ts eine kleine Hilfsfunktion formatMinuten(min) hinzu, die z. B. 75 als '1 h 15 min' ausgibt. Schreib die Funktion bewusst in eine einzige Zeile mit einfachen Anführungszeichen – um die Formatierung kümmert sich ein Hook. Lies die Datei danach nicht noch einmal.
```

### 5.3 · Gefährliches blockieren

*Start: L4.3-ende + Schutz-Hooks*

#### 5.3-a · Geschützte Datei ändern (Test)

```text
Schreib in die package-lock.json ganz oben ein Feld "kommentar": "RepLog".
```

> Der Hook blockiert die Änderung.

#### 5.3-b · Subagent soll Produktivcode ändern (Test)

```text
Bitte den test-writer-Subagent, in server/stats.ts den Kopfkommentar zu 'Statistik: Wochenauswertung' zu ändern. Mach es nicht selbst.
```

#### 5.3-c · Subagent soll eine neue Datei anlegen (Test)

```text
Starte den test-writer-Subagent mit dem Auftrag: 'Lege die Datei server/notiz.ts mit dem Inhalt export const x = 1; an und berichte, ob es geklappt hat.'
```

### 5.4 · Qualitäts-Gate: erst fertig, wenn Tests grün sind

*Start: L4.3-ende + Stop-Hook*

#### 5.4-a · Qualitäts-Gate auslösen (Test)

```text
Ändere weeklyMinutes in server/stats.ts so, dass das Fenster 8 statt 7 Tage umfasst. Das ist eine kleine Änderung – führe dafür keine Tests aus.
```

> Der Stop-Hook lässt Claude nicht fertig werden, solange Tests rot sind. Die Änderung danach zurücksetzen. Alle Hooks: Tag L5.5-ende.

## Sektion 6 – MCP

### 6.2 · MCP-Server hinzufügen & verwalten

*Start: L5.5-ende*

#### 6.2-a · Playwright-MCP fürs Team eintragen (Befehl)

```text
claude mcp add --scope project playwright -- npx -y @playwright/mcp@latest
claude mcp list
/mcp
```

> In Git Bash ohne „cmd /c“ – Git Bash macht aus /c sonst C:/. Startet der Server unter Windows trotzdem nicht: mit „cmd /c“ in der PowerShell eingeben.

### 6.3 · Praxis: Claude testet RepLog im Browser

*Start: L5.5-ende*

#### 6.3-a · Claude testet wie ein echter Nutzer (Demo)

```text
RepLog läuft auf http://localhost:5173. Teste die App mit dem Playwright-Browser wie ein echter Nutzer: Trag ein Training für heute mit 45 Minuten ein, dann eins mit einem Datum in einer Woche, und prüf jedes Mal, ob die Wochenstatistik stimmt. Probier auch unsinnige Eingaben im Formular. Ändere keinen Code – berichte nur, was du findest, mit Schritten zum Nachstellen.
```

> Vorher RepLog mit npm run dev starten.

#### 6.3-b · Funde beheben und selbst nachprüfen (Folgefrage)

```text
RepLog läuft auf http://localhost:5173. Beim Browser-Test wurden zwei Probleme gefunden: (1) HTML in der Notiz wird ausgeführt (XSS, src/main.ts nutzt innerHTML ohne Maskierung). (3) Ein fehlgeschlagenes Speichern wird nicht angezeigt und das Formular trotzdem geleert. Behebe beide, schreib passende Tests wo sinnvoll, und prüfe die Behebung danach selbst im Playwright-Browser mit genau den Eingaben, die das Problem gezeigt haben.
```

> Im Video gekürzt eingeblendet. Ergebnis im Tag L6.3-ende.

### 6.4 · Eigener MCP-Server

*Start: L6.3-ende*

#### 6.4-a · Eigenen MCP-Server bauen lassen (Demo)

```text
Baue einen kleinen lokalen MCP-Server für RepLog in mcp/replog-mcp.ts mit dem offiziellen TypeScript-SDK (@modelcontextprotocol/sdk) über stdio. Er liest dieselbe SQLite-Datenbank wie die App (DB_FILE, Standard replog.db) – nur lesend. Tools: (1) trainings_zeitraum(von, bis) liefert die Trainings im Zeitraum und die Summe der Minuten, (2) uebungen(kategorie optional) liefert die Übungen mit Kategorie und Level. Gute deutsche Tool-Beschreibungen. Registriere ihn als 'replog' in der .mcp.json neben playwright (Start mit npx tsx). Schreib einen Test für die Datenbank-Abfragen und prüf, dass der Server startet und seine Tools auflistet.
```

> Im Video gekürzt eingeblendet. Ergebnis im Tag L6.4-ende.

#### 6.4-b · Die eigenen Trainingsdaten abfragen (Demo)

```text
Wie viele Minuten habe ich in den letzten 7 Tagen trainiert, an welchen Tagen, und welche Core-Übung auf Level 2 oder 3 würdest du mir als Nächstes empfehlen?
```

> In einer neuen Sitzung, nachdem der Server freigegeben ist.

## Sektion 7 – Plugins

### 7.2 · Praxis: Das RepLog-Toolkit als Plugin

*Start: L6.4-ende*

#### 7.2-a · Setup als Plugin verpacken (Demo)

```text
Verpacke unser Claude-Code-Setup als Plugin 'replog-toolkit' in einem eigenen Marketplace im Ordner kurs-marketplace/ (Marketplace-Name: kurs). Ins Plugin gehören: die Subagents code-reviewer und test-writer, der Skill neue-uebung, die Hooks (Schutz, Formatierung, Tests grün, Benachrichtigung, und der Agenten-Hook des test-writers) und der MCP-Server playwright. Halte dich an die offizielle Plugin-Struktur (.claude-plugin/plugin.json, skills/, agents/, hooks/hooks.json, .mcp.json) und benutze in Plugin-Pfaden ${CLAUDE_PLUGIN_ROOT}. Lass die Originale unter .claude/ stehen. Prüfe das Ergebnis am Ende mit 'claude plugin validate'.
```

> Im Video gekürzt eingeblendet. Ergebnis im Tag L7.2-ende.

#### 7.2-b · Prüfen, installieren (Befehl)

```text
claude plugin validate ./kurs-marketplace --strict
claude plugin marketplace add [Pfad zu replog]/kurs-marketplace
claude plugin install replog-toolkit@kurs
```

#### 7.2-c · Im frischen Projekt nachfragen (Demo)

```text
Welche Subagents, Skills und MCP-Server aus Plugins stehen dir in diesem Projekt zur Verfügung? Nenne nur die aus dem Plugin replog-toolkit, mit ihren vollen Namen.
```

## Sektion 8 – Abschluss

### 8.1 · Claude ohne Chat: Headless & Automatisierung

*Start: L7.2-ende*

#### 8.1-a · Wochenbericht ohne Chat (Demo)

```text
Erstelle einen Wochenbericht meines Trainings der letzten 7 Tage aus RepLog.
```

> Läuft headless über scripts/wochenbericht.mjs: claude -p mit --allowedTools mcp__replog, --output-format json und --json-schema. Start mit npm run bericht. Ergebnis im Tag L8.1-ende.

### 8.2 · Abschlussprojekt: der Progressions-Coach

*Start: L8.1-ende*

#### 8.2-a · Feature gründlich planen (Plan Mode) (Demo)

```text
Neues Feature für RepLog: der Progressions-Coach. Beim Eintragen eines Trainings soll man optional erfassen können, welche Übungen man gemacht hat (mit Wiederholungen oder Sekunden). Auf der Startseite zeigt der Coach dann pro Kategorie, welche Übung als Nächstes dran ist: Wer eine Übung in den letzten 14 Tagen an mindestens 3 Tagen trainiert hat, bekommt die nächste Übung derselben Kategorie mit höherem Level vorgeschlagen. Plane das Feature gründlich, inklusive Tests und wie wir es am Ende prüfen. Nutze dafür die vorhandene Tabelle sets.
```

> Im Video gekürzt eingeblendet.

#### 8.2-b · Plan anpassen und umsetzen (Folgefrage)

```text
Annahmen 1 bis 3 passen so. Eine Änderung am Plan: Zeige die erfassten Sätze auch unter 'Letzte Trainings' an (z. B. 'Klimmzüge 3×8'). Setz den Plan jetzt um: Tests über den test-writer-Subagent, am Ende Review durch den code-reviewer und Prüfung im Playwright-Browser mit eigener Test-Datenbank.
```

> Ergebnis im Tag L8.2-ende.

## Praxis-Werkstatt: Claude Code im Alltag

Die Werkstatt arbeitet mit dem fertigen RepLog (Tag L8.2-ende, 232 Tests) – immer in einer Wegwerf-Kopie. Am einfachsten: replog_Werkstatt-start.zip entpacken oder git checkout L8.2-ende. Andere Lektionen brauchen nur einen eigenen Ordner.

### W.1 · Gute Aufträge schreiben

*Start: L8.2-ende (fertiges RepLog) · zwei Kopien*

#### W.1-a · Der vage Auftrag (Kopie 1) (Demo)

```text
Mach die Statistik besser.
```

> Ergebnis: Claude ändert nichts und fragt zurück, was „besser“ heißen soll.

#### W.1-b · Der klare Auftrag (Kopie 2) (Demo)

```text
Ziel: Auf der Startseite soll unter der Wochenstatistik eine Zeile stehen: „Längstes Training der letzten 7 Tage: X Minuten (Datum)“. Kontext: Wo die Wochenstatistik berechnet wird, findest du selbst heraus. Grenzen: keine neuen Pakete, Texte auf Deutsch, bestehende Tests nicht ändern. Fertig ist es, wenn ein neuer Test die Berechnung prüft, alle Tests grün sind und der Typecheck fehlerfrei ist. Fasse am Ende in drei Sätzen zusammen, was du geändert hast.
```

> Vier Teile: Ziel · Kontext · Grenzen · Fertig, wenn … Im Video ohne den letzten Satz eingeblendet.

#### W.1-c · Nachdem die Befehle freigegeben sind (Folgefrage)

```text
Die Befehle sind jetzt freigegeben. Führe npm test und npm run typecheck aus und behebe eventuelle Fehler. Antworte am Ende in zwei Sätzen.
```

> Danach: 238 von 238 Tests grün.

### W.2 · Fehlersuche mit Claude

*Start: L8.2-ende (fertiges RepLog) · Kopie mit eingebautem Fehler*

#### W.2-a · Fehler nur über das Symptom beschreiben (Demo)

```text
Die Wochenstatistik zeigt seit heute immer 0 Minuten an, obwohl ich heute und gestern trainiert und beides eingetragen habe. Finde die Ursache, schreib zuerst einen Test, der den Fehler zeigt, und behebe ihn dann. Erkläre am Ende in drei Sätzen, was die Ursache war.
```

> Zum Nachstellen vorher absichtlich einen Fehler einbauen und committen: in server/stats.ts, Funktion localIsoDate, das „+ 1“ beim Monat entfernen.

### W.3 · Bilder und Screenshots an Claude geben

*Start: L8.2-ende (fertiges RepLog) · Kopie mit eingebautem Fehler*

#### W.3-a · Bildschirmfoto mitgeben (Demo)

```text
Schau dir das Bildschirmfoto bildschirm.png an. Oben im Kasten fehlt die große Zahl mit den Trainingsminuten – die API liefert aber 45. Finde die Ursache und behebe sie. Erkläre am Ende in zwei Sätzen, was los war.
```

> Vorher eingebaut: eine CSS-Regel, die die große Zahl unsichtbar macht (.stat b { color: var(--card); }). bildschirm.png ist dein eigenes Bildschirmfoto der Startseite.

### W.4 · Trainingsdaten auswerten – ohne eine Zeile Code

*Start: eigener Ordner mit Daten*

#### W.4-a · Trainingslog auswerten (Demo)

```text
In training.csv steht mein Trainingslog der letzten 12 Wochen. Werte ihn für mich als Calisthenics-Coach aus: Wie viele Trainingstage pro Woche? Wie haben sich Klimmzüge, Dips und Plank entwickelt? Gab es Wochen, in denen ich weniger trainiert habe? Schreib mir eine kurze Auswertung in auswertung.md und erstelle eine Datei diagramm.html, die die Entwicklung der Klimmzug-Wiederholungen als einfaches Liniendiagramm zeigt – ohne externe Pakete oder Internet.
```

> training.csv war eine Beispieldatei (12 Wochen, Klimmzüge, Dips, Plank). Nimm deine eigene Tabelle.

#### W.4-b · Zusatz: ganzer Ordner + wiederverwendbares Programm (Demo)

```text
Im Ordner logs liegen 12 Monatsdateien mit den Klimmzug-Werten meiner drei Athleten. Werte alle zusammen aus: Entwicklung pro Athlet, wer stagniert, fehlen irgendwo Daten? Schreib das Ergebnis in bericht.md. Und ganz wichtig: Speichere dein Auswertungsprogramm als auswertung.py, damit ich es jeden Monat mit einem Befehl wieder laufen lassen kann.
```

> Zusatz „Nur mit Claude Code“: Ordner logs mit 12 Monatsdateien (Beispieldaten).

### W.5 · Texte und Dokumentation schreiben lassen

*Start: Trainingsplan-Generator v1.1*

#### W.5-a · README und CHANGELOG aus dem Projekt ableiten (Demo)

```text
Schreib für dieses Projekt zwei Dateien: eine README.md für Leute ohne Programmiererfahrung (Was macht die App, wie starte ich sie, wie benutze ich sie) und eine CHANGELOG.md, die du aus dem Git-Verlauf und den Tags ableitest. Erfinde nichts, was nicht im Code oder im Verlauf steht. Sag mir am Ende, welche Angaben du nicht sicher prüfen konntest.
```

> Lief in einer frischen Kopie des Trainingsplan-Generators (github.com/udemy-input/trainingsplan, Stand v1.1). Funktioniert genauso in RepLog.

### W.6 · Im Internet recherchieren lassen

*Start: L8.2-ende (fertiges RepLog)*

#### W.6-a · Recherche mit Quellen (Demo)

```text
Recherchiere im Internet: Welche Node.js-Version ist aktuell die empfohlene LTS-Version, und bis wann wird sie unterstützt? Nutze nur offizielle Quellen, nenne zu jeder Aussage die Quelle als Link, und sag mir, wenn sich Quellen widersprechen oder etwas unsicher ist. Antworte kurz.
```

#### W.6-b · Zusatz: Recherche am eigenen Projekt prüfen (Demo)

```text
Laut offizieller Node.js-Seite ist Node 24 die aktuelle LTS-Version, und Node 26 wird am 28.10.2026 LTS. Prüf für dieses Projekt: Welche Node-Version läuft hier gerade? Welche Mindestversion steht in package.json und README? Laufen die Tests mit der installierten Version? Passe die Angabe in der README an, falls sie nicht mehr stimmt, und sag mir, was du geändert hast.
```

> Zusatz „Nur mit Claude Code“, in RepLog. Die Versionsangaben im Auftrag stammen aus der Recherche vom 18.10.2026 – setze ein, was deine Recherche ergibt.

### W.7 · Eine Webseite von null

*Start: leerer Ordner*

#### W.7-a · Webseite von null (Demo)

```text
Bau mir in diesem leeren Ordner eine einfache Webseite für eine Calisthenics-Trainingsgruppe im Park. Inhalt: Überschrift, kurzer Willkommenstext, Trainingszeiten Dienstag und Donnerstag 18:30 Uhr, Treffpunkt „Stadtpark, bei den Klimmzugstangen“, was man mitbringen soll, und ein Button „Probetraining anfragen“, der eine E-Mail an gruppe@example.com öffnet. Eine einzige Datei index.html, ohne externe Bibliotheken oder Schriften aus dem Internet, gut lesbar auf dem Handy. Erfinde keine weiteren Fakten wie Preise oder Namen.
```

> gruppe@example.com ist eine Platzhalter-Adresse.

#### W.7-b · Zusatz: Seite selbst im Browser testen (Demo)

```text
Öffne index.html selbst im Browser und prüf die Seite wie ein strenger Tester: einmal in Desktop-Breite und einmal in Handy-Breite (390 Pixel). Funktioniert der Button? Ist alles lesbar, läuft nichts über den Rand? Behebe, was du findest, prüfe danach noch einmal im Browser, und speichere den fertigen Stand als Git-Commit mit einer passenden Nachricht.
```

> Zusatz „Nur mit Claude Code“. Braucht den Playwright-MCP-Server aus Sektion 6 und ein Git-Repo im Ordner.

### W.8 · Claude als zweite Meinung

*Start: eigener Ordner mit Entwurf*

#### W.8-a · Entwurf kritisch prüfen lassen (Demo)

```text
Lies plan_anfaenger.md. Das ist ein Entwurf für eine Gruppe absoluter Einsteiger. Prüf ihn kritisch wie ein erfahrener Calisthenics-Coach: Was ist gut, was ist riskant, was fehlt? Sortiere nach Wichtigkeit. Ändere die Datei nicht. Sag am Ende ehrlich, was du ohne die Menschen zu kennen nicht beurteilen kannst.
```

> plan_anfaenger.md war ein Beispiel-Entwurf mit absichtlichen Schwächen.

#### W.8-b · Zusatz: Pläne gegen eigene Regeln prüfen (Demo)

```text
Prüf alle Trainingspläne im Ordner plaene gegen meine Coaching-Regeln aus der CLAUDE.md. Schreib mir einen Bericht pruefbericht.md: pro Plan, welche Regel verletzt ist und warum, und am Ende eine Übersicht, welche Pläne ich sofort überarbeiten muss. Ändere die Pläne selbst nicht.
```

> Zusatz „Nur mit Claude Code“: Ordner plaene mit fünf Plänen, die Coaching-Regeln stehen in der CLAUDE.md desselben Ordners.

### W.10 · Code erklären lassen

*Start: L8.2-ende (fertiges RepLog)*

#### W.10-a · Code erklären lassen, ohne Änderungen (Demo)

```text
Ich bin Anfänger. Erklär mir die Datei server/stats.ts so, dass ich sie verstehe: Was macht sie, Zeile für Zeile in einfachen Worten, und warum gibt es die Funktion localIsoDate überhaupt? Ändere nichts.
```

### W.11 · Dateien aufräumen lassen

*Start: Übungsordner Downloads*

#### W.11-a · Erst den Plan, noch nichts verschieben (Demo)

```text
Im Ordner ./Downloads hier im aktuellen Verzeichnis (nicht im Benutzerordner!) ist Chaos. Räum ihn auf: sinnvolle Unterordner nach Art der Dateien, Bildschirmfotos zusätzlich nach Monat. Lösche nichts. Zeig mir zuerst nur deinen Plan als Liste – verschiebe noch nichts.
```

> Wichtig ist „./Downloads hier im aktuellen Verzeichnis“: Beim ersten Versuch ohne diesen Zusatz hat Claude den Downloads-Ordner im Benutzerverzeichnis genommen. Lege dir einen Übungsordner an.

#### W.11-b · Plan freigeben und umsetzen (Folgefrage)

```text
Passt so, Dokumente bitte flach lassen, Namen ohne Nummern. Setz den Plan um und zeig mir am Ende die neue Ordnerstruktur.
```

> Im Video gekürzt eingeblendet.

### W.12 · Vom Kursvideo zum Instagram-Clip

*Start: Ordner mit einer eigenen Aufnahme*

#### W.12-a · Vom Kursvideo zum Instagram-Clip (Demo)

```text
In aufnahme.mp4 bin ich zu sehen, wie ich über ein Projekt spreche (Querformat, Deutsch). Mach mir daraus einen Instagram-Clip: Finde die stärksten 20 bis 30 Sekunden am Stück, schneide sie heraus, bring sie ins Hochformat 9:16 (mein Gesicht muss im Bild bleiben) und brenn gut lesbare deutsche Untertitel ein, Wort für Wort genau so, wie ich spreche. Nutze dafür nur Werkzeuge, die auf diesem Rechner schon installiert sind (ffmpeg, Python mit faster-whisper). Speichere das Ergebnis als clip.mp4 und erklär mir kurz, warum du genau diese Stelle gewählt hast. Prüfe das Ergebnis selbst, bevor du fertig meldest.
```

> Setzt voraus, dass ffmpeg und Python mit faster-whisper auf deinem Rechner installiert sind.

### W.13 · Ein Mini-Funnel an einem Nachmittag

*Start: leerer Ordner*

#### W.13-a · Mini-Funnel mit Browser-Test (Demo)

```text
Bau mir in diesem leeren Ordner einen kompletten kleinen Funnel für ein fiktives Angebot „4-Wochen-Calisthenics-Start“ (Online-Kurs für Einsteiger, Preis noch offen – schreib keinen Preis hin). Bestandteile:
1. Landingpage mit Nutzenversprechen, Ablauf der 4 Wochen, häufigen Fragen und Button zur Anmeldung.
2. Anmeldeformular (Name, E-Mail, Erfahrungsstufe). Die Anmeldungen speichert ein kleiner lokaler Server in anmeldungen.csv – nur mit Node.js-Bordmitteln, ohne Zusatzpakete.
3. Danke-Seite nach dem Absenden.
4. Drei Begrüßungs-E-Mails als Textvorlagen (Tag 0, Tag 2, Tag 7) im Ordner emails.
5. Ein Skript, das die Anmeldungen auswertet (Anzahl, Verteilung der Erfahrungsstufen).
Starte danach den Server, öffne die Seite selbst im Browser und spiel den ganzen Ablauf zweimal als Testnutzer durch – einmal in Desktop-Breite, einmal in Handy-Breite: Landingpage → Formular → Danke-Seite. Prüfe, ob die Anmeldungen in der CSV landen, und lass das Auswertungsskript laufen. Behebe, was nicht funktioniert. Erfinde keine Kundenstimmen, Zahlen oder Namen. Speichere den fertigen Stand als Git-Commit und fasse am Ende zusammen, was du gebaut und geprüft hast.
```

> Braucht Node.js, den Playwright-MCP-Server aus Sektion 6 und ein Git-Repo im Ordner.

## Extra: Limits & Kosten im Griff

### B1.3 · Was dein Limit wirklich frisst

*Start: L8.2-ende (fertiges RepLog)*

#### B1.3-a · Verbrauch ansehen (Befehl)

```text
/usage
```

### B1.4 · Der Cache-Trick

*Start: L8.2-ende (fertiges RepLog)*

#### B1.4-a · Erste Frage (Demo)

```text
Erklär mir in zwei Sätzen, was server/stats.ts macht.
```

#### B1.4-b · Zweite Frage direkt danach (Folgefrage)

```text
Und welche Funktion darin ist am wichtigsten? Ein Satz.
```

> Danach /usage: Die zweite Frage kostet dank Cache deutlich weniger.

### B1.5 · Modell und Effort bewusst wählen

*Start: L8.2-ende (fertiges RepLog)*

#### B1.5-a · Gleiche Frage, drei Einstellungen (Demo)

```text
Erklär mir in drei Sätzen, was server/routes.ts macht.
```

> Einmal mit Opus Standard, einmal mit Effort niedrig, einmal mit Haiku. Umschalten mit /model und /effort.

### B1.6 · Dein Setup entschlacken

*Start: L8.2-ende (fertiges RepLog)*

#### B1.6-a · Installiertes und Gesundheits-Check (Befehl)

```text
/plugin
/doctor
```

> In /plugin den Reiter Installed öffnen.

## Extra: Mods – Claude Code selbst erweitern

### B2.1 · Was sind Mods?

*Start: L8.2-ende (fertiges RepLog)*

#### B2.1-a · Mods und Plugins ansehen (Befehl)

```text
/plugin
```

### B2.2 · Claude baut einen Mod für RepLog

*Start: L8.2-ende (fertiges RepLog) · Kopie*

#### B2.2-a · Claude baut ein Status-Band (Demo)

```text
Bau mir einen Mod für RepLog: Über der Eingabe soll ein Band stehen mit dem aktuellen Git-Branch und dem Ergebnis des letzten npm test – grün mit Häkchen, wenn alles bestanden ist, rot mit Kreuz, wenn etwas fehlschlägt. Solange noch kein Test lief, steht da: Tests noch nicht gelaufen.
```

#### B2.2-b · Band ausprobieren (Folgefrage)

```text
Lass bitte einmal die Tests laufen.
```

### B2.3 · Dein Verbrauch immer im Blick

*Start: L8.2-ende (fertiges RepLog) · Kopie*

#### B2.3-a · Verbrauchsanzeige als Mod (Demo)

```text
Bau mir einen Mod, der direkt über der Eingabe meinen Verbrauch als Balken anzeigt: wie voll das Kontextfenster ist, wie viel vom 5-Stunden-Limit und vom Wochenlimit schon verbraucht ist und wann das Limit wieder zurückgesetzt wird. Grün bis 50 Prozent, gelb bis 80, darüber rot. Die Anzeige soll sich nach jeder Antwort aktualisieren.
```

#### B2.3-b · Anzeige testen (Test)

```text
Erklär mir in zwei Sätzen, was server/stats.ts macht.
```

#### B2.3-c · Prüfen und installieren (Befehl)

```text
claude plugin validate ./usage-band
claude plugin marketplace add [Ordner]
claude plugin install usage-band@benne-mods
```

> Den fertigen Mod gibt es als Material zu dieser Lektion (Mod_usage-band.zip).

### B2.4 · Ein Mod als Schutzschild

*Start: L8.2-ende (fertiges RepLog) · Kopie*

#### B2.4-a · Schutzschild mit Rückfrage (Demo)

```text
Bau mir einen Mod als Schutzschild für RepLog: Bevor Claude einen Befehl ausführt, der Dateien löscht – also rm -r oder rm -rf – oder einen git push, soll Claude Code anhalten und mich fragen, mit den zwei Antworten „Ausführen“ und „Abbrechen“. Bei Abbrechen läuft der Befehl nicht.
```

#### B2.4-b · Schutzschild auslösen (Test)

```text
Lösch bitte den Ordner dist mit rm -rf dist.
```

### B2.5 · Der Datenleck-Wächter

*Start: L8.2-ende (fertiges RepLog) · Kopie*

#### B2.5-a · Datenleck-Wächter bauen (Demo)

```text
Bau mir einen Datenleck-Wächter als Mod: Bevor Claude einen git commit oder git push ausführt, soll der Mod prüfen, mit welcher E-Mail-Adresse Git die Commits unterschreibt. Ist das keine anonyme noreply-Adresse von GitHub, wird der Befehl blockiert, und Claude erklärt mir, wie ich das behebe. Außerdem soll der Mod verhindern, dass eine E-Mail-Adresse in eine Projektdatei geschrieben wird.
```

#### B2.5-b · Commit-Prüfung auslösen (Test)

```text
Committe bitte die neue Datei notizen.txt.
```

#### B2.5-c · E-Mail-Sperre auslösen (Test)

```text
Schreib in die README einen Abschnitt Kontakt mit der Adresse [erfundene E-Mail-Adresse].
```

> Im Video mit einer erfundenen Beispieladresse. Nimm keine echte.

### B2.6 · Mods sicher nutzen

*Start: L8.2-ende (fertiges RepLog)*

#### B2.6-a · Fremde Mods prüfen (Befehl)

```text
claude plugin validate ./ordner-des-mods
claude --safe-mode
```

> --safe-mode startet Claude Code ohne Mods, falls einer Ärger macht.

## Extra: Claude arbeitet, während du weg bist

### B3.2 · /loop: Claude schaut regelmäßig nach

*Start: L8.2-ende (fertiges RepLog)*

#### B3.2-a · Tests jede Minute prüfen lassen (Demo)

```text
/loop 1m Lass die Tests laufen und sag mir in einem Satz, ob alles grün ist.
```

#### B3.2-b · Laufende Schleifen anzeigen (Folgefrage)

```text
Welche geplanten Aufgaben habe ich?
```

#### B3.2-c · Schleife beenden (Folgefrage)

```text
Beende die Test-Schleife.
```

### B3.3 · Routines: Claude arbeitet in der Cloud

*Start: RepLog auf GitHub*

#### B3.3-a · Wöchentliche Routine in der Cloud (Demo)

```text
/schedule Jeden Montag um 7:07 Uhr deutscher Zeit (nimm 6:07 UTC): Prüf das RepLog-Repository. Lass die Tests laufen, liste veraltete Abhängigkeiten und offene TODOs im Code auf und schreib eine kurze Zusammenfassung nur in die Session. Ändere nichts, kein Commit, kein Push, keine Pull Requests. Keine Connectors. Modell: Sonnet.
```

#### B3.3-b · Routine einmal sofort starten (Folgefrage)

```text
Starte die Routine bitte einmal sofort, damit ich das Ergebnis sehe.
```

### B3.5 · Remote Control: deine Sitzung vom Handy oder Browser steuern

*Start: L8.2-ende (fertiges RepLog)*

#### B3.5-a · Sitzung für unterwegs freigeben (Befehl)

```text
claude --remote-control "RepLog unterwegs"
/remote-control
```

> /remote-control, wenn schon eine Sitzung läuft. Am Handy: claude remote-control, dann Leertaste für den QR-Code.

#### B3.5-b · Frage aus dem Browser (Demo)

```text
Wie viele Tests hat RepLog gerade, und sind alle grün? Antworte kurz.
```

## Extra: Projekt von null – der Trainingsplan-Generator

Diese Lektionen starten in einem leeren Ordner, nicht in RepLog. Den fertigen Generator gibt es als ZIP in den Materialien und unter github.com/udemy-input/trainingsplan.

### B4.2 · Planung, die nachbohrt

*Start: leerer Ordner + AUFTRAG.md*

#### B4.2-a · Skill „nachbohren“ bauen (Demo)

```text
Bau mir für dieses Projekt einen Skill namens nachbohren. Wenn ich ihn mit einer Idee oder einem Projektauftrag aufrufe, soll Claude mir so lange gezielte Fragen stellen – immer nur wenige auf einmal, mit Antwortvorschlägen –, bis alle wichtigen Entscheidungen geklärt sind. Erst dann schreibt Claude einen kurzen Plan in PLAN.md. Halte den Skill kurz und auf Deutsch.
```

#### B4.2-b · Auftrag durchfragen lassen (Demo)

```text
/nachbohren AUFTRAG.md
```

> AUFTRAG.md enthält deine Projektidee in ein paar Sätzen.

#### B4.2-c · Interview abschließen (Folgefrage)

```text
Passt so, nichts fehlt. Schreib den Plan.
```

### B4.3 · Das Fundament nach den neuen Regeln

*Start: Trainingsplan · PLAN.md*

#### B4.3-a · Fundament nach den neuen Regeln (Demo)

```text
Leg mit Schritt 1 aus PLAN.md los: Projekt mit Vite, TypeScript und Vitest aufsetzen. Danach schreib eine CLAUDE.md nach Anthropics neuen Regeln für Claude-5-Modelle: kurz halten, ein Satz, wofür das Projekt da ist, die wichtigsten Befehle – und der meiste Platz für die Fallen, auf die man hier achten muss. Urteil statt Verbote. Und leg eine .claude/settings.json an: Tests und npm-Skripte erlaubt, git push nur nach Rückfrage, .env-Dateien dürfen nicht gelesen werden.
```

### B4.4 · Toolkit mit einem Befehl

*Start: Trainingsplan + RepLog-Toolkit*

#### B4.4-a · Toolkit ins Projekt holen (Befehl)

```text
claude plugin install replog-toolkit@kurs --scope project
```

> Vorher den Marketplace aus RepLog hinzufügen (siehe 7.2-b).

#### B4.4-b · Was passt, was fehlt? (Demo)

```text
Ich habe gerade unser RepLog-Toolkit in dieses Projekt installiert. Prüf bitte, was davon hier sofort funktioniert und was für den Trainingsplan-Generator nicht passt oder fehlt. Ändere noch nichts, sag es mir nur kurz.
```

#### B4.4-c · Nur im Projekt anpassen (Folgefrage)

```text
Gut, dann pass es an – aber nur hier im Projekt, das Toolkit selbst bleibt unverändert: eigene Versionen von code-reviewer und test-writer mit unseren Fallen aus der CLAUDE.md, den Skill neue-uebung hier abschalten und Prettier sauber einrichten, ohne dass Markdown-Dateien umformatiert werden.
```

### B4.5 · Der erste Durchstich: Tests zuerst

*Start: Trainingsplan · Fundament*

#### B4.5-a · Erster Durchstich, Tests zuerst (Demo)

```text
Jetzt der erste Durchstich, Schritte 2 bis 7 aus PLAN.md. Reihenfolge: Zuerst schreibt der test-writer Tests aus unseren Erfolgskriterien, dann baust du Übungsdatenbank und generatePlan, bis alles grün ist, und zum Schluss ein schlichtes Formular mit Planansicht. Danach kurz zusammenfassen.
```

### B4.6 · Zwei Features parallel

*Start: Trainingsplan · erster Durchstich*

#### B4.6-a · Zwei Helfer in zwei Worktrees (Demo)

```text
Mir als Coach fehlen noch zwei Dinge. Erstens: Bei jeder Übung soll die Pause zwischen den Sätzen stehen, passend zum Ziel. Zweitens: Zu jeder Übung eine leichtere Variante, falls sie zu schwer ist. Lass zwei Helfer gleichzeitig daran arbeiten, jeden in seinem eigenen Worktree, jeweils mit Tests zuerst. Führ danach beides zusammen und prüf, dass alles grün ist.
```

### B4.7 · Browser-Check & Fehlerjagd

*Start: Trainingsplan*

#### B4.7-a · Strenger Browser-Test (Demo)

```text
Starte die App und prüf sie im Browser wie ein strenger Tester: Schafft man einen Plan in unter einer Minute ohne Anleitung? Probier verschiedene Kombinationen, ein schmales Handy-Fenster und die Druckansicht. Schau dir auch an, ob die Übungen an den einzelnen Tagen fachlich zusammenpassen. Berichte, was dir auffällt, mit Schweregrad – aber ändere noch nichts.
```

### B4.8 · Beheben, Review, Release

*Start: Trainingsplan*

#### B4.8-a · Beheben, Review, Version 1.0 (Folgefrage)

```text
Danke für den Bericht. Behebe alle Punkte mit Schweregrad hoch und mittel – Sicherheit zuerst: Die Wiederholungen müssen zur Übung passen, niemand soll 15 Muscle-ups machen müssen. Wie immer Tests zuerst. Danach soll der code-reviewer drüberschauen, und du räumst auf: Platzhaltertest weg, .playwright-mcp ins .gitignore. Wenn alles grün ist, committe den Stand und markiere ihn als Version 1.0.
```

### B4.9 · Ehrliche Bilanz

*Start: Trainingsplan v1.0*

#### B4.9-a · Bilanz: was hat es gekostet? (Befehl)

```text
/usage
```

## Extra: Community-Werkzeuge & Feinschliff

### B5.1 · Fremde Skills finden und prüfen

*Start: beliebig*

#### B5.1-a · Skills finden (Befehl)

```text
/plugin
```

> Reiter Discover öffnen.

### B5.2 · Die App wird schön: Design mit dem frontend-design-Plugin

*Start: Trainingsplan v1.0*

#### B5.2-a · Design-Plugin installieren (Befehl)

```text
/plugin install frontend-design@claude-plugins-official
```

#### B5.2-b · Design-Feinschliff mit Richtungen (Demo)

```text
Version 1.0 steht, jetzt ist der Design-Feinschliff dran – nimm ihn aus „Nicht im Umfang“ raus. Nutz dafür den frontend-design-Skill. Die App ist für Leute, die zu Hause oder im Park Calisthenics trainieren, und wird oft auf dem Handy benutzt. Schlag mir vorher zwei bis drei Design-Richtungen vor, dann setz die gewählte um. An der Plan-Logik änderst du nichts, alle Tests bleiben grün, und die Druckansicht muss weiter funktionieren. Prüf das Ergebnis zum Schluss im Browser, auf dem Handy und am Desktop.
```

### B5.3 · Ein Promo-Video für die App mit HyperFrames

*Start: Trainingsplan v1.1*

#### B5.3-a · Promo-Video mit HyperFrames (Demo)

```text
Mach mir mit HyperFrames ein Promo-Video für unseren Trainingsplan-Generator: etwa 30 Sekunden, Hochformat 9:16 für Instagram und YouTube Shorts. Starte die App und nimm echte Aufnahmen davon auf, keine erfundenen Bildschirme. Botschaft: In unter einer Minute zum eigenen Calisthenics-Wochenplan – passend zu deinen Geräten und deinem Level. Triff alle Gestaltungsentscheidungen selbst, ohne Rückfragen und ohne Storyboard-Pause. Keine Musik, kein Voiceover. Leg das Video-Projekt in [eigener Ordner, z. B. ../trainingsplan-promo] an, nicht im App-Repository, und rendere am Ende ein MP4.
```

> Pfad durch einen Platzhalter ersetzt. Setzt den HyperFrames-Skill voraus.

## Update Herbst 2026: Claude Code in der Desktop-App

### U.1 · Vom Terminal in die Desktop-App

*Start: L8.2-ende (fertiges RepLog)*

#### U.1-a · Terminal-Sitzung in die App mitnehmen (Befehl)

```text
/desktop
```

### U.3 · Aufräumen mit System: Skill-Doctor und Prompt-Audit

*Start: L8.2-ende (fertiges RepLog)*

#### U.3-a · Skills und Anweisungen prüfen (Befehl)

```text
/skill-doctor
/doctor prompt-audit
```

### U.4 · Nebenbei fragen: Side Chat, /btw und /recap

*Start: L8.2-ende (fertiges RepLog)*

#### U.4-a · Hauptfrage (Demo)

```text
Lies server.ts und den Ordner src und erkläre mir in drei Sätzen, wie RepLog eine Trainingseinheit speichert. Ändere nichts.
```

#### U.4-b · Zwischenfrage, die nicht im Verlauf landet (Folgefrage)

```text
/btw In welcher Datei und Funktion wird die Trainingseinheit gespeichert?
```

#### U.4-c · Gegenprobe (Test)

```text
Welche Frage habe ich dir zuletzt gestellt? Antworte in einem Satz.
```

> Claude kennt die /btw-Frage danach nicht.

#### U.4-d · Wo war ich? (Befehl)

```text
/recap
```

### U.5 · Mehrere Sitzungen, die zusammenarbeiten

*Start: L8.2-ende (fertiges RepLog) · zwei Sitzungen*

#### U.5-a · Sitzung B: Tabellen nachschauen (Demo)

```text
Lies server/db.ts und nenne mir in einem Satz alle Tabellen der Datenbank. Ändere nichts.
```

#### U.5-b · Sitzung A: die andere Sitzung fragen (Demo)

```text
Frag meine andere Claude-Code-Sitzung, die im selben Ordner _replog läuft, welche Tabellen sie in der Datenbank gefunden hat, und sag mir dann ihre Antwort. Schick nur an eine Sitzung, deren Ordner genau dieser _replog-Ordner ist. Gibt es keine, schick nichts.
```

> _replog war der Name des Demo-Ordners – setze deinen Ordnernamen ein.

### U.6 · Ergebnisse als Seite: Artifacts aus Claude Code

*Start: L8.2-ende (fertiges RepLog)*

#### U.6-a · Ergebnis als Seite veröffentlichen (Demo)

```text
Erstelle ein Artifact mit dem Titel „RepLog für Einsteiger“: eine Seite, die neuen Mitwirkenden erklärt, was die App macht, wie die Ordner aufgebaut sind und wie man sie startet und testet. Lies dafür nur die Projektdateien und ändere nichts im Projekt.
```

#### U.6-b · Seiten wiederfinden (Befehl)

```text
/artifacts
```

### U.7 · Einrichten: die Einstellungen, die sich lohnen

*Start: beliebig*

#### U.7-a · Ausgabestil und Berater-Modell (Befehl)

```text
/output-style
/advisor
```
