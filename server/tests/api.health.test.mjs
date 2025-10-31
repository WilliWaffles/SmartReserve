const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

describe("API /health", () => {
  test("debe responder ok:true", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data).toEqual({ ok: true });
  });
});
