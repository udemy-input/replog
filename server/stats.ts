// Statistik: Auswertungen über die gespeicherten Workouts
import { db } from "./db";

export function weeklyMinutes(today = new Date()) {
  const from = new Date(today);
  from.setDate(from.getDate() - 7);
  const rows = db.prepare("SELECT date, minutes FROM workouts").all() as { date: string; minutes: number }[];
  let sum = 0;
  for (const r of rows) {
    if (new Date(r.date) >= from) sum += r.minutes;
  }
  return sum;
}
