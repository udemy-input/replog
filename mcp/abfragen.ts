// Lesende Datenbank-Abfragen für den RepLog-MCP-Server
import type { DatabaseSync } from "node:sqlite";

export type Training = { id: number; date: string; minutes: number; notes: string | null };
export type TrainingsZeitraum = { von: string; bis: string; trainings: Training[]; summeMinuten: number };
export type Uebung = { id: number; name: string; category: string; level: number };

const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/;

/** Trainings von `von` bis `bis` (beide inklusive, ISO-Datum) samt Summe der Minuten */
export function trainingsImZeitraum(db: DatabaseSync, von: string, bis: string): TrainingsZeitraum {
  if (!ISO_DATUM.test(von) || !ISO_DATUM.test(bis)) {
    throw new Error("Datum muss im Format YYYY-MM-DD angegeben werden");
  }
  if (von > bis) throw new Error("„von“ darf nicht nach „bis“ liegen");

  const trainings = db
    .prepare("SELECT id, date, minutes, notes FROM workouts WHERE date BETWEEN ? AND ? ORDER BY date, id")
    .all(von, bis) as Training[];
  const summeMinuten = trainings.reduce((summe, t) => summe + t.minutes, 0);
  return { von, bis, trainings, summeMinuten };
}

/** Alle Übungen, optional gefiltert nach Kategorie, sortiert nach Level und Name */
export function uebungen(db: DatabaseSync, kategorie?: string): Uebung[] {
  const sql = "SELECT id, name, category, level FROM exercises";
  const sortierung = " ORDER BY level, name";
  return (
    kategorie
      ? db.prepare(sql + " WHERE category = ?" + sortierung).all(kategorie)
      : db.prepare(sql + sortierung).all()
  ) as Uebung[];
}
