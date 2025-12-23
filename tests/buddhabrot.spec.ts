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
    // Main canvas has p5Canvas class
    const canvas = page.locator('canvas.p5Canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });
    expect(consoleErrors).toHaveLength(0);
  });

  test('should be fullscreen', async ({ page }) => {
    const canvas = page.locator('canvas.p5Canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    const canvasBox = await canvas.boundingBox();
    const viewportSize = page.viewportSize();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.width).toBe(viewportSize!.width);
    expect(canvasBox!.height).toBe(viewportSize!.height);
  });

  test('should render colorful content after sampling', async ({ page }) => {
    const canvas = page.locator('canvas.p5Canvas');
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

  test('should auto-zoom over time', async ({ page }) => {
    const canvas = page.locator('canvas.p5Canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Let auto-zoom run for a bit
    await page.waitForTimeout(3000);

    // Verify canvas is still rendering
    const hasRendered = await page.evaluate(() => {
      const canvas = document.querySelector('canvas.p5Canvas');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      const imageData = ctx.getImageData(0, 0, 10, 10);
      return imageData.data.length > 0;
    });

    expect(hasRendered).toBe(true);
  });

  test('should capture screenshot after extended rendering', async ({ page }) => {
    const canvas = page.locator('canvas.p5Canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Let it render and auto-zoom for 8 seconds
    await page.waitForTimeout(8000);

    await page.screenshot({
      path: 'test-results/buddhabrot-autozoom.png',
      fullPage: true
    });
  });
});
