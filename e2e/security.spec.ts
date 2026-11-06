import { expect, test } from '@playwright/test';
import { encodeWith, openApp } from './helpers.ts';

test('a CSP de produção está no ar', async ({ page }) => {
  const response = await page.goto('/');
  const csp = response?.headers()['content-security-policy'] ?? '';
  expect(csp).toContain("connect-src 'none'");
  expect(csp).toContain("default-src 'none'");
  expect(csp).toContain("require-trusted-types-for 'script'");
  expect(response?.headers()['referrer-policy']).toBe('no-referrer');
});

test('nenhuma requisição sai do site, mesmo usando tudo', async ({ page, baseURL }) => {
  const outside: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith(baseURL ?? '')) outside.push(request.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await openApp(page);
  await page.locator('#d-key').fill('outro segredo');
  await encodeWith(page, { alg: 'ES256' });
  await page.locator('#e-generate').click();
  await expect(page.locator('#e-public')).not.toBeEmpty();
  await page.locator('#theme').click();

  expect(outside).toEqual([]);
  expect(errors).toEqual([]);
  await expect(page.locator('#t-requests')).toHaveText('0');
  await expect(page.locator('#t-blocked')).toHaveText('0');
});

test('a CSP barra envio para fora e o painel conta', async ({ page }) => {
  await openApp(page);
  const sent = await page.evaluate(() =>
    fetch('https://example.com/roubo').then(
      () => true,
      () => false,
    ),
  );
  expect(sent).toBe(false);
  await expect(page.locator('#t-blocked')).toHaveText('1');
});

test('Trusted Types barra innerHTML', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Trusted Types só existe no Chromium');
  await openApp(page);
  const blocked = await page.evaluate(() => {
    try {
      document.body.insertAdjacentHTML('beforeend', '<img src=x>');
      return false;
    } catch {
      return true;
    }
  });
  expect(blocked).toBe(true);
});

test('token e chave não ficam gravados nem na URL', async ({ page }) => {
  await openApp(page);
  const secret = 'segredo-que-nao-pode-vazar';
  await page.locator('#d-key').fill(secret);
  await page.getByRole('tab', { name: 'Selar' }).click();
  await page.locator('#e-key').fill(secret);
  const token = await page.locator('#d-token').inputValue();
  const saved = await page.evaluate(() =>
    [location.href, document.cookie, JSON.stringify(localStorage), JSON.stringify(sessionStorage)].join(' '),
  );
  expect(saved).not.toContain(secret);
  expect(saved).not.toContain(token.split('.')[2]);
});
