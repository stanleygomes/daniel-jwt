import assert from 'node:assert/strict';
import { test } from 'node:test';
import { b64urlEncode } from '../src/jwt/base64url.ts';
import { decode, sign, verify } from '../src/jwt/token.ts';

// Token de exemplo clássico, assinado com HS256 e o segredo abaixo.
const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const SAMPLE_SECRET = 'your-256-bit-secret';

const toPem = (label: string, der: ArrayBuffer): string =>
  `-----BEGIN ${label} KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(der)))}\n-----END ${label} KEY-----`;

const ASYMMETRIC: Record<string, RsaHashedKeyGenParams | EcKeyGenParams | Algorithm> = {
  RS256: { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  PS384: { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-384' },
  ES256: { name: 'ECDSA', namedCurve: 'P-256' },
  ES512: { name: 'ECDSA', namedCurve: 'P-521' },
  EdDSA: { name: 'Ed25519' },
};

test('decodifica cabeçalho e conteúdo', () => {
  const { header, payload } = decode(SAMPLE);
  assert.deepEqual(header, { alg: 'HS256', typ: 'JWT' });
  assert.equal(payload.name, 'John Doe');
});

test('recusa token malformado', () => {
  assert.throws(() => decode('abc'), /3 partes/);
  assert.throws(() => decode('a.b.c'), /cabeçalho/);
});

test('HS256: verifica o exemplo e recusa segredo errado', async () => {
  assert.equal(await verify(SAMPLE, SAMPLE_SECRET), true);
  assert.equal(await verify(SAMPLE, 'outro'), false);
});

test('HS256: assina igual ao exemplo', async () => {
  const token = await sign({ alg: 'HS256', typ: 'JWT' }, decode(SAMPLE).payload, SAMPLE_SECRET);
  assert.equal(token, SAMPLE);
});

test('conteúdo adulterado reprova', async () => {
  const [header, , signature] = SAMPLE.split('.');
  const forged = `${header}.${b64urlEncode('{"name":"Daniel"}')}.${signature}`;
  assert.equal(await verify(forged, SAMPLE_SECRET), false);
});

test('alg none nunca é válido', async () => {
  const token = await sign({ alg: 'none' }, { sub: '1' });
  assert.equal(await verify(token, 'qualquer'), false);
});

for (const [alg, params] of Object.entries(ASYMMETRIC)) {
  test(`${alg}: assina com PEM privada e verifica com PEM e JWK públicas`, async () => {
    const pair = (await crypto.subtle.generateKey(params, true, ['sign', 'verify'])) as CryptoKeyPair;
    const privatePem = toPem('PRIVATE', await crypto.subtle.exportKey('pkcs8', pair.privateKey));
    const publicPem = toPem('PUBLIC', await crypto.subtle.exportKey('spki', pair.publicKey));
    const publicJwk = JSON.stringify(await crypto.subtle.exportKey('jwk', pair.publicKey));

    const token = await sign({ alg, typ: 'JWT' }, { sub: 'daniel' }, privatePem);
    assert.equal(await verify(token, publicPem), true);
    assert.equal(await verify(token, publicJwk), true);
  });
}

test('chave privada em JWK também verifica', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const privateJwk = JSON.stringify(await crypto.subtle.exportKey('jwk', pair.privateKey));
  const token = await sign({ alg: 'ES256' }, { sub: 'x' }, privateJwk);
  assert.equal(await verify(token, privateJwk), true);
});

test('PEM PKCS#1 dá erro claro', async () => {
  const pem = '-----BEGIN RSA PUBLIC KEY-----\nAAAA\n-----END RSA PUBLIC KEY-----';
  const token = `${b64urlEncode('{"alg":"RS256"}')}.e30.AAAA`;
  await assert.rejects(verify(token, pem), /PKCS#1/);
});
