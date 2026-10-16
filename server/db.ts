// Datenbank: Verbindung, Schema und Startdaten
import { DatabaseSync } from "node:sqlite";

export const db = new DatabaseSync(process.env.DB_FILE ?? "replog.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    level INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    notes TEXT
  );
  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY,
    workout_id INTEGER NOT NULL REFERENCES workouts(id),
    exercise_id INTEGER NOT NULL REFERENCES exercises(id),
    reps INTEGER,
    seconds INTEGER
  );
`);

// Startdaten: INSERT OR IGNORE, damit neu ergänzte Übungen auch in bestehenden
// Datenbanken ankommen (name ist UNIQUE, vorhandene Einträge bleiben unverändert)
{
  const add = db.prepare("INSERT OR IGNORE INTO exercises (name, category, level) VALUES (?, ?, ?)");
  for (const [name, category, level] of [
    ["Klimmzüge", "pull", 2],
    ["Australian Rows", "pull", 1],
    ["Muscle-up", "pull", 4],
    ["Dips", "push", 2],
    ["Liegestütze", "push", 1],
    ["Pike Push-ups", "push", 2],
    ["Pistol Squats", "legs", 3],
    ["L-Sit", "core", 2],
    ["Handstand an der Wand", "skill", 2],
    ["Front Lever Tuck", "skill", 3],
  ] as const) add.run(name, category, level);
}
