import http from "k6/http";
import { check, sleep } from "k6";

export const options = { vus: 10, duration: "30s" };
const BASE = "http://localhost:3001";

export default function () {
  // 1) Listar restaurantes
  let res = http.get(`${BASE}/api/restaurants`);
  check(res, { "GET /restaurants 200": (r) => r.status === 200 });

  const list = res.json();
  if (Array.isArray(list) && list.length > 0) {
    const id = list[0].id;
    const date = new Date(Date.now() + 2*60*60*1000).toISOString();
    // 2) Consultar disponibilidad
    res = http.get(`${BASE}/api/restaurants/${id}/availability?date=${encodeURIComponent(date)}`);
    check(res, { "GET /availability 200": (r) => r.status === 200 });
  }
  sleep(1);
}
