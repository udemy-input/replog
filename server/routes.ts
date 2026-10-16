// API-Routen unter /api
import type { IncomingMessage, ServerResponse } from "node:http";
import { db } from "./db";
import { weeklyMinutes } from "./stats";

export function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function body(req: IncomingMessage) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

// Beantwortet API-Anfragen; gibt false zurück, wenn keine Route passt
export async function handleApi(req: IncomingMessage, res: ServerResponse, url: URL): Promise<boolean> {
  if (url.pathname === "/api/exercises" && req.method === "GET") {
    json(res, 200, db.prepare("SELECT * FROM exercises ORDER BY category, level").all());
    return true;
  }
  if (url.pathname === "/api/workouts" && req.method === "GET") {
    json(res, 200, db.prepare("SELECT * FROM workouts ORDER BY date DESC LIMIT 20").all());
    return true;
  }
  if (url.pathname === "/api/workouts" && req.method === "POST") {
    const b = await body(req);
    if (!b.date || !b.minutes) {
      json(res, 400, { error: "date und minutes sind Pflicht" });
      return true;
    }
    const r = db.prepare("INSERT INTO workouts (date, minutes, notes) VALUES (?, ?, ?)").run(b.date, b.minutes, b.notes ?? null);
    json(res, 201, { id: Number(r.lastInsertRowid) });
    return true;
  }
  if (url.pathname === "/api/stats" && req.method === "GET") {
    json(res, 200, { weeklyMinutes: weeklyMinutes() });
    return true;
  }
  return false;
}
