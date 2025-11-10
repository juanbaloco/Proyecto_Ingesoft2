import { test, expect } from "@playwright/test";

test.describe("HU3 - Listado de solicitudes CDT", () => {
  test("Debe mostrar todas las solicitudes del cliente", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "santiago123@gmail.com");
  await page.fill('input[name="password"]', "123456");
  await page.click('button:has-text("Entrar")');
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator("text=Mis solicitudes")).toBeVisible();

});


  test("Debe permitir buscar por monto de solicitud", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "santiago123@gmail.com");
    await page.fill('input[name="password"]', "123456");
    await page.click('button:has-text("Entrar")');
    await expect(page).toHaveURL(/dashboard/);
    await page.selectOption('select[name="producto"]', 'CDT Tradicional');
    await page.fill('input[name="monto"]', "5000000");
    await page.selectOption('select[name="plazo"]', '12');
    await page.click('button:has-text("Guardar solicitud")');
    await expect(page.locator("text=Solicitud creada")).toBeVisible();
    await page.fill('input[placeholder="🔍 Buscar por monto o plazo"]', "5000000");
    await expect(page.locator("text=5.000.000").first()).toBeVisible();
  });

  test("Debe restringir acceso si no está autenticado", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});
