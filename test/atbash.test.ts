import assert from 'node:assert/strict';
import { test } from 'node:test';
import { atbash } from '../src/ui/atbash.ts';

test('troca a primeira letra pela última, mantendo a caixa', () => {
  assert.equal(atbash('abc XYZ'), 'zyx CBA');
});

test('tira acento e deixa o resto como está', () => {
  assert.equal(atbash('Babilônia, 539!'), 'Yzyrolmrz, 539!');
});

test('aplicar duas vezes devolve o texto (sem acento)', () => {
  assert.equal(atbash(atbash('Mene Mene Tequel')), 'Mene Mene Tequel');
});
