import {
  escapeHtml,
  fehlerAusAntwort,
  formatiereSaetze,
  kategorieName,
  saetzeAusZeilen,
  type SatzZeile,
} from "./helfer";

type Exercise = { id: number; name: string; category: string; level: number };
type WorkoutSatz = { exerciseId: number; name: string; reps: number | null; seconds: number | null };
type Workout = { id: number; date: string; minutes: number; notes: string | null; sets: WorkoutSatz[] };
type CoachEintrag = {
  category: string;
  status: "einstieg" | "dranbleiben" | "aufsteigen" | "maximum";
  tage: number;
  zielTage: number;
  aktuell: Exercise | null;
  vorschlag: Exercise;
};

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

/** Lädt JSON von der API; wirft bei Fehlerstatus, damit kaputte Antworten nicht gerendert werden */
async function holeJson<T>(pfad: string): Promise<T> {
  const res = await fetch(pfad);
  if (!res.ok) throw new Error(`${pfad} antwortete mit ${res.status}`);
  return (await res.json()) as T;
}

let uebungen: Exercise[] = [];

const uebungText = (e: Exercise) => `${escapeHtml(e.name)} <small>Level ${escapeHtml(e.level)}</small>`;

function coachZeile(c: CoachEintrag) {
  const kategorie = `<b>${escapeHtml(kategorieName(c.category))}</b> · `;
  if (c.status === "einstieg" || !c.aktuell)
    return `<li>${kategorie}Einstieg mit ${uebungText(c.vorschlag)}</li>`;
  const aktuell = uebungText(c.aktuell);
  if (c.status === "dranbleiben") {
    return `<li>${kategorie}${aktuell} – ${escapeHtml(c.tage)} von ${escapeHtml(c.zielTage)} Tagen, dranbleiben</li>`;
  }
  if (c.status === "maximum")
    return `<li class="maximum">${kategorie}${aktuell} – höchstes Level erreicht</li>`;
  return `<li class="aufsteigen">${kategorie}${aktuell} – ${escapeHtml(c.tage)} Tage → Nächste Übung: ${uebungText(c.vorschlag)}</li>`;
}

// Coach getrennt laden: ein Fehler dort soll den Rest der Seite nicht leer lassen
async function ladeCoach() {
  try {
    const coach = await holeJson<CoachEintrag[]>("/api/coach");
    // Alle Werte aus der Datenbank maskieren, bevor sie per innerHTML eingesetzt werden
    $("#coach").innerHTML = coach.map(coachZeile).join("");
  } catch {
    $("#coach").innerHTML = `<li class="error">Coach konnte nicht geladen werden.</li>`;
  }
}

async function load() {
  ladeCoach();
  const [exercises, workouts, stats] = await Promise.all([
    holeJson<Exercise[]>("/api/exercises"),
    holeJson<Workout[]>("/api/workouts"),
    holeJson<{ weeklyMinutes: number }>("/api/stats"),
  ]);
  uebungen = exercises;
  // Übungszeilen erst erlauben, wenn es Übungen zur Auswahl gibt
  $<HTMLButtonElement>("#satz-hinzufuegen").disabled = !exercises.length;

  $("#weekly").textContent = String(stats.weeklyMinutes);
  // Alle Werte aus der Datenbank maskieren, bevor sie per innerHTML eingesetzt werden
  $("#workouts").innerHTML = workouts
    .map(
      (w) =>
        `<li><b>${escapeHtml(w.date)}</b> · ${escapeHtml(w.minutes)} min${w.notes ? ` · ${escapeHtml(w.notes)}` : ""}` +
        `${w.sets.length ? `<br><small>${escapeHtml(formatiereSaetze(w.sets))}</small>` : ""}</li>`,
    )
    .join("");
  $("#exercises").innerHTML = exercises
    .map(
      (e) =>
        `<li>${escapeHtml(e.name)} <small>${escapeHtml(e.category)} · Level ${escapeHtml(e.level)}</small></li>`,
    )
    .join("");
}

/** Optionen für die Übungsauswahl, nach Kategorie gruppiert */
function uebungsOptionen() {
  const kategorien = [...new Set(uebungen.map((e) => e.category))];
  return kategorien
    .map(
      (k) =>
        `<optgroup label="${escapeHtml(kategorieName(k))}">` +
        uebungen
          .filter((e) => e.category === k)
          .map(
            (e) =>
              `<option value="${escapeHtml(e.id)}">${escapeHtml(e.name)} (Level ${escapeHtml(e.level)})</option>`,
          )
          .join("") +
        "</optgroup>",
    )
    .join("");
}

// Felder der Satzzeilen haben bewusst kein name-Attribut, damit sie nicht in FormData landen
function satzZeileHinzufuegen() {
  const zeile = document.createElement("div");
  zeile.className = "satz";
  zeile.innerHTML = `
    <select class="satz-uebung" aria-label="Übung">${uebungsOptionen()}</select>
    <input class="satz-anzahl" type="number" min="1" value="1" aria-label="Anzahl Sätze" />
    <span>×</span>
    <input class="satz-wert" type="number" min="1" placeholder="Wert" aria-label="Wiederholungen oder Sekunden" />
    <select class="satz-einheit" aria-label="Einheit">
      <option value="reps">Wdh.</option>
      <option value="seconds">Sek.</option>
    </select>
    <button type="button" class="satz-entfernen nebenbutton" aria-label="Übung entfernen">✕</button>`;
  zeile.querySelector(".satz-entfernen")!.addEventListener("click", () => zeile.remove());
  $("#saetze").append(zeile);
}

function satzZeilenLesen(): SatzZeile[] {
  return [...document.querySelectorAll<HTMLElement>("#saetze .satz")].map((z) => ({
    exerciseId: z.querySelector<HTMLSelectElement>(".satz-uebung")!.value,
    anzahl: z.querySelector<HTMLInputElement>(".satz-anzahl")!.value,
    wert: z.querySelector<HTMLInputElement>(".satz-wert")!.value,
    einheit: z.querySelector<HTMLSelectElement>(".satz-einheit")!.value as SatzZeile["einheit"],
  }));
}

function zeigeFehler(meldung: string | null) {
  const el = $("#form-error");
  el.textContent = meldung ?? "";
  el.hidden = !meldung;
}

$("#satz-hinzufuegen").addEventListener("click", satzZeileHinzufuegen);

$<HTMLFormElement>("#workout-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const data = Object.fromEntries(new FormData(form));
  const saetze = saetzeAusZeilen(satzZeilenLesen());
  if ("fehler" in saetze) {
    zeigeFehler(saetze.fehler);
    return;
  }
  let fehler: string | null;
  try {
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, minutes: Number(data.minutes), sets: saetze.sets }),
    });
    fehler = await fehlerAusAntwort(res);
  } catch {
    fehler = "Speichern fehlgeschlagen: Server nicht erreichbar.";
  }
  zeigeFehler(fehler);
  // Eingaben nur bei Erfolg leeren, damit nichts verloren geht
  if (fehler) return;
  form.reset();
  $("#saetze").replaceChildren();
  load();
});

load();
