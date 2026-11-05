import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALGS, algorithm, isHmac } from '../src/jwt/algorithms.ts';
import { keyLabel } from '../src/ui/keyLabel.ts';

test('cobre os 14 algs do JWS', () => {
  const expected = ['HS', 'RS', 'PS', 'ES'].flatMap((family) =>
    [256, 384, 512].map((bits) => `${family}${bits}`),
  );
  assert.deepEqual(Object.keys(ALGS).sort(), [...expected, 'EdDSA', 'Ed25519'].sort());
});

test('ES512 usa a curva P-521 e PS usa salt do tamanho do hash', () => {
  assert.equal(ALGS.ES512.namedCurve, 'P-521');
  assert.equal(ALGS.PS384.saltLength, 48);
});

test('isHmac e alg desconhecido', () => {
  assert.equal(isHmac('HS256'), true);
  assert.equal(isHmac('RS256'), false);
  assert.equal(isHmac(undefined), false);
  assert.throws(() => algorithm('none'), /não suportado: none/);
});

test('rótulo do campo de chave', () => {
  assert.equal(keyLabel('HS256', 'verify'), 'Segredo');
  assert.match(keyLabel('RS256', 'verify'), /pública.*JWKS/);
  assert.match(keyLabel('ES256', 'sign'), /privada/);
});
