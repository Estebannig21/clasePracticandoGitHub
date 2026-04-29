import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/');
  await page.getByText('Nueva conversación').first().click();
  await page.getByText('Nueva conversación').nth(1).click();
});