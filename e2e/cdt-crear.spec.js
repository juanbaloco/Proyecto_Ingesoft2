import { test, expect } from "@playwright/test";

test.describe("HU2 - Registrar nueva solicitud de CDT", () => {
  test("Debe mostrar formulario de nueva solicitud", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "santiago123@gmail.com");
    await page.fill('input[name="password"]', "123456");
    await page.click('button:has-text("Entrar")');
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator("text=Guardar solicitud")).toBeVisible();
  });

  test("Debe permitir ingresar monto, plazo y tasa válidos", async ({ page }) => {
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
  });

  test("Debe validar campos vacíos o inválidos", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "santiago123@gmail.com");
    await page.fill('input[name="password"]', "123456");
    await page.click('button:has-text("Entrar")');
    await page.fill('input[name="monto"]', "");
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe("Seleccione un producto");
      await dialog.dismiss();
    });
    await page.click('button:has-text("Guardar solicitud")');
  });
});
