
import { test, expect } from '@playwright/test';

test('renders the landing page with 3D models', async ({ page }) => {
  const consoleLogs: string[] = [];
  page.on('console', (msg) => consoleLogs.push(msg.text()));

  await page.goto('http://localhost:3003');

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Check for the heading
  await expect(page.locator('h1')).toHaveText('Discover the Ultimate Learning Avatars');

  // Take a screenshot
  await page.screenshot({ path: 'jules-scratch/verification/verification.png', fullPage: true });

  // Check for any console errors
  const errors = consoleLogs.filter((log) => log.toLowerCase().includes('error'));
  expect(errors.length).toBe(0);
});
