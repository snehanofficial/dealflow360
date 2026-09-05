import { test, expect } from '@playwright/test';

test.describe('Login Page UI', () => {
  test('should render split-screen layout correctly', async ({ page }) => {
    await page.goto('/login');

    // Check for left panel content
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in →")')).toBeVisible();
    
    // Check for SSO options
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
    await expect(page.locator('button:has-text("Microsoft")')).toBeVisible();
    await expect(page.locator('button:has-text("SSO")')).toBeVisible();

    // Check for right panel hero content (only visible on large screens, but locator still works)
    await expect(page.locator('text=Higher deals.')).toBeVisible();
    await expect(page.locator('text=Smart Quoting')).toBeVisible();
    await expect(page.locator('text=Explainable Risk')).toBeVisible();
    await expect(page.locator('text=Automated Approvals')).toBeVisible();
    await expect(page.locator('text=End-to-End Fulfillment')).toBeVisible();
  });
});
