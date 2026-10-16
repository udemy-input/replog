import { escapeHtml, fehlerAusAntwort } from "./helfer";

type Exercise = { id: number; name: string; category: string; level: number };
type Workout = { id: number; date: string; minutes: number; notes: string | null };

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

async function load() {
  const [exercises, workouts, stats] = await Promise.all([
    fetch("/api/exercises").then((r) => r.json() as Promise<Exercise[]>),
    fetch("/api/workouts").then((r) => r.json() as Promise<Workout[]>),
    fetch("/api/stats").then((r) => r.json() as Promise<{ weeklyMinutes: number }>),
  ]);

  $("#weekly").textContent = String(stats.weeklyMinutes);
  // Alle Werte aus der Datenbank maskieren, bevor sie per innerHTML eingesetzt werden
  $("#workouts").innerHTML = workouts
    .map(
      (w) =>
        `<li><b>${escapeHtml(w.date)}</b> · ${escapeHtml(w.minutes)} min${w.notes ? ` · ${escapeHtml(w.notes)}` : ""}</li>`,
    )
    .join("");
  $("#exercises").innerHTML = exercises
    .map(
      (e) =>
        `<li>${escapeHtml(e.name)} <small>${escapeHtml(e.category)} · Level ${escapeHtml(e.level)}</small></li>`,
    )
    .join("");
}

function zeigeFehler(meldung: string | null) {
  const el = $("#form-error");
  el.textContent = meldung ?? "";
  el.hidden = !meldung;
}

$<HTMLFormElement>("#workout-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const data = Object.fromEntries(new FormData(form));
  let fehler: string | null;
  try {
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, minutes: Number(data.minutes) }),
    });
    fehler = await fehlerAusAntwort(res);
  } catch {
    fehler = "Speichern fehlgeschlagen: Server nicht erreichbar.";
  }
  zeigeFehler(fehler);
  // Eingaben nur bei Erfolg leeren, damit nichts verloren geht
  if (fehler) return;
  form.reset();
  load();
});

load();
