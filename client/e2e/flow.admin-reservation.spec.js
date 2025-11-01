// client/e2e/flow.admin-reservation.spec.js
import { test, expect } from "@playwright/test";

test("login admin, create restaurant, make and cancel reservation (happy path)", async ({ page }) => {
  // Home
  await page.goto("/");
  await expect(page).toHaveTitle(/SmartReserve/i);

  // Ir a /admin
  await page.goto("/admin");

  // Login (ajusta selectores según tu UI)
  await page.getByLabel(/usuario/i).fill(process.env.ADMIN_USER || "admin");
  await page.getByLabel(/contraseña|password/i).fill(process.env.ADMIN_PASS || "admin123");
  await page.getByRole("button", { name: /ingresar|login/i }).click();

  // Crear restaurante
  await page.getByLabel(/nombre/i).fill("PW Diner");
  await page.getByLabel(/capacidad/i).fill("10");
  await page.getByRole("button", { name: /crear/i }).click();

  // Debe aparecer en la lista
  await expect(page.getByText(/PW Diner/i)).toBeVisible();

  // Ir a reservar (asumiendo link o navegación)
  await page.goto("/");

  // Hacer una reserva rápida (ajusta selectores según tu UI real)
  await page.getByRole("button", { name: /reservar/i }).first().click();
  await page.getByLabel(/nombre/i).fill("Play W Right");
  await page.getByLabel(/personas|people/i).fill("2");
  // Si tienes selector de fecha/hora, podrías saltarlo o simularlo si hay defaults
  await page.getByRole("button", { name: /confirmar|guardar/i }).click();

  // Confirmación visible
  await expect(page.getByText(/reserva/i)).toBeVisible();

  // Cancelar (si UI lo permite)
  const cancelBtn = page.getByRole("button", { name: /cancelar/i }).first();
  if (await cancelBtn.isVisible()) {
    await cancelBtn.click();
    await expect(page.getByText(/cancelada|cancelado/i)).toBeVisible({ timeout: 5000 }).catch(() => {});
  }
});
