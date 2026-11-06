import assert from 'node:assert/strict';
import { test } from 'node:test';
import { jsonPieces } from '../src/ui/highlight.ts';

const kinds = (text: string) => jsonPieces(text).filter((piece) => piece.kind !== 'plain');

test('separa chave, texto, número e literais', () => {
  const json = JSON.stringify({ sub: 'x', iat: 1516239022, admin: true, nada: null, saldo: -1.5e3 }, null, 2);
  assert.deepEqual(kinds(json), [
    { kind: 'key', text: '"sub"' },
    { kind: 'string', text: '"x"' },
    { kind: 'key', text: '"iat"' },
    { kind: 'number', text: '1516239022' },
    { kind: 'key', text: '"admin"' },
    { kind: 'literal', text: 'true' },
    { kind: 'key', text: '"nada"' },
    { kind: 'literal', text: 'null' },
    { kind: 'key', text: '"saldo"' },
    { kind: 'number', text: '-1500' },
  ]);
});

test('número e "true" dentro de texto continuam texto; aspas escapadas não quebram', () => {
  const json = JSON.stringify({ a: 'tem 42 e true "aqui"' });
  assert.deepEqual(kinds(json), [
    { kind: 'key', text: '"a"' },
    { kind: 'string', text: '"tem 42 e true \\"aqui\\""' },
  ]);
});

test('juntando os pedaços volta o texto original', () => {
  const json = JSON.stringify({ x: [1, 'dois', false], y: { z: null } }, null, 2);
  assert.equal(
    jsonPieces(json)
      .map((piece) => piece.text)
      .join(''),
    json,
  );
});
