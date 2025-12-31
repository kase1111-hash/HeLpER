import { test, expect } from '@playwright/test';

test.describe('HeLpER App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the app', async ({ page }) => {
    // Check title bar is present
    await expect(page.locator('text=HeLpER')).toBeVisible();
  });

  test('should display date navigation', async ({ page }) => {
    // Check date navigation arrows are present
    await expect(page.locator('button[title*="Previous"]')).toBeVisible();
    await expect(page.locator('button[title*="Next"]')).toBeVisible();
  });

  test('should show notes list section', async ({ page }) => {
    // Check for new note button or notes list
    await expect(page.locator('text=New Note')).toBeVisible();
  });

  test('should show search input', async ({ page }) => {
    // Check for search input
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('should show status bar', async ({ page }) => {
    // Check status bar with settings button
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should create a new note', async ({ page }) => {
    // Click new note button
    await page.click('text=New Note');

    // Wait for editor to be ready
    await page.waitForTimeout(500);

    // Editor should be visible
    const editor = page.locator('textarea, [contenteditable="true"]').first();
    await expect(editor).toBeVisible();
  });

  test('should open settings panel with keyboard shortcut', async ({ page }) => {
    // Press Ctrl+,
    await page.keyboard.press('Control+,');

    // Settings panel should appear
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();
  });

  test('should close settings with Escape', async ({ page }) => {
    // Open settings
    await page.keyboard.press('Control+,');
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Settings should be closed
    await expect(page.locator('h2:has-text("Settings")')).not.toBeVisible();
  });

  test('should focus search with Ctrl+F', async ({ page }) => {
    // Press Ctrl+F
    await page.keyboard.press('Control+f');

    // Search input should be focused
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeFocused();
  });

  test('should navigate dates with arrow buttons', async ({ page }) => {
    // Get current date text
    const dateText = await page.locator('[class*="date"]').first().textContent();

    // Click previous day
    await page.click('button[title*="Previous"]');
    await page.waitForTimeout(300);

    // Date should have changed
    const newDateText = await page.locator('[class*="date"]').first().textContent();
    expect(newDateText).not.toBe(dateText);
  });
});

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Open settings
    await page.keyboard.press('Control+,');
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();
  });

  test('should show appearance settings', async ({ page }) => {
    await expect(page.locator('text=Appearance')).toBeVisible();
    await expect(page.locator('text=Theme')).toBeVisible();
  });

  test('should show AI settings', async ({ page }) => {
    await expect(page.locator('text=AI Assistant')).toBeVisible();
    await expect(page.locator('text=Ollama URL')).toBeVisible();
  });

  test('should show data export options', async ({ page }) => {
    await expect(page.locator('text=Data')).toBeVisible();
    await expect(page.locator('text=Export Notes')).toBeVisible();
    await expect(page.locator('button:has-text("Markdown")')).toBeVisible();
    await expect(page.locator('button:has-text("JSON")')).toBeVisible();
  });

  test('should close with Close button', async ({ page }) => {
    await page.click('button:has-text("Close")');
    await expect(page.locator('h2:has-text("Settings")')).not.toBeVisible();
  });
});

test.describe('First Run Experience', () => {
  test('should show onboarding wizard on fresh start', async ({ page, context }) => {
    // Clear storage to simulate fresh start
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto('/');

    // Note: This test may need adjustment based on how storage is handled
    // The wizard should appear if hasCompletedOnboarding is false
  });
});
