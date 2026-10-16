// RepLog Server – Datenbank, API und Statistik (alles in einer Datei, wird im Kurs aufgeräumt)
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { createServer as createVite } from "vite";

const PORT = Number(process.env.PORT ?? 5173);
const db = new DatabaseSync(process.env.DB_FILE ?? "replog.db");

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

const count = db.prepare("SELECT COUNT(*) AS n FROM exercises").get() as { n: number };
if (count.n === 0) {
  const add = db.prepare("INSERT INTO exercises (name, category, level) VALUES (?, ?, ?)");
  for (const [name, category, level] of [
    ["Klimmzüge", "pull", 2],
    ["Australian Rows", "pull", 1],
    ["Dips", "push", 2],
    ["Liegestütze", "push", 1],
    ["Pike Push-ups", "push", 2],
    ["Pistol Squats", "legs", 3],
    ["L-Sit", "core", 2],
    ["Front Lever Tuck", "skill", 3],
  ] as const) add.run(name, category, level);
}

function weeklyMinutes(today = new Date()) {
  const from = new Date(today);
  from.setDate(from.getDate() - 7);
  const rows = db.prepare("SELECT date, minutes FROM workouts").all() as { date: string; minutes: number }[];
  let sum = 0;
  for (const r of rows) {
    if (new Date(r.date) >= from) sum += r.minutes;
  }
  return sum;
}

function json(res: import("node:http").ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function body(req: import("node:http").IncomingMessage) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const vite = await createVite({ server: { middlewareMode: true }, appType: "spa" });

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  try {
    if (url.pathname === "/api/exercises" && req.method === "GET") {
      return json(res, 200, db.prepare("SELECT * FROM exercises ORDER BY category, level").all());
    }
    if (url.pathname === "/api/workouts" && req.method === "GET") {
      return json(res, 200, db.prepare("SELECT * FROM workouts ORDER BY date DESC LIMIT 20").all());
    }
    if (url.pathname === "/api/workouts" && req.method === "POST") {
      const b = await body(req);
      if (!b.date || !b.minutes) return json(res, 400, { error: "date und minutes sind Pflicht" });
      const r = db.prepare("INSERT INTO workouts (date, minutes, notes) VALUES (?, ?, ?)").run(b.date, b.minutes, b.notes ?? null);
      return json(res, 201, { id: Number(r.lastInsertRowid) });
    }
    if (url.pathname === "/api/stats" && req.method === "GET") {
      return json(res, 200, { weeklyMinutes: weeklyMinutes() });
    }
    vite.middlewares(req, res);
  } catch (err) {
    console.error(err);
    json(res, 500, { error: "Serverfehler" });
  }
}).listen(PORT, () => console.log(`RepLog läuft auf http://localhost:${PORT}`));
