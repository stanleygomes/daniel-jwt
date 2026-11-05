import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateKey } from '../src/jwt/generate.ts';
import { sign, verify } from '../src/jwt/token.ts';

for (const alg of ['HS256', 'HS512', 'RS256', 'PS512', 'ES256', 'ES512', 'EdDSA']) {
  test(`${alg}: chave gerada assina e verifica`, async () => {
    const { privateKey, publicKey } = await generateKey(alg);
    const token = await sign({ alg }, { sub: 'daniel' }, privateKey);
    assert.equal(await verify(token, publicKey ?? privateKey), true);
  });
}

test('segredo HMAC tem o tamanho do hash', async () => {
  const { privateKey, publicKey } = await generateKey('HS384');
  assert.equal(privateKey.length, 64); // 48 bytes em base64url
  assert.equal(publicKey, undefined);
});

test('alg desconhecido dá erro', async () => {
  await assert.rejects(generateKey('XX1'), /não suportado/);
});
