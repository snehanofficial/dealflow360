import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = '/home/snehan/.gemini/antigravity-ide/brain/de89321e-9166-4f68-a589-856acf61f682/scratch/screenshots';

test('Visual Audit for Warehouse, Inventory, Kanban, and Backorders', async ({ page }) => {
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  const pageErrors: string[] = [];
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  console.log('1. Navigating to login page http://localhost:5173...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_page.png') });

  console.log('Filling login form with seed credentials...');
  await page.fill('input[type="email"]', 'sales.rep@dealflow360.com');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_dashboard.png') });

  // Module 1: Warehouse Management (/warehouses)
  console.log('2. Auditing Warehouse Master Setup (/warehouses)...');
  await page.goto('http://localhost:5173/warehouses', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_warehouses_setup.png'), fullPage: true });

  const breakdownBtn = page.locator('button:has-text("Breakdown")').first();
  if (await breakdownBtn.isVisible()) {
    console.log('Expanding warehouse stock breakdown drawer...');
    await breakdownBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03b_warehouse_breakdown_expanded.png') });
  }

  // Module 2: Inventory Dashboard (/inventory)
  console.log('3. Auditing Inventory Stock Ledger (/inventory)...');
  await page.goto('http://localhost:5173/inventory', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_inventory_dashboard.png'), fullPage: true });

  const adjustStockBtn = page.locator('button:has-text("Stock Receipt"), button:has-text("Adjust Stock")').first();
  if (await adjustStockBtn.isVisible()) {
    console.log('Opening Adjust Stock modal...');
    await adjustStockBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04b_inventory_adjust_modal.png') });
    const closeBtn = page.locator('button:has-text("✕"), button:has-text("Cancel")').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
  }

  // Module 3: Warehouse Kanban (/warehouse)
  console.log('4. Auditing Warehouse Fulfillment Kanban (/warehouse)...');
  await page.goto('http://localhost:5173/warehouse', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_warehouse_kanban.png'), fullPage: true });

  const manageAllocBtn = page.locator('button:has-text("Manage Allocation")').first();
  if (await manageAllocBtn.isVisible()) {
    console.log('Opening Manage Allocation modal...');
    await manageAllocBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05b_allocation_modal.png'), fullPage: true });
    const closeBtn = page.locator('button:has-text("✕"), button:has-text("Cancel")').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
  }

  // Module 4: Backorders Queue (/backorders)
  console.log('5. Auditing Backorders Queue (/backorders)...');
  await page.goto('http://localhost:5173/backorders', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_backorders_page.png'), fullPage: true });

  console.log('\n--- VISUAL AUDIT RESULTS ---');
  console.log(`Console Warning/Error logs count: ${consoleLogs.length}`);
  consoleLogs.forEach((log) => console.log(' ', log));
  console.log(`Page JS Errors count: ${pageErrors.length}`);
  pageErrors.forEach((err) => console.log(' ', err));
  console.log('Screenshots saved to:', SCREENSHOT_DIR);
});
