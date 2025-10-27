
import { test, expect } from '@playwright/test';

test('verifies the 3D models are rendered correctly', async ({ page }) => {
  await page.goto('http://localhost:3002');

  // Check that the canvas element is visible
  await expect(page.locator('canvas')).toBeVisible();

  // Take a screenshot to visually confirm the model is rendered
  await page.screenshot({ path: 'jules-scratch/verification/model-rendered.png' });
});
