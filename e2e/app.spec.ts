import { test, expect, type Page } from '@playwright/test';

/**
 * Settings live in the Tauri store, which does not exist in a plain browser, so every page load
 * is a "first run" and the onboarding wizard covers the app. Click through it like a user would.
 */
async function completeOnboarding(page: Page) {
  await expect(page.getByRole('heading', { name: 'Welcome to HeLpER' })).toBeVisible();
  const startWriting = page.getByRole('button', { name: 'Start Writing' });
  while (!(await startWriting.isVisible())) {
    await page.getByRole('button', { name: /^(Next|Skip)$/ }).click();
  }
  await startWriting.click();
  await expect(page.getByRole('heading', { name: 'Welcome to HeLpER' })).not.toBeVisible();
}

/**
 * Stub the Tauri IPC layer so flows that need a backend (saving a note) can run in a browser.
 * `create_note`/`update_note` echo the note back; every other command rejects, as it would
 * without Tauri. All command names are recorded on `window.__ipcCalls`.
 */
async function mockTauriBackend(page: Page) {
  await page.addInitScript(() => {
    const calls: string[] = [];
    (window as unknown as { __ipcCalls: string[] }).__ipcCalls = calls;
    (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
      transformCallback: () => 0,
      invoke: async (command: string, args: { note?: unknown }) => {
        calls.push(command);
        if (command === 'create_note' || command === 'update_note') return args.note;
        throw new Error(`not mocked: ${command}`);
      },
    };
  });
}

function ipcCalls(page: Page, command: string): Promise<number> {
  return page.evaluate(
    (name) => (window as unknown as { __ipcCalls: string[] }).__ipcCalls.filter((c) => c === name).length,
    command
  );
}

test.describe('HeLpER App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await completeOnboarding(page);
  });

  test('should load the app', async ({ page }) => {
    // Check title bar is present
    await expect(page.getByText('HeLpER', { exact: true })).toBeVisible();
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

test.describe('Notes (stubbed Tauri backend)', () => {
  test.beforeEach(async ({ page }) => {
    await mockTauriBackend(page);
    await page.goto('/');
    await completeOnboarding(page);
  });

  test('should create a new note and let the user write in it', async ({ page }) => {
    const editor = page.getByPlaceholder('Start writing your thoughts...');

    // Onboarding saved the welcome note and selected it
    await expect(editor).toHaveValue(/Welcome/);
    expect(await ipcCalls(page, 'create_note')).toBe(1);

    await page.click('text=New Note');

    // A second note was persisted and is now selected, with an empty editor
    await expect(editor).toHaveValue('');
    expect(await ipcCalls(page, 'create_note')).toBe(2);

    // Typing must stick (a two-way binding once reset the textarea on every keystroke)...
    await editor.click();
    await page.keyboard.type('Dear diary, today went well.');
    await expect(editor).toHaveValue('Dear diary, today went well.');

    // ...and be auto-saved
    await expect.poll(() => ipcCalls(page, 'update_note')).toBeGreaterThan(0);
    await expect(editor).toHaveValue('Dear diary, today went well.');
  });
});

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await completeOnboarding(page);
    // Open settings
    await page.keyboard.press('Control+,');
    await expect(page.locator('h2:has-text("Settings")')).toBeVisible();
  });

  test('should show appearance settings', async ({ page }) => {
    await expect(page.locator('text=Appearance')).toBeVisible();
    await expect(page.locator('text=Theme')).toBeVisible();
  });

  test('should show AI settings', async ({ page }) => {
    await expect(page.locator('h3', { hasText: 'AI Assistant' })).toBeVisible();
    await expect(page.locator('text=Ollama URL')).toBeVisible();
  });

  test('should show data export options', async ({ page }) => {
    await expect(page.locator('h3', { hasText: /^Data$/ })).toBeVisible();
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
  test('should show onboarding wizard on fresh start', async ({ page }) => {
    // Each Playwright test gets a fresh browser context, so this is always a first run
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Welcome to HeLpER' })).toBeVisible();
    await expect(page.getByText('1 of ')).toBeVisible();
  });

  test('should dismiss the wizard after completing it', async ({ page }) => {
    await page.goto('/');
    await completeOnboarding(page);

    await expect(page.locator('text=New Note')).toBeVisible();
  });
});
