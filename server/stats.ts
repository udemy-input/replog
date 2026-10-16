// Statistik: Auswertungen über die gespeicherten Workouts
import { db } from "./db";

// Lokales Kalenderdatum als ISO-String YYYY-MM-DD (nicht UTC wie toISOString)
export function localIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Summe der Minuten der letzten 7 Kalendertage: heute und die 6 Tage davor.
// Einträge in der Zukunft zählen nicht. Die Uhrzeit von `today` spielt keine Rolle.
export function weeklyMinutes(today = new Date()) {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
  const row = db
    .prepare("SELECT COALESCE(SUM(minutes), 0) AS sum FROM workouts WHERE date BETWEEN ? AND ?")
    .get(localIsoDate(from), localIsoDate(today)) as { sum: number };
  return row.sum;
}
