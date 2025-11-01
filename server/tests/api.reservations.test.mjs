// server/tests/api.reservations.test.mjs
import request from "supertest";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
let token;
let restaurantId;
let reservationId;

describe("Reservations API", () => {
  test("admin login", async () => {
    const res = await request(BASE_URL)
      .post("/api/admin/login")
      .send({ username: process.env.ADMIN_USER || "admin", password: process.env.ADMIN_PASS || "admin123" })
      .set("Content-Type", "application/json");
    expect(res.status).toBe(200);
    token = res.body.token;
  });

  test("prepare restaurant for reservations", async () => {
    const res = await request(BASE_URL)
      .post("/api/restaurants")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Slots Grill", capacity: 4, description: "Tiny place" });
    expect(res.status).toBe(201);
    restaurantId = res.body.id;
  });

  test("create reservation within capacity", async () => {
    const res = await request(BASE_URL)
      .post("/api/reservations")
      .send({
        restaurantId,
        name: "Alice Test",
        people: 2,
        datetime: new Date(Date.now() + 60 * 60 * 1000).toISOString() // +1h
      });
    expect(res.status).toBe(201);
    expect(res.body?.id).toBeTruthy();
    reservationId = res.body.id;
  });

  test("prevent overbooking when exceeding capacity", async () => {
    const res = await request(BASE_URL)
      .post("/api/reservations")
      .send({
        restaurantId,
        name: "Bob Over",
        people: 5,
        datetime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      });
    // Dependiendo de tu implementación: 400/422 con mensaje
    expect([400, 409, 422]).toContain(res.status);
  });

  test("cancel reservation", async () => {
    const res = await request(BASE_URL)
      .delete(`/api/reservations/${reservationId}`);
    expect([200, 204]).toContain(res.status);
  });
});
