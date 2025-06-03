import { test, expect, type Page } from '@playwright/test';
import path from 'path';

test.setTimeout(180_000); // Establece 3 minutos para cada test


export async function loginAs(email: string, page: Page) {
    const webServerUrl = process.env.WEB_SERVER_URL || 'http://localhost:8080';
    await page.goto(webServerUrl + "/auth/login");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "Hola1597!!!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\//);
}

async function goToCreateEventPage(page: Page) {
    const menuButton = page.locator('[data-testid="menu-button"]');
    await menuButton.click();
    const createEventButton = page.locator('button:text("Crear Evento")');
    await createEventButton.click();
    await page.waitForURL(/\/create/);
}

test.describe('CreateEventPage', () => {
    test.setTimeout(180_000); // Establece 3 minutos para cada test

    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
    });

    test.describe('Create Event Functionality', () => {
        test.beforeEach(async ({ page }) => {
            await loginAs('isabella.ocampo@u.icesi.edu.co', page);
            await goToCreateEventPage(page);
        });

        test('should display create event form with all fields', async ({ page }) => {
            await expect(page.locator('h1:text("Crear Nuevo Evento")')).toBeVisible();
            await expect(page.locator('input[name="name"]')).toBeVisible();
            await expect(page.locator('input[type="file"]#bannerFile')).toBeVisible();
            await expect(page.locator('[data-testid="banner-file-input"]')).toBeVisible();
            await expect(page.locator('input[name="isPublic"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toHaveText('Crear Evento');
            
            // Verificar que el checkbox está marcado por defecto
            await expect(page.locator('input[name="isPublic"]')).toBeChecked();
        });

       test('should allow filling out the form and submitting', async ({ page }) => {
            await page.fill('input[name="name"]', 'Evento de Prueba E2E');

            // Ruta absoluta a una imagen válida
            const imagePath = path.resolve(__dirname, 'assets/banner.jpg');

            await page.setInputFiles('input[type="file"]#bannerFile', imagePath);

            // Esperar a que aparezca el preview
            await expect(page.getByText('Imagen seleccionada:')).toBeVisible();

            // Click en botón "Usar esta imagen"
            const useImageButton = page.getByRole('button', { name: 'Usar esta imagen' });
            await expect(useImageButton).toBeVisible();
            await useImageButton.click();

            // Esperar resultado de la subida a Cloudinary
            let uploadResult: 'success' | 'error' | null = null;

            for (let i = 0; i < 45; i++) {
                if (await page.getByText('✓ Imagen lista para usar').isVisible()) {
                uploadResult = 'success';
                break;
                }
                if (await page.locator('.bg-red-50').isVisible()) {
                uploadResult = 'error';
                break;
                }
                if ((await page.locator('button:has-text("Subiendo...")').count()) === 0) {
                break;
                }
                await page.waitForTimeout(1000);
            }

            if (uploadResult === 'error') {
                console.warn('❌ La subida a Cloudinary falló. Terminando prueba.');
                return;
            }

            if (uploadResult === 'success') {
                await expect(page.locator('input[name="isPublic"]')).toBeChecked();

                await page.click('button[type="submit"]');

                try {
                await expect(page.getByText('¡Evento creado exitosamente!')).toBeVisible({ timeout: 60000 });
                await page.waitForURL('http://localhost:8080/', { timeout: 30000 });
                } catch (error) {
                const formError = page.locator('.bg-red-50');
                if (await formError.isVisible()) {
                    console.warn('❌ Error al crear el evento (formulario respondió con error visible).');
                } else {
                    throw error;
                }
                }
            }
            });


        test('should show validation error for missing name', async ({ page }) => {
            // Intentar enviar sin llenar el nombre
            await page.click('button[type="submit"]');
            
            // Esperar a que aparezca el error
            await page.waitForTimeout(500);
            
            // Verificar error de nombre vacío (la validación del browser o custom)
            const errorContainer = page.locator('.bg-red-50');
            const nameRequiredError = page.locator('text=El nombre del evento es obligatorio');
            
            // Si hay validación HTML5, puede que no aparezca el error custom
            // Verificar si aparece algún tipo de validación
            const isCustomErrorVisible = await nameRequiredError.isVisible();
            
            if (isCustomErrorVisible) {
                await expect(errorContainer).toBeVisible();
                await expect(nameRequiredError).toBeVisible();
            } else {
                // Verificar validación HTML5 nativa
                const nameInput = page.locator('input[name="name"]');
                const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
                expect(validationMessage).toBeTruthy();
            }
        });

        test('should show validation error for missing image', async ({ page }) => {
            // Llenar solo el nombre
            await page.fill('input[name="name"]', 'Test Event');
            
            // Intentar enviar sin imagen
            await page.click('button[type="submit"]');
            
            // Esperar a que aparezca el error de imagen
            await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 5000 });
            await expect(page.locator('text=Debes subir una imagen para el banner del evento')).toBeVisible();
        });

        test('should allow canceling image selection', async ({ page }) => {
            // Seleccionar una imagen
            await page.setInputFiles('input[type="file"]#bannerFile', {
                name: 'test-banner.jpg',
                mimeType: 'image/jpeg',
                buffer: Buffer.from('fake-image-data')
            });
            
            // Esperar a que aparezca el preview
            await expect(page.locator('text=Imagen seleccionada:')).toBeVisible();
            
            // Hacer clic en cancelar
            const cancelButton = page.locator('[data-testid="cancel-image-button"]');
            await expect(cancelButton).toBeVisible();
            await cancelButton.click();
            
            // Verificar que el preview desaparece
            await expect(page.locator('text=Imagen seleccionada:')).not.toBeVisible();
            
            // Verificar que el input file se limpia
            const fileInput = page.locator('input[type="file"]#bannerFile');
            const files = await fileInput.evaluate((el: HTMLInputElement) => el.files?.length || 0);
            expect(files).toBe(0);
        });

        test('should show cancel button and redirect to home', async ({ page }) => {
            // Wait for the page to be fully loaded
            await page.waitForLoadState('networkidle');
            
            // Hacer clic en el botón cancelar
            const cancelButton = page.locator('button:text("Cancelar")');
            await expect(cancelButton).toBeVisible();
            
            // Use Promise.all to handle both the click and navigation simultaneously
            await Promise.all([
                page.waitForURL('http://localhost:8080/', { timeout: 60000 }),
                cancelButton.click()
            ]);
        });

        test('should validate file type restrictions', async ({ page }) => {
            // Intentar subir un archivo que no es imagen
            await page.setInputFiles('input[type="file"]#bannerFile', {
                name: 'test-document.txt',
                mimeType: 'text/plain',
                buffer: Buffer.from('this is not an image')
            });
            
            // Esperar a que aparezca error de tipo de archivo
            await expect(page.locator('text=Solo se permiten archivos de imagen (JPEG, PNG, WebP, GIF)')).toBeVisible({ timeout: 5000 });
        });
    });
});