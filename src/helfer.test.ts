// Tests für die Frontend-Hilfsfunktionen (src/helfer.ts)
import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  fehlerAusAntwort,
  formatiereSaetze,
  kategorieName,
  MAX_SAETZE_PRO_ZEILE,
  saetzeAusZeilen,
  type SatzZeile,
} from "./helfer";

/** Baut eine Formularzeile mit Standardwerten */
function zeile(teil: Partial<SatzZeile> = {}): SatzZeile {
  return { exerciseId: "1", anzahl: "3", wert: "8", einheit: "reps", ...teil };
}

describe("escapeHtml", () => {
  it("maskiert HTML-Tags, damit sie nicht ausgeführt werden", () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
  });

  it("maskiert & zuerst, ohne bereits erzeugte Entities doppelt zu maskieren", () => {
    expect(escapeHtml("a & <b>")).toBe("a &amp; &lt;b&gt;");
  });

  it("maskiert einfache Anführungszeichen", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("lässt normalen Text unverändert und wandelt Zahlen in Text um", () => {
    expect(escapeHtml("Klimmzüge · 3x8")).toBe("Klimmzüge · 3x8");
    expect(escapeHtml(45)).toBe("45");
  });
});

describe("fehlerAusAntwort", () => {
  it("liefert null bei erfolgreicher Antwort", async () => {
    expect(await fehlerAusAntwort(new Response(JSON.stringify({ id: 1 }), { status: 201 }))).toBeNull();
  });

  it("übernimmt die Fehlermeldung des Servers", async () => {
    const res = new Response(JSON.stringify({ error: "date und minutes sind Pflicht" }), { status: 400 });
    expect(await fehlerAusAntwort(res)).toBe("Speichern fehlgeschlagen (400): date und minutes sind Pflicht");
  });

  it("liefert eine allgemeine Meldung, wenn die Antwort kein JSON ist", async () => {
    const res = new Response("Internal Server Error", { status: 500 });
    expect(await fehlerAusAntwort(res)).toBe("Speichern fehlgeschlagen (500).");
  });
});

describe("saetzeAusZeilen", () => {
  it("liefert bei leerer Liste keine Sätze", () => {
    expect(saetzeAusZeilen([])).toEqual({ sets: [] });
  });

  it("erzeugt pro Zeile `anzahl` gleiche Sätze mit Wiederholungen", () => {
    expect(saetzeAusZeilen([zeile()])).toEqual({
      sets: [
        { exerciseId: 1, reps: 8 },
        { exerciseId: 1, reps: 8 },
        { exerciseId: 1, reps: 8 },
      ],
    });
  });

  it("erzeugt Sätze mit Sekunden ohne reps-Feld", () => {
    const r = saetzeAusZeilen([zeile({ exerciseId: "2", anzahl: "2", wert: "20", einheit: "seconds" })]);
    expect(r).toEqual({
      sets: [
        { exerciseId: 2, seconds: 20 },
        { exerciseId: 2, seconds: 20 },
      ],
    });
    if ("sets" in r) expect(r.sets[0]).not.toHaveProperty("reps");
  });

  it("hängt mehrere Zeilen in Reihenfolge aneinander", () => {
    expect(
      saetzeAusZeilen([
        zeile({ anzahl: "1", wert: "8" }),
        zeile({ exerciseId: "2", anzahl: "1", wert: "30", einheit: "seconds" }),
        zeile({ anzahl: "1", wert: "6" }),
      ]),
    ).toEqual({
      sets: [
        { exerciseId: 1, reps: 8 },
        { exerciseId: 2, seconds: 30 },
        { exerciseId: 1, reps: 6 },
      ],
    });
  });

  it("liefert unabhängige Satz-Objekte (keine gemeinsame Referenz)", () => {
    const r = saetzeAusZeilen([zeile({ anzahl: "2" })]);
    if (!("sets" in r)) throw new Error("Sätze erwartet");
    expect(r.sets[0]).not.toBe(r.sets[1]);
  });

  it("toleriert Leerzeichen um Zahlen", () => {
    expect(saetzeAusZeilen([zeile({ exerciseId: " 1 ", anzahl: " 2 ", wert: " 8 " })])).toEqual({
      sets: [
        { exerciseId: 1, reps: 8 },
        { exerciseId: 1, reps: 8 },
      ],
    });
  });

  it(`akzeptiert genau ${MAX_SAETZE_PRO_ZEILE} Sätze pro Zeile`, () => {
    const r = saetzeAusZeilen([zeile({ anzahl: String(MAX_SAETZE_PRO_ZEILE) })]);
    expect("sets" in r && r.sets.length).toBe(MAX_SAETZE_PRO_ZEILE);
  });

  it.each(["", "  ", "abc", "1.5"])("meldet Übung %j als nicht ausgewählt", (exerciseId) => {
    expect(saetzeAusZeilen([zeile({ exerciseId })])).toEqual({
      fehler: "Übung 1: Bitte eine Übung auswählen.",
    });
  });

  it.each(["", "0", "-1", "1,5", "2.5", "21", "abc"])("lehnt anzahl=%j ab", (anzahl) => {
    expect(saetzeAusZeilen([zeile({ anzahl })])).toEqual({
      fehler: `Übung 1: Anzahl der Sätze muss zwischen 1 und ${MAX_SAETZE_PRO_ZEILE} liegen.`,
    });
  });

  it.each(["", " ", "0", "-3", "8,5", "8.5", "acht"])("lehnt Wiederholungen %j ab", (wert) => {
    expect(saetzeAusZeilen([zeile({ wert })])).toEqual({
      fehler: "Übung 1: Wiederholungen müssen eine ganze Zahl ab 1 sein.",
    });
  });

  it.each(["", "0", "-5", "20,5"])("lehnt Sekunden %j ab", (wert) => {
    expect(saetzeAusZeilen([zeile({ wert, einheit: "seconds" })])).toEqual({
      fehler: "Übung 1: Sekunden müssen eine ganze Zahl ab 1 sein.",
    });
  });

  it("nennt die Nummer der fehlerhaften Zeile", () => {
    expect(saetzeAusZeilen([zeile(), zeile(), zeile({ wert: "0" })])).toEqual({
      fehler: "Übung 3: Wiederholungen müssen eine ganze Zahl ab 1 sein.",
    });
  });
});

describe("formatiereSaetze", () => {
  const satz = (name: string, reps: number | null, seconds: number | null = null) => ({
    name,
    reps,
    seconds,
  });

  it("liefert für eine leere Liste einen leeren Text", () => {
    expect(formatiereSaetze([])).toBe("");
  });

  it("fasst gleiche Wiederholungen zusammen", () => {
    expect(formatiereSaetze([satz("Klimmzüge", 8), satz("Klimmzüge", 8), satz("Klimmzüge", 8)])).toBe(
      "Klimmzüge 3×8",
    );
  });

  it("verbindet verschiedene Werte einer Übung mit +", () => {
    expect(formatiereSaetze([satz("Klimmzüge", 8), satz("Klimmzüge", 8), satz("Klimmzüge", 6)])).toBe(
      "Klimmzüge 2×8 + 1×6",
    );
  });

  it("hängt bei Sekunden ein „s“ an", () => {
    expect(formatiereSaetze([satz("L-Sit", null, 20), satz("L-Sit", null, 20)])).toBe("L-Sit 2×20 s");
  });

  it("unterscheidet gleiche Zahl als Wiederholungen und Sekunden", () => {
    expect(formatiereSaetze([satz("L-Sit", 20), satz("L-Sit", null, 20)])).toBe("L-Sit 1×20 + 1×20 s");
  });

  it("trennt mehrere Übungen mit Komma in Reihenfolge des ersten Auftretens", () => {
    expect(
      formatiereSaetze([
        satz("Klimmzüge", 8),
        satz("L-Sit", null, 20),
        satz("Klimmzüge", 8),
        satz("Dips", 10),
        satz("L-Sit", null, 20),
      ]),
    ).toBe("Klimmzüge 2×8, L-Sit 2×20 s, Dips 1×10");
  });
});

describe("kategorieName", () => {
  it.each([
    ["pull", "Zug"],
    ["push", "Druck"],
    ["legs", "Beine"],
    ["core", "Rumpf"],
    ["skill", "Skill"],
  ])("übersetzt %s zu %s", (category, name) => {
    expect(kategorieName(category)).toBe(name);
  });

  it.each(["cardio", "", "Pull"])("lässt unbekannte Kategorie %j unverändert", (category) => {
    expect(kategorieName(category)).toBe(category);
  });
});
