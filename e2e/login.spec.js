import { test, expect } from "@playwright/test";

test.describe("HU1 - Inicio de sesión seguro", () => {
    test("Debe permitir ingresar credenciales válidas y acceder al dashboard", async ({ page }) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', "santiago123@gmail.com");
        await page.fill('input[name="password"]', "123456");
        await page.click('button:has-text("Entrar")');
        await expect(page).toHaveURL(/dashboard/);
        await expect(page.locator("text=NeoBank - NeoCDT")).toBeVisible();
    });

    test("Debe mostrar mensaje de error con credenciales inválidas", async ({ page }) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', "invalido@neobank.com");
        await page.fill('input[name="password"]', "error1234");
        await page.click('button:has-text("Entrar")');
        await expect(page.locator("text=Correo o contraseña incorrectos. Por favor, intenta de nuevo.")).toBeVisible();
    });

    test("Debe mantener sesión activa tras recargar la página", async ({ page }) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', "santiago123@gmail.com");
        await page.fill('input[name="password"]', "123456");
        await page.click('button:has-text("Entrar")');
        await expect(page.locator("text=NeoBank - NeoCDT")).toBeVisible();
        await page.reload();
        await expect(page.locator("text=NeoBank - NeoCDT")).toBeVisible();
    });


    test("Debe redirigir a login si el usuario no está autenticado", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(page).toHaveURL(/login/);
    });
});
