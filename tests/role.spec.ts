import { test, expect, Page } from '@playwright/test';
    test.setTimeout(180_000); // Establece 2 minutos para cada test

export async function loginAs(email: string, page: Page) {
    const webServerUrl = process.env.WEB_SERVER_URL || 'http://localhost:8080';
    await page.goto(webServerUrl + "/auth/login");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "Hola1597!!!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\//);
}

async function goToRolesPage(page: Page) {
    const menuButton = page.locator('[data-testid="menu-button"]');
    await menuButton.click();
    const myTicketsButton = page.locator('button:text("Usuarios")');
    await myTicketsButton.click();
    await page.waitForURL(/\/admin/);
}

test.describe('User Roles Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
        await loginAs('alejitocordoba@hotmail.com', page);
        await goToRolesPage(page);
    });

    test('should display users table with correct columns', async ({ page }) => {
        await expect(page.locator('th:text("Name")')).toBeVisible();
        await expect(page.locator('th:text("Email")')).toBeVisible();
        await expect(page.locator('th:text("Status")')).toBeVisible();
        await expect(page.locator('th:text("Roles")')).toBeVisible();
        await expect(page.locator('th:text("Actions")')).toBeVisible();
    });

    test('should show user information in each row', async ({ page }) => {
        // Wait for at least one user row to appear
        const firstUserRow = page.locator('tbody tr').first();
        await expect(firstUserRow).toBeVisible();

        // Verify basic user info is displayed
        await expect(firstUserRow.locator('td:nth-child(1)')).not.toBeEmpty(); // Name
        await expect(firstUserRow.locator('td:nth-child(2)')).not.toBeEmpty(); // Email
        await expect(firstUserRow.locator('td:nth-child(3)')).toHaveText(/Active|Inactive/);
    });

    test('should display role badges with correct colors', async ({ page }) => {
        // Test for each role type
        const roleColors = {
            'admin': 'bg-red-100',
            'event-manager': 'bg-blue-100',
            'ticketChecker': 'bg-green-100',
            'client': 'bg-gray-100'
        };

        // Check at least one user has roles displayed
        const rolesCell = page.locator('tbody tr td:nth-child(4)').first();
        await expect(rolesCell).toBeVisible();

        // Check that role badges have appropriate colors
        for (const [role, colorClass] of Object.entries(roleColors)) {
            const roleBadge = rolesCell.locator(`span.${colorClass}`);
            if (await roleBadge.count() > 0) {
                await expect(roleBadge).toContainText(role);
            }
        }
    });

    test('should enable role editing when Edit button is clicked', async ({ page }) => {
        const firstEditButton = page.locator('button:text("Edit Roles")').first();
        await firstEditButton.click();

        // Verify checkboxes appear for all roles
        for (const role of ['admin', 'client', 'event-manager', 'ticketChecker']) {
            await expect(page.locator(`label:has-text("${role}") input[type="checkbox"]`).first()).toBeVisible();
        }

        // Verify Save and Cancel buttons appear
        await expect(page.locator('button:text("Save")').first()).toBeVisible();
        await expect(page.locator('button:text("Cancel")').first()).toBeVisible();
    });

    test('should cancel editing without saving changes', async ({ page }) => {
        // Start editing the second user
        const initialRolesText = await page.locator('tbody tr td:nth-child(4)').nth(1).textContent();

        await page.locator('button:text("Edit Roles")').nth(1).click();

        // Make a change
        await page.locator('label:has-text("admin") input[type="checkbox"]').first().click();

        // Click Cancel
        await page.locator('button:text("Cancel")').first().click();

        // Verify roles display returned to original state
        await expect(page.locator('tbody tr td:nth-child(4)').nth(1)).toHaveText(initialRolesText!);
    });


    test('should successfully save role changes', async ({ page }) => {
        // Mock the API response
        await page.route('**/updateRolesToUser', route => route.fulfill({
            status: 200,
            body: JSON.stringify({ success: true })
        }));

        // Start editing the first user
        await page.locator('button:text("Edit Roles")').first().click();

        // Toggle a role
        await page.locator('label:has-text("admin") input[type="checkbox"]').first().click();

        // Click Save
        await page.locator('button:text("Save")').first().click();

        // Verify editing mode is exited
        await expect(page.locator('button:text("Edit Roles")').first()).toBeVisible();
    });

    test('should show loading state during save operation', async ({ page }) => {
        // Add delay to API response to test loading state
        await page.route('**/updateRolesToUser', async route => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ success: true })
            });
        });

        // Start editing the first user
        await page.locator('button:text("Edit Roles")').first().click();

        // Click Save and verify loading state
        const saveButton = page.locator('button:text("Save")').first();
        await saveButton.click();
        const savingButton = page.locator('button:text("Saving...")').first();
        await expect(savingButton).toBeVisible();
        await expect(savingButton).toBeDisabled();
    });
});