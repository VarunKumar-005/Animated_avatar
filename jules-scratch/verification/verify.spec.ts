
import { test, expect } from '@playwright/test';

test('renders the character selection page and switches characters', async ({ page }) => {
  await page.goto('http://localhost:3003');

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Check for the heading
  await expect(page.locator('.character-details-name')).toHaveText('Catherine Mercy');

  // Click the second character
  await page.click('button:has-text("Omen")');

  // Check that the heading has changed
  await expect(page.locator('.character-details-name')).toHaveText('Omen');

  // Take a screenshot
  await page.screenshot({ path: 'jules-scratch/verification/verification.png' });
});
