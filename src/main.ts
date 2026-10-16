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
  $("#workouts").innerHTML = workouts
    .map((w) => `<li><b>${w.date}</b> · ${w.minutes} min${w.notes ? ` · ${w.notes}` : ""}</li>`)
    .join("");
  $("#exercises").innerHTML = exercises
    .map((e) => `<li>${e.name} <small>${e.category} · Level ${e.level}</small></li>`)
    .join("");
}

$<HTMLFormElement>("#workout-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const data = Object.fromEntries(new FormData(form));
  await fetch("/api/workouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, minutes: Number(data.minutes) }),
  });
  form.reset();
  load();
});

load();
