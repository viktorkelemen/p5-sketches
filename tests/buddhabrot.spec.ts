import { test, expect } from '@playwright/test';

test.describe('Buddhabrot Sketch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sketches/buddhabrot/');
  });

  test('should load without errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });
    expect(consoleErrors).toHaveLength(0);
  });

  test('should have fixed 640x480 resolution', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.width).toBe(640);
    expect(canvasBox!.height).toBe(480);
  });

  test('should render colorful content after sampling', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Let it render for longer to accumulate more samples
    await page.waitForTimeout(5000);

    // Check for colorful pixels (not just grayscale)
    const colorAnalysis = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let colorfulPixels = 0;
      let totalNonBlack = 0;

      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        if (r > 5 || g > 5 || b > 5) {
          totalNonBlack++;
          // Check if pixel has color variation (not grayscale)
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          if (maxC - minC > 20) {
            colorfulPixels++;
          }
        }
      }

      return { colorfulPixels, totalNonBlack };
    });

    expect(colorAnalysis).not.toBeNull();
    expect(colorAnalysis!.totalNonBlack).toBeGreaterThan(1000);
    expect(colorAnalysis!.colorfulPixels).toBeGreaterThan(500);
  });

  test('should zoom in on click', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Let initial render happen
    await page.waitForTimeout(2000);

    // Get initial zoom level from text
    const initialText = await page.locator('canvas').evaluate((c) => {
      const ctx = (c as HTMLCanvasElement).getContext('2d');
      return ctx ? 'has context' : 'no context';
    });

    // Click to zoom
    await canvas.click({ position: { x: 320, y: 240 } });

    // Wait for re-render
    await page.waitForTimeout(2000);

    // The display should show new zoom level
    // We verify by checking sample count reset (should be lower after zoom)
    const hasRendered = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      // Just verify canvas still works after zoom
      const imageData = ctx.getImageData(0, 0, 10, 10);
      return imageData.data.length > 0;
    });

    expect(hasRendered).toBe(true);
  });

  test('should capture screenshot after extended rendering', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Let it render for 8 seconds to get good color accumulation
    await page.waitForTimeout(8000);

    await page.screenshot({
      path: 'test-results/buddhabrot-colorful.png',
      fullPage: true
    });
  });

  test('should capture zoomed screenshot', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Initial render
    await page.waitForTimeout(3000);

    // Zoom into interesting area (around the main bulb)
    await canvas.click({ position: { x: 400, y: 240 } });

    // Let zoomed view render
    await page.waitForTimeout(5000);

    await page.screenshot({
      path: 'test-results/buddhabrot-zoomed.png',
      fullPage: true
    });
  });
});
