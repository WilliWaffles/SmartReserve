const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

async function loginAdmin() {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: process.env.ADMIN_USER || "admin",
      password: process.env.ADMIN_PASS || "admin123",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Login admin falló: ${res.status} ${body}`);
  }
  const { token } = await res.json();
  if (!token) throw new Error("No se recibió token");
  return token;
}

describe("Admin auth + rutas protegidas", () => {
  test("login admin devuelve token", async () => {
    const token = await loginAdmin();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(10);
  });

  test("crear restaurante protegido con token", async () => {
    const token = await loginAdmin();

    const unique = `QA-${Date.now()}`;
    const payload = {
      name: `Rest ${unique}`,
      address: "Av. Pruebas 123",
      phone: "555-0000",
      capacity: 20,
    };

    const resCreate = await fetch(`${BASE_URL}/api/restaurants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    expect(resCreate.status).toBeGreaterThanOrEqual(200);
    expect(resCreate.status).toBeLessThan(300);

    const created = await resCreate.json();
    expect(created).toHaveProperty("id");
    expect(created.name).toBe(payload.name);
    expect(created.capacity).toBe(payload.capacity);

    // Verificar que aparece en la lista pública
    const resList = await fetch(`${BASE_URL}/api/restaurants`);
    expect(resList.ok).toBe(true);
    const list = await resList.json();
    const found = list.find(r => r.name === payload.name);
    expect(found).toBeTruthy();
  });

  test("crear restaurante SIN token debe fallar", async () => {
    const res = await fetch(`${BASE_URL}/api/restaurants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "NoAuth",
        address: "X",
        capacity: 10,
      }),
    });
    expect([401, 403]).toContain(res.status);
  });
});
