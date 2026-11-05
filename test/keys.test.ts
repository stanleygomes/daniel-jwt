import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { b64urlEncode } from '../src/jwt/base64url.ts';
import { sign, verify } from '../src/jwt/token.ts';

// Chaves e certificados reais, gerados pelo openssl (ver test/fixtures/README.md).
const fixture = (name: string): string => readFileSync(new URL(`fixtures/${name}`, import.meta.url), 'utf8');

const payload = { sub: 'daniel' };

test('RSA PKCS#1: assina com a privada e verifica com a pública PKCS#1', async () => {
  const token = await sign({ alg: 'RS256' }, payload, fixture('rsa-pkcs1.pem'));
  assert.equal(await verify(token, fixture('rsa-pkcs1-pub.pem')), true);
});

test('certificado X.509 verifica (RSA e EC)', async () => {
  const rsa = await sign({ alg: 'RS256' }, payload, fixture('rsa-pkcs1.pem'));
  assert.equal(await verify(rsa, fixture('rsa-cert.pem')), true);
  const ec = await sign({ alg: 'ES256' }, payload, fixture('ec-sec1.pem'));
  assert.equal(await verify(ec, fixture('ec-cert.pem')), true);
});

test('EC SEC1 com e sem o bloco EC PARAMETERS', async () => {
  const p256 = await sign({ alg: 'ES256' }, payload, fixture('ec-sec1.pem'));
  assert.equal(await verify(p256, fixture('ec-cert.pem')), true);
  const p384 = await sign({ alg: 'ES384' }, payload, fixture('ec384-sec1.pem'));
  assert.equal(await verify(p384, fixture('ec384-sec1.pem')), true);
});

test('verifica com a chave privada (deriva a pública)', async () => {
  const token = await sign({ alg: 'RS256' }, payload, fixture('rsa-pkcs1.pem'));
  assert.equal(await verify(token, fixture('rsa-pkcs1.pem')), true);
});

test('chave errada reprova', async () => {
  const token = await sign({ alg: 'ES256' }, payload, fixture('ec-sec1.pem'));
  await assert.rejects(verify(token, fixture('rsa-cert.pem')), /não serve para ES256/);
});

test('chave privada com senha dá erro claro', async () => {
  const pem = '-----BEGIN ENCRYPTED PRIVATE KEY-----\nAAAA\n-----END ENCRYPTED PRIVATE KEY-----';
  await assert.rejects(sign({ alg: 'RS256' }, payload, pem), /com senha/);
});

test('JWKS: escolhe a chave pelo kid do token', async () => {
  const pairs = await Promise.all(
    ['a', 'b'].map(() =>
      crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']),
    ),
  );
  const keys = await Promise.all(
    pairs.map(async (pair, i) => ({
      ...(await crypto.subtle.exportKey('jwk', pair.publicKey)),
      kid: `k${i}`,
    })),
  );
  const jwks = JSON.stringify({ keys });
  const privateJwk = JSON.stringify(await crypto.subtle.exportKey('jwk', pairs[1].privateKey));

  const token = await sign({ alg: 'ES256', kid: 'k1' }, payload, privateJwk);
  assert.equal(await verify(token, jwks), true);

  const wrongKid = await sign({ alg: 'ES256', kid: 'k0' }, payload, privateJwk);
  assert.equal(await verify(wrongKid, jwks), false);

  const noKid = await sign({ alg: 'ES256' }, payload, privateJwk);
  await assert.rejects(verify(noKid, jwks), /não tem kid/);
  const missing = await sign({ alg: 'ES256', kid: 'zz' }, payload, privateJwk);
  await assert.rejects(verify(missing, jwks), /kid "zz"/);
});

test('segredo HMAC em base64', async () => {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  const standard = btoa(String.fromCharCode(...raw));
  const token = await sign({ alg: 'HS256' }, payload, standard, { base64Secret: true });
  assert.equal(await verify(token, b64urlEncode(raw.buffer), { base64Secret: true }), true);
  assert.equal(await verify(token, standard), false);
  await assert.rejects(verify(token, '***', { base64Secret: true }), /base64 válido/);
});
