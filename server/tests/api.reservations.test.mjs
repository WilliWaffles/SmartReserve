// server/tests/api.reservations.test.mjs
import request from "supertest";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
let token;
let restaurantId;
let reservationId;

// Utilidad: “mañana a las 12:00:00.000” — dentro de horario por defecto (12:00–22:00) y minuto 00
function tomorrowAt(hour = 12, minute = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);        // mañana (UTC)
  d.setUTCHours(hour, minute, 0, 0);        // 12:00 en punto, alineado a SLOT=60
  return d;
}

describe("Reservations API", () => {
  test("admin login", async () => {
    const res = await request(BASE_URL)
      .post("/api/admin/login")
      .send({
        username: process.env.ADMIN_USER || "admin",
        password: process.env.ADMIN_PASS || "admin123",
      })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
    token = res.body.token;
  });

  test("prepare restaurant for reservations", async () => {
    const res = await request(BASE_URL)
      .post("/api/restaurants")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({
        // nombre único por corrida (evita 400 por UNIQUE name)
        name: `Slots Grill ${Date.now()}`,
        capacity: 4,
        description: "Tiny place",
      });

    if (res.status !== 201) {
      console.error("Create restaurant body:", res.text);
    }

    expect(res.status).toBe(201);
    restaurantId = res.body.id;
  });

  test("create reservation within capacity", async () => {
    const when = tomorrowAt(12, 0).toISOString(); // siempre 12:00 en punto (UTC)
    const res = await request(BASE_URL)
      .post("/api/reservations")
      .set("Content-Type", "application/json")
      .send({
        restaurantId,
        name: "Alice Test",
        people: 2,
        datetime: when,
      });

    if (res.status !== 201) {
      console.error("Create reservation body:", res.text);
    }

    expect(res.status).toBe(201);
    expect(res.body?.id).toBeTruthy();
    reservationId = res.body.id;
  });

  test("prevent overbooking when exceeding capacity", async () => {
    const when = tomorrowAt(12, 0).toISOString();
    const res = await request(BASE_URL)
      .post("/api/reservations")
      .set("Content-Type", "application/json")
      .send({
        restaurantId,
        name: "Bob Over",
        people: 5, // excede capacity=4 → debe fallar
        datetime: when,
      });
    expect([400, 409, 422]).toContain(res.status);
  });

  test("cancel reservation", async () => {
    const res = await request(BASE_URL).delete(`/api/reservations/${reservationId}`);
    expect([200, 204]).toContain(res.status);
  });
});
