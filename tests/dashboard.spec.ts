import { test, expect } from '@playwright/test';

test.describe('Dashboard UI', () => {
  // Use a simulated logged in state for testing the dashboard UI.
  // Playwright tests usually involve authenticating first, so we'll simulate a login.
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'sales.manager@dealflow360.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign in →")');
    // Wait for navigation to /app
    await page.waitForURL('/app');
  });

  test('should render dashboard layout and home page correctly', async ({ page }) => {
    // Check Sidebar
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('text=SALES')).toBeVisible();
    await expect(page.locator('text=RISK & APPROVALS')).toBeVisible();

    // Check Topnav
    await expect(page.locator('input[placeholder="Search quotes, customers, products, or anything..."]')).toBeVisible();

    // Check Home Page Content
    await expect(page.locator('text=Hello,')).toBeVisible();
    await expect(page.locator('button:has-text("New Quotation")')).toBeVisible();

    // Check KPI Cards
    await expect(page.locator('text=Total Quotations')).toBeVisible();
    await expect(page.locator('text=Estimated Revenue')).toBeVisible();
    await expect(page.locator('text=High Risk Deals')).toBeVisible();
    await expect(page.locator('text=Pending Approvals').first()).toBeVisible();
    await expect(page.locator('text=Orders in Fulfillment')).toBeVisible();

    // Check Charts Titles
    await expect(page.locator('h3:has-text("Deal Pipeline")')).toBeVisible();
    await expect(page.locator('h3:has-text("Revenue Forecast")')).toBeVisible();
    await expect(page.locator('h3:has-text("Risk Distribution")')).toBeVisible();

    // Check Tables Titles
    await expect(page.locator('h3:has-text("Recent Quotations")')).toBeVisible();
    await expect(page.locator('h3:has-text("Pending Approvals")')).toBeVisible();

    // Check Insights Banner
    await expect(page.locator('text=Turn more quotes into revenue')).toBeVisible();
  });
});
