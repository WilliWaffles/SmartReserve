// server/index.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { loginAdmin, requireAdmin } from "./adminAuth.js";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

function dayWindow(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d)) return null;
  const start = new Date(d); start.setHours(0, 0, 0, 0);
  const end   = new Date(d); end.setHours(23, 59, 59, 999);
  return { start, end };
}

/** Health y raíz */
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) =>
  res.status(200).send("SmartReserve API is running")
);

/** -------- Admin Auth -------- */
/**
 * Recibe { "username": "...", "password": "..." }
 * Si son válidos, devuelve { token: "<...>" }
 * Este token se usará luego en Authorization: Bearer <token>
 */
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  const token = loginAdmin(username, password);
  if (!token) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }
  return res.json({ token });
});

/** Zod schemas */
const restaurantSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  phone: z.string().optional(),
  capacity: z.number().int().positive()
});

// string (YYYY-MM-DD o ISO)
const availabilitySchema = z.object({ date: z.string() });

const reservationSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  partySize: z.number().int().positive(),
  date: z.string(), // lo convertimos a Date
  restaurantId: z.number().int().positive()
});

/** -------- Restaurants -------- */
app.get("/api/restaurants", async (_req, res) => {
  const list = await prisma.restaurant.findMany({
    orderBy: { id: "desc" },
  });
  res.json(list);
});

/**
 * Crear restaurante (ruta protegida - solo admin).
 * Requiere header Authorization: Bearer <token_valido_admin>
 */
app.post("/api/restaurants", requireAdmin, async (req, res) => {
  try {
    const data = restaurantSchema.parse(req.body);
    const r = await prisma.restaurant.create({ data });
    res.status(201).json(r);
  } catch (e) {
    res.status(400).json({ error: e?.issues ?? "invalid body" });
  }
});

/** -------- Availability por DÍA -------- */
// Ej: GET /api/restaurants/1/availability?date=2025-10-20
app.get("/api/restaurants/:id/availability", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = availabilitySchema.parse(req.query);
    const win = dayWindow(parsed.date);
    if (!win) return res.status(400).json({ error: "invalid date" });

    const r = await prisma.restaurant.findUnique({ where: { id } });
    if (!r) return res.status(404).json({ error: "restaurant not found" });

    const agg = await prisma.reservation.aggregate({
      _sum: { partySize: true },
      where: {
        restaurantId: id,
        status: "booked",
        date: { gte: win.start, lte: win.end }
      }
    });

    const reserved = agg._sum.partySize ?? 0;
    const available = Math.max(0, r.capacity - reserved);

    res.json({
      capacity: r.capacity,
      reserved,
      available,
      date: win.start.toISOString()
    });
  } catch (_e) {
    res.status(400).json({ error: "invalid params" });
  }
});

/** -------- Reservations -------- */
app.get("/api/reservations", async (_req, res) => {
  const list = await prisma.reservation.findMany({
    include: { restaurant: true },
    orderBy: { id: "desc" }
  });
  res.json(list);
});

app.post("/api/reservations", async (req, res) => {
  try {
    const data = reservationSchema.parse(req.body);

    const r = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId }
    });
    if (!r)
      return res.status(404).json({ error: "restaurant not found" });

    // Disponibilidad por DÍA
    const win = dayWindow(data.date);
    if (!win)
      return res.status(400).json({ error: "invalid date" });

    const agg = await prisma.reservation.aggregate({
      _sum: { partySize: true },
      where: {
        restaurantId: data.restaurantId,
        status: "booked",
        date: { gte: win.start, lte: win.end }
      }
    });
    const reserved = agg._sum.partySize ?? 0;

    if (reserved + data.partySize > r.capacity) {
      return res.status(409).json({
        error: "No hay disponibilidad para tantas personas."
      });
    }

    // fecha normalizada al inicio del día
    const created = await prisma.reservation.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        partySize: data.partySize,
        date: win.start,
        restaurantId: data.restaurantId,
        status: "booked"
      }
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e?.issues ?? "invalid body" });
  }
});

/**
 * Cancelar una reserva (ruta protegida - solo admin).
 * PATCH/PUT: cambia status => "cancelled"
 */
app.put("/api/reservations/:id/cancel", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: "cancelled" }
    });
    res.json(updated);
  } catch (_e) {
    return res.status(404).json({ error: "reservation not found" });
  }
});

/** -------- Listen -------- */
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

export { app, prisma };
