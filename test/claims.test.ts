import assert from 'node:assert/strict';
import { test } from 'node:test';
import { describeClaims } from '../src/ui/claims.ts';

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
