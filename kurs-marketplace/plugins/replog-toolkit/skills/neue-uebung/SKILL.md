---
name: neue-uebung
description: Legt eine neue Calisthenics-Übung in RepLog an – Startdaten, Migration für bestehende Datenbanken und Test. Verwenden, wenn der Nutzer eine neue Übung hinzufügen möchte.
arguments: [name, kategorie, level]
allowed-tools: Bash(npx vitest *) Bash(npm run typecheck)
---

# Neue Übung anlegen

Lege die Übung **$name** an – Kategorie **$kategorie**, Level **$level**.

## Aktuelle Startdaten
!`grep -n '\["' server/db.ts`

## Schritte
1. Prüfe die Kategorie gegen [kategorien.md](kategorien.md). Ist sie unbekannt oder das Level nicht 1–5: abbrechen und nachfragen.
2. Existiert die Übung schon (auch mit anderer Schreibweise)? Dann abbrechen und Bescheid geben.
3. Trage die Übung in die Startdaten in `server/db.ts` ein, passend nach Kategorie und Level einsortiert.
4. Sorge dafür, dass die Übung auch in **bestehenden** Datenbanken ankommt, nicht nur in neuen.
5. Ergänze einen Test, der prüft, dass die Übung nach dem Start mit Kategorie und Level vorhanden ist.
6. Führe `npx vitest run` und `npm run typecheck` aus.
7. Berichte kurz: geänderte Dateien, Testergebnis.
