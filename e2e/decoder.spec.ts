import { expect, test } from '@playwright/test';
import { b64urlEncode } from '../src/jwt/base64url.ts';
import { sign } from '../src/jwt/token.ts';
import { decodeWith, fixture, openApp, status } from './helpers.ts';

const payload = { sub: 'daniel', iat: 1516239022 };

test.beforeEach(async ({ page }) => openApp(page));

test('o exemplo abre decifrado, com as claims legíveis', async ({ page }) => {
  await expect(page.locator('#d-header')).toContainText('"alg": "HS256"');
  await expect(page.locator('#d-payload')).toContainText('"name": "Belsazar"');
  await expect(page.locator('#d-claims')).toContainText('sub · Assunto');
  await expect(page.locator('#d-claims')).toContainText('17/01/2018');
});

test('segredo errado reprova', async ({ page }) => {
  await page.locator('#d-key').fill('outro');
  await expect(status(page)).toHaveText('Tequel: pesado na balança e achado em falta.');
  await expect(status(page)).toHaveClass(/bad/);
});

test('token malformado mostra o erro e limpa os painéis', async ({ page }) => {
  await page.locator('#d-token').fill('isso.nao');
  await expect(page.locator('#d-error')).toContainText('3 partes');
  await expect(page.locator('#d-header')).toBeEmpty();
});

test('alg none é sempre reprovado', async ({ page }) => {
  const token = await sign({ alg: 'none' }, payload);
  await decodeWith(page, token, 'qualquer');
  await expect(status(page)).toContainText('alg "none"');
});

test('exp vencido aparece marcado', async ({ page }) => {
  const token = await sign({ alg: 'HS256' }, { exp: 1000 }, 's');
  await decodeWith(page, token, 's');
  await expect(page.locator('#d-claims')).toContainText('(expirado)');
});

const formats = [
  {
    name: 'RSA PKCS#1 + chave pública PKCS#1',
    alg: 'RS256',
    privateKey: 'rsa-pkcs1.pem',
    key: 'rsa-pkcs1-pub.pem',
  },
  { name: 'RSA + certificado X.509', alg: 'RS256', privateKey: 'rsa-pkcs1.pem', key: 'rsa-cert.pem' },
  { name: 'EC SEC1 + certificado X.509', alg: 'ES256', privateKey: 'ec-sec1.pem', key: 'ec-cert.pem' },
  {
    name: 'EC SEC1 P-384, verificando com a privada',
    alg: 'ES384',
    privateKey: 'ec384-sec1.pem',
    key: 'ec384-sec1.pem',
  },
];
for (const { name, alg, privateKey, key } of formats) {
  test(`chave: ${name}`, async ({ page }) => {
    const token = await sign({ alg }, payload, fixture(privateKey));
    await decodeWith(page, token, fixture(key));
    await expect(status(page)).toHaveText('Assinatura válida.');
  });
}

test('JWKS colado escolhe a chave pelo kid', async ({ page }) => {
  const pairs = await Promise.all(
    [0, 1].map(() =>
      crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']),
    ),
  );
  const keys = await Promise.all(
    pairs.map(async (pair, i) => ({
      ...(await crypto.subtle.exportKey('jwk', pair.publicKey)),
      kid: `k${i}`,
    })),
  );
  const privateJwk = JSON.stringify(await crypto.subtle.exportKey('jwk', pairs[1].privateKey));
  const token = await sign({ alg: 'ES256', kid: 'k1' }, payload, privateJwk);
  await decodeWith(page, token, JSON.stringify({ keys }));
  await expect(status(page)).toHaveText('Assinatura válida.');
});

test('segredo em base64: a caixa só aparece no HMAC e muda o veredito', async ({ page }) => {
  const secret = b64urlEncode('segredo');
  const token = await sign({ alg: 'HS256' }, payload, secret, { base64Secret: true });
  await decodeWith(page, token, secret);
  await expect(page.locator('#d-b64-box')).toBeVisible();
  await expect(status(page)).toHaveClass(/bad/);
  await page.locator('#d-b64').check();
  await expect(status(page)).toHaveText('Assinatura válida.');

  const rsa = await sign({ alg: 'RS256' }, payload, fixture('rsa-pkcs1.pem'));
  await decodeWith(page, rsa, fixture('rsa-cert.pem'));
  await expect(page.locator('#d-b64-box')).toBeHidden();
});
