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

async function goToReportsPage(page: Page) {
    const menuButton = page.locator('[data-testid="menu-button"]');
    await menuButton.click();
    const myTicketsButton = page.locator('button:text("Reportes")');
    await myTicketsButton.click();
    await page.waitForURL(/\/admin/);
}

test.describe('Reports Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
        await loginAs('alejitocordoba@hotmail.com', page);
        await goToReportsPage(page);
    });

    test('should display the main page header', async ({ page }) => {
        await expect(page.locator('h1:text("Generador de Reportes")')).toBeVisible();
        await expect(page.locator('text=Descarga reportes detallados de ventas y ocupación')).toBeVisible();
    });

    test('should show both report cards', async ({ page }) => {
        // Sales Report Card
        await expect(page.locator('h2:text("Reporte de Ventas")')).toBeVisible();
        await expect(page.locator('text=Análisis detallado de ventas')).toBeVisible();
        
        // Occupation Report Card
        await expect(page.locator('h2:text("Reporte de Ocupación")')).toBeVisible();
        await expect(page.locator('text=Estado de ocupación de eventos')).toBeVisible();
    });

    test('should display all sales report features', async ({ page }) => {
        const salesCard = page.locator('div:has-text("Reporte de Ventas")').locator('..');
        
        await expect(salesCard.locator('text=Tickets por evento')).toBeVisible();
        await expect(salesCard.locator('text=Tickets por vendedor')).toBeVisible();
        await expect(salesCard.locator('text=Análisis de rendimiento')).toBeVisible();
    });

    test('should display all occupation report features', async ({ page }) => {
        const occupationCard = page.locator('div:has-text("Reporte de Ocupación")').locator('..');
        
        await expect(occupationCard.locator('text=Tickets totales vs canjeados')).toBeVisible();
        await expect(occupationCard.locator('text=Ratios de ocupación')).toBeVisible();
        await expect(occupationCard.locator('text=Resumen estadístico')).toBeVisible();
    });

    test('should show information section with correct details', async ({ page }) => {
        await expect(page.locator('h3:text("Información de los Reportes")')).toBeVisible();
        
        const infoSection = page.locator('text=Información de los Reportes').locator('..').locator('..');
        
        await expect(infoSection.locator('text=Los reportes se generan en tiempo real')).toBeVisible();
        await expect(infoSection.locator('text=Los archivos PDF incluyen gráficos')).toBeVisible();
        await expect(infoSection.locator('text=Se guardan automáticamente en el servidor')).toBeVisible();
        await expect(infoSection.locator('text=Formato optimizado para impresión')).toBeVisible();
    });

    test.describe('Download Reports Functionality', () => {
        test.beforeEach(async ({ page }) => {
            // Mock API responses before each test
            await page.route('**/generateSalesReport', route => route.fulfill({
                status: 200,
                body: JSON.stringify({
                    data: 'dummy-base64-data',
                    mimeType: 'application/pdf'
                })
            }));
            
            await page.route('**/generateOccupationReport', route => route.fulfill({
                status: 200,
                body: JSON.stringify({
                    data: 'dummy-base64-data',
                    mimeType: 'application/pdf'
                })
            }));
        });

        test('should download sales report successfully', async ({ page }) => {
            const salesDownloadButton = page.locator('button:text("Descargar Reporte de Ventas")');
            
            // Start download
            const downloadPromise = page.waitForEvent('download');
            await salesDownloadButton.click();
            
            // Wait for download to complete
            const download = await downloadPromise;
            
            // Verify download
            expect(download.suggestedFilename()).toMatch(/reporte-sales-.*\.pdf/);
            await expect(page.locator('text=¡Descargado!')).toBeVisible();
        });

        test('should download occupation report successfully', async ({ page }) => {
            const occupationDownloadButton = page.locator('button:text("Descargar Reporte de Ocupación")');
            
            // Start download
            const downloadPromise = page.waitForEvent('download');
            await occupationDownloadButton.click();
            
            // Wait for download to complete
            const download = await downloadPromise;
            
            // Verify download
            expect(download.suggestedFilename()).toMatch(/reporte-occupation-.*\.pdf/);
            await expect(page.locator('text=¡Descargado!')).toBeVisible();
        });

        test('should show loading state during report generation', async ({ page }) => {
            // Add delay to API response
            await page.route('**/generateSalesReport', async route => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify({
                        data: 'dummy-base64-data',
                        mimeType: 'application/pdf'
                    })
                });
            });
            
            const salesDownloadButton = page.locator('button:text("Descargar Reporte de Ventas")');
            await salesDownloadButton.click();
            
            // Verify loading state
            await expect(page.locator('text=Generando...')).toBeVisible();
        });

    });
});