import assert from 'node:assert/strict';
import { test } from 'node:test';
import { describeClaims, lifeLeft } from '../src/ui/claims.ts';

const NOW = 1_700_000_000;

test('mostra só as claims registradas', () => {
  const claims = describeClaims({ sub: 'daniel', name: 'ignorado', aud: ['a', 'b'] }, NOW);
  assert.deepEqual(claims, [
    { label: 'sub · Assunto', text: 'daniel' },
    { label: 'aud · Audiência', text: '["a","b"]' },
  ]);
});

test('marca exp vencido e nbf futuro', () => {
  const [exp, nbf] = describeClaims({ exp: NOW - 1, nbf: NOW + 1 }, NOW);
  assert.match(exp.text, /\(expirado\)$/);
  assert.match(nbf.text, /\(ainda não vale\)$/);
});

test('iat válido vira só a data', () => {
  const [iat] = describeClaims({ iat: NOW }, NOW);
  assert.doesNotMatch(iat.text, /\(/);
});

test('lifeLeft: fração do tempo restante entre iat e exp', () => {
  assert.equal(lifeLeft({ iat: 0, exp: 100 }, 25), 0.75);
  assert.equal(lifeLeft({ nbf: 50, iat: 0, exp: 100 }, 75), 0.5);
});

test('lifeLeft: vencido é 0, sem exp é null', () => {
  assert.equal(lifeLeft({ iat: 0, exp: 100 }, 500), 0);
  assert.equal(lifeLeft({ iat: 0 }, 50), null);
  assert.equal(lifeLeft({ exp: 100 }, 50), null);
});
