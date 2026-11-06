import { expect, test } from '@playwright/test';
import { decode, verify } from '../src/jwt/token.ts';
import { encodedToken, encodeWith, openApp } from './helpers.ts';

test.beforeEach(async ({ page }) => openApp(page));

test('editar o conteúdo gera o token na hora', async ({ page }) => {
  await encodeWith(page, { alg: 'HS256' }, 'segredo');
  await page.locator('#e-payload').fill('{"sub":"daniel"}');
  await expect(page.locator('#e-token')).toContainText('.');
  const token = await encodedToken(page);
  expect(decode(token).payload).toEqual({ sub: 'daniel' });
  expect(await verify(token, 'segredo')).toBe(true);
});

test('JSON inválido mostra o erro e não gera token', async ({ page }) => {
  await encodeWith(page, { alg: 'HS256' });
  await page.locator('#e-payload').fill('{ quebrado');
  await expect(page.locator('#e-error')).toHaveText('O conteúdo não é um JSON válido.');
  await expect(page.locator('#e-token')).toBeEmpty();
});

for (const alg of ['HS512', 'RS256', 'PS384', 'ES256', 'ES512', 'EdDSA']) {
  test(`gerar chave ${alg}: o token sai assinado e verifica`, async ({ page }) => {
    await encodeWith(page, { alg, typ: 'JWT' });
    await page.locator('#e-generate').click();
    await expect(page.locator('#e-key')).not.toHaveValue('');
    await expect(page.locator('#e-error')).toBeEmpty();
    const token = await encodedToken(page);
    const hmac = alg.startsWith('HS');
    await expect(page.locator('#e-public-box')).toBeVisible({ visible: !hmac });
    const key = hmac
      ? await page.locator('#e-key').inputValue()
      : await page.locator('#e-public').inputValue();
    expect(await verify(token, key)).toBe(true);
  });
}

test('copiar põe o token na área de transferência', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'permissão de clipboard só no Chromium');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('tab', { name: 'Selar' }).click();
  await page.locator('#e-copy').click();
  await expect(page.locator('#e-copy')).toHaveText('Copiado');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await encodedToken(page));
  await expect(page.locator('#e-copy')).toHaveText('Copiar');
});

for (const alg of ['HS384', 'RS512', 'ES384', 'EdDSA']) {
  test(`seletor ${alg}: troca o cabeçalho, forja a chave e o "Decifrar este" valida`, async ({ page }) => {
    await page.getByRole('tab', { name: 'Selar' }).click();
    await page.locator('#e-alg').selectOption(alg);
    await expect(page.locator('#e-header')).toHaveValue(new RegExp(`"alg": "${alg}"`));
    await expect.poll(async () => decode(await encodedToken(page)).header.alg).toBe(alg);
    await expect(page.locator('#e-public-box')).toBeVisible({ visible: !alg.startsWith('HS') });
    await page.locator('#e-decode').click();
    await expect(page.locator('#decode')).toBeVisible();
    await expect(page.locator('#d-status')).toHaveText('Assinatura válida.');
  });
}

test('seletor acompanha o alg digitado no cabeçalho', async ({ page }) => {
  await encodeWith(page, { alg: 'PS256' });
  await expect(page.locator('#e-alg')).toHaveValue('PS256');
  await encodeWith(page, { alg: 'XYZ' });
  await expect(page.locator('#e-alg')).toHaveValue('');
});
