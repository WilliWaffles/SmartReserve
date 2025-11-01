import request from "supertest";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
let token;
let restaurantId;
let reservationId;

// Mañana a las 12:00 UTC (alineado a SLOT=60 y dentro de OPEN/CLOSE por defecto)
function tomorrowAt(hour = 12, minute = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

describe("Reservations API", () => {
  test("admin login", async () => {
    const res = await request(BASE_URL)
      .post("/api/admin/login")
      .set("Content-Type", "application/json")
      .send({
        username: process.env.ADMIN_USER || "admin",
        password: process.env.ADMIN_PASS || "admin123",
      });
    expect(res.status).toBe(200);
    token = res.body.token;
  });

  test("prepare restaurant for reservations", async () => {
    const res = await request(BASE_URL)
      .post("/api/restaurants")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({
        name: `Slots Grill ${Date.now()}`, // único
        capacity: 4,
        address: "456 Slot St",            // <-- requerido por el backend
        description: "Tiny place"
      });

    if (res.status !== 201) {
      console.error("Create restaurant body:", res.text);
    }

    expect(res.status).toBe(201);
    restaurantId = res.body.id;
  });

  test("create reservation within capacity", async () => {
    const when = tomorrowAt(12, 0).toISOString();

    const res = await request(BASE_URL)
      .post("/api/reservations")
      .set("Content-Type", "application/json")
      .send({
        restaurantId,                  // <-- nombre correcto
        customerName: "Alice Test",    // <-- nombre correcto
        customerEmail: "alice@test.com",
        partySize: 2,                  // <-- nombre correcto
        date: when                     // <-- nombre correcto
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
        customerName: "Bob Over",
        customerEmail: "bob@test.com",
        partySize: 5,     // excede capacity=4
        date: when
      });

    // según tu implementación puede ser 400/409/422
    expect([400, 409, 422]).toContain(res.status);
  });

  test("cancel reservation", async () => {
    const res = await request(BASE_URL)
      .delete(`/api/reservations/${reservationId}`);
    expect([200, 204]).toContain(res.status);
  });
});
