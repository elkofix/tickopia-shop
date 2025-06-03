import { test, expect, Page } from '@playwright/test';

export async function loginAs(email: string, page: Page) {
    const webServerUrl = process.env.WEB_SERVER_URL || 'http://localhost:8080';
    await page.goto(webServerUrl + "/auth/login");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "Hola1597!!!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\//);
}

async function goToMyProfilePage(page: Page) {
    const menuButton = page.locator('[data-testid="menu-button"]');
    await menuButton.click();
    const myTicketsButton = page.locator('button:text("Perfil")');
    await myTicketsButton.click();
    await page.waitForURL(/\/profile/);
}

test.describe('ProfilePage', () => {
    test.setTimeout(180_000); // Establece 2 minutos para cada test

    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
    });

    test.describe('Common functionality for all roles', () => {
        test.beforeEach(async ({ page }) => {
            await loginAs('guarro@gmail.com', page);
            await goToMyProfilePage(page);
        });

        test('should display profile information correctly', async ({ page }) => {
            await expect(page.locator('h1:text("Mi Perfil")')).toBeVisible();

            // Verify profile fields are displayed with correct data
            const nameField = page.locator('[data-testid="profile-field-container"]', {
                hasText: 'Nombre'
            });
            await expect(nameField).toBeVisible();
            await expect(nameField.locator('[data-testid="profile-field-label"]')).not.toBeEmpty();

            const lastnameField = page.locator('[data-testid="profile-field-container"]', {
                hasText: 'Apellido'
            });
            await expect(lastnameField).toBeVisible();
            await expect(lastnameField.locator('[data-testid="profile-field-label"]')).not.toBeEmpty();

            const emailField = page.locator('[data-testid="profile-field-container"]', {
                hasText: 'Email'
            });
            await expect(emailField).toBeVisible();
            await expect(emailField.locator('[data-testid="profile-field-label"]')).not.toBeEmpty();
        });

        test('should switch to edit mode when edit button is clicked', async ({ page }) => {
            await page.click('[data-testid="edit-profile-button"]');
            await expect(page.locator('form')).toBeVisible();
            await expect(page.locator('input[name="name"]')).toBeVisible();
            await expect(page.locator('input[name="lastname"]')).toBeVisible();
            await expect(page.locator('input[name="email"]')).toBeVisible();
        });

        test('should cancel edit mode without saving changes', async ({ page }) => {
            const original = await page.locator('[data-testid="profile-view"] >> text=Nombre').textContent();

            await page.click('[data-testid="edit-profile-button"]');


            await page.fill('input[name="name"]', 'Modified Name');
            await page.click('button:text("Cancelar")');

            // Verify we're back to view mode and changes weren't saved
            await expect(page.locator('[data-testid="profile-view"]')).toBeVisible();
            const currentName = await page.locator('[data-testid="profile-view"] >> text=Nombre').textContent();
            expect(currentName).toBe(original);
        });

        test('should open and close account closure confirmation modal', async ({ page }) => {
            // Verify modal is not visible initially
            await expect(page.locator('text=¿Estás seguro de que quieres cerrar tu cuenta?')).not.toBeVisible();

            // Open modal
            await page.click('[data-testid="close-account-button"]');
            await expect(page.locator('text=¿Estás seguro de que quieres cerrar tu cuenta?')).toBeVisible();

            // Close modal
            await page.click('button:text("Cancelar")');
            await expect(page.locator('text=¿Estás seguro de que quieres cerrar tu cuenta?')).not.toBeVisible();
        });
    });

    test.describe('As client', () => {
        test.beforeEach(async ({ page }) => {
            await loginAs('edit@gmail.com', page);
            await goToMyProfilePage(page);
        });

        test('should successfully update profile information', async ({ page }) => {
            const nameField = page.locator('[data-testid="profile-field-container"]', {
                hasText: 'Nombre'
            });
            const originalName = await nameField.locator('[data-testid="profile-field-value"]').textContent()

            await page.click('[data-testid="edit-profile-button"]');

            // Get original values
            const newName = originalName + ' (modified)';

            // Make changes
            await page.fill('input[name="name"]', newName);
            await page.click('button:text("Guardar Cambios")');

            // Wait for update to complete
            await expect(page.locator('[data-testid="edit-profile-button"]')).toBeVisible();

            // Verify changes were saved
            const nameFieldNow = page.locator('[data-testid="profile-field-container"]', {
                hasText: 'Nombre'
            });
            const currentName = await nameFieldNow.locator('[data-testid="profile-field-value"]').textContent()
            expect(currentName).toBe(newName);
        });


    });

    test.describe('As event-manager', () => {
        test.beforeEach(async ({ page }) => {
            await loginAs('colonia@gmail.com', page);
            await goToMyProfilePage(page);
        });

        test('should have all profile functionality working', async ({ page }) => {
            // Verify basic functionality works for event-managercont
            await expect(page.locator('[data-testid="profile-view"]')).toBeVisible();
            await page.click('[data-testid="edit-profile-button"]');
            await expect(page.locator('form')).toBeVisible();
            await page.click('button:text("Cancelar")');
            await expect(page.locator('[data-testid="profile-view"]')).toBeVisible();
        });
    });

    test.describe('As admin', () => {
        test.beforeEach(async ({ page }) => {
            await loginAs('alejitocordoba@hotmail.com', page);
            await goToMyProfilePage(page);
        });

        test('should have all profile functionality working', async ({ page }) => {
            // Verify basic functionality works for admin
            await expect(page.locator('[data-testid="profile-view"]')).toBeVisible();
            await page.click('[data-testid="edit-profile-button"]');
            await expect(page.locator('form')).toBeVisible();
            await page.click('button:text("Cancelar")');
            await expect(page.locator('[data-testid="profile-view"]')).toBeVisible();
        });
    });

    test.describe('Account closure', () => {
        test.beforeEach(async ({ page }) => {
            await loginAs('delete@gmail.com', page);
            await goToMyProfilePage(page);
        });

        test('should close account when confirmed', async ({ page }) => {


            await page.click('[data-testid="close-account-button"]');
            await page.click('button:text("Sí, cerrar mi cuenta")');

            // Verify we're redirected to home page after logout
            await page.waitForURL(/\//);
            await expect(page.locator('text=Mi Perfil')).not.toBeVisible();
        });
    });
});