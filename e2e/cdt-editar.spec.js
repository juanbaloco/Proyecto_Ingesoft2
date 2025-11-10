import { test, expect } from "@playwright/test";

test.describe("HU4 - Modificar solicitud CDT en borrador", () => {
  test("Debe permitir editar una solicitud en borrador", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "santiago123@gmail.com");
    await page.fill('input[name="password"]', "123456");
    await page.click('button:has-text("Entrar")');
    await expect(page).toHaveURL(/dashboard/);
    await page.locator('button:has-text("Editar")').first().click();
    await page.fill('input[name="monto"]', "6000000");
    await page.selectOption('select[name="plazo"]', '24');
    await page.click('button:has-text("Guardar cambios")');
    await expect(page.locator("text=Detalle de Solicitud")).toBeVisible();
  })
})
