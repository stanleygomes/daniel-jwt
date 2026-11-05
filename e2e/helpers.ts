import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';

export const fixture = (name: string): string =>
  readFileSync(new URL(`../test/fixtures/${name}`, import.meta.url), 'utf8');

export async function openApp(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('#d-status')).toHaveText('Assinatura válida.');
}

export async function decodeWith(page: Page, token: string, key: string): Promise<void> {
  await page.getByRole('tab', { name: 'Decifrar' }).click();
  await page.locator('#d-token').fill(token);
  await page.locator('#d-key').fill(key);
}

export async function encodeWith(page: Page, header: object, key?: string): Promise<void> {
  await page.getByRole('tab', { name: 'Selar' }).click();
  await page.locator('#e-header').fill(JSON.stringify(header));
  if (key !== undefined) await page.locator('#e-key').fill(key);
}

export const status = (page: Page) => page.locator('#d-status');
export const encodedToken = async (page: Page): Promise<string> =>
  (await page.locator('#e-token').textContent()) ?? '';
