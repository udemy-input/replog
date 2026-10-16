// Tests für die Frontend-Hilfsfunktionen (src/helfer.ts)
import { describe, expect, it } from "vitest";
import { escapeHtml, fehlerAusAntwort } from "./helfer";

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
