import { test, expect } from "@playwright/test";

test.describe("HU5 - Actualizar estado de solicitud", () => {
  test("Debe permitir cambiar estado a Aprobada", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@neobank.com");
    await page.fill('input[name="password"]', "Admin123456");
    await page.click('button:has-text("Entrar")');
    await expect(page).toHaveURL(/admin/);
    await expect(page.locator("text=NeoBank - Panel de Administrador")).toBeVisible();
    await page.locator('button:has-text("✅")').first().click();
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe("La solicitud ha sido aprobada correctamente.");
      await dialog.dismiss();
    });
  });

  test("Debe permitir cambiar estado a Rechazada", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@neobank.com");
    await page.fill('input[name="password"]', "Admin123456");
    await page.click('button:has-text("Entrar")');
    await expect(page).toHaveURL(/admin/);
    await expect(page.locator("text=NeoBank - Panel de Administrador")).toBeVisible();
    await page.locator('button:has-text("❌")').first().click();
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe("La solicitud ha sido rechazada correctamente.");
      await dialog.dismiss();
    });
  });

  test("Debe restringir acción a usuarios sin rol de administrador", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "santiago123@gmail.com");
    await page.fill('input[name="password"]', "123456");
    await page.click('button:has-text("Entrar")');
    await expect(page).toHaveURL(/dashboard/);
  });

  test("Filtra por monto de solicitud", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@neobank.com");
    await page.fill('input[name="password"]', "Admin123456");
    await page.click('button:has-text("Entrar")');
    await expect(page).toHaveURL(/admin/);
    await expect(page.locator("text=NeoBank - Panel de Administrador")).toBeVisible();
    await page.selectOption('select[name="select-orden"]', 'monto');
  });
})
