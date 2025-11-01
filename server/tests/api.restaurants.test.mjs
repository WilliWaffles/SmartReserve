import request from "supertest";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
let token;
let createdRestaurantId;

// nombre único por corrida (evita errores por UNIQUE)
const uniqueName = `E2E Bistro ${Date.now()}`;

describe("Restaurants API", () => {
  test("admin login to get token", async () => {
    const res = await request(BASE_URL)
      .post("/api/admin/login")
      .set("Content-Type", "application/json")
      .send({
        username: process.env.ADMIN_USER || "admin",
        password: process.env.ADMIN_PASS || "admin123",
      });

    expect(res.status).toBe(200);
    expect(res.body?.token).toBeTruthy();
    token = res.body.token;
  });

  test("create restaurant", async () => {
    const payload = {
      name: uniqueName,
      capacity: 20,
      address: "123 Test Ave",        // <-- requerido por el backend
      description: "Test spot"
    };

    const res = await request(BASE_URL)
      .post("/api/restaurants")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send(payload);

    if (res.status !== 201) {
      console.error("Create restaurant body:", res.text);
    }

    expect(res.status).toBe(201);
    expect(res.body?.id).toBeTruthy();
    expect(res.body?.name).toBe(uniqueName);
    createdRestaurantId = res.body.id;
  });

  test("list restaurants contains created", async () => {
    const res = await request(BASE_URL).get("/api/restaurants");
    expect(res.status).toBe(200);
    const found = res.body.find((r) => r.id === createdRestaurantId);
    expect(found).toBeTruthy();
  });
});
