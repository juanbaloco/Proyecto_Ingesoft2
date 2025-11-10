import { test, expect } from "@playwright/test";

test.describe("HU6 - Borrar seleccion solicitud CDT", () => {
  test("Debe permitir cancelar solicitud en curso", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "santiago123@gmail.com");
    await page.fill('input[name="password"]', "123456");
    await page.click('button:has-text("Entrar")');
    await expect(page).toHaveURL(/dashboard/);
    await page.selectOption('select[name="producto"]', 'CDT Tradicional');
    await page.fill('input[name="monto"]', "5000000");
    await page.selectOption('select[name="plazo"]', '12');
    await page.click('button:has-text("Borrar Selección")');
    await expect(page.locator('select[name="producto"]')).toHaveValue("");
    await expect(page.locator('select[name="plazo"]')).toHaveValue("");
    await expect(page.locator('input[name="monto"]')).toHaveValue("");
  });

});
