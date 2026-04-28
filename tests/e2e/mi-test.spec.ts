import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:8000/');
  await page.waitForTimeout(4000);
  await page.getByRole('button', { name: '+ Nueva' }).click();
  await page.getByText('Nueva conversación').last().click();
  await page.getByRole('textbox', { name: 'Escribe un mensaje...' }).click();
  await page.getByRole('textbox', { name: 'Escribe un mensaje...' }).fill('dime exactamente quehubo');
  await page.getByRole('textbox', { name: 'Escribe un mensaje...' }).press('Enter');
  await page.waitForTimeout(4000);
  await expect(page.locator('#chat')).toContainText('hola');
  await page.getByRole('textbox', { name: 'Escribe un mensaje...' }).press('Enter');
  await page.waitForTimeout(4000);
});