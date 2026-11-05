import assert from 'node:assert/strict';
import { test } from 'node:test';
import { b64urlDecode, b64urlEncode } from '../src/jwt/base64url.ts';

test('ida e volta sem padding e com acento', () => {
  const encoded = b64urlEncode('Mene, Mene, Tequel ✦');
  assert.doesNotMatch(encoded, /[+/=]/);
  assert.equal(new TextDecoder().decode(b64urlDecode(encoded)), 'Mene, Mene, Tequel ✦');
});

test('recusa caractere fora do alfabeto', () => {
  assert.throws(() => b64urlDecode('ab+c'), /inválido/);
  assert.throws(() => b64urlDecode('a'), /inválido/);
});
