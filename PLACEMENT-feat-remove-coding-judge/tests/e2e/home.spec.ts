import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/StudyBench/);
});

test('navigation works', async ({ page }) => {
  await page.goto('/');

  // Click the "Sign in" button.
  await page.getByRole('link', { name: 'Sign in' }).click();

  // Expects page to have a heading with the name of Login.
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});
