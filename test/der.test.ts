import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { certificateToSpki, pkcs1PrivateToPkcs8, pkcs1PublicToSpki } from '../src/jwt/der.ts';

// Lê o DER de um PEM das fixtures (geradas pelo openssl).
const der = (name: string): Uint8Array<ArrayBuffer> => {
  const pem = readFileSync(new URL(`fixtures/${name}`, import.meta.url), 'utf8');
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  return Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
};

test('PKCS#1 privada → PKCS#8: igual byte a byte ao openssl', () => {
  assert.deepEqual(pkcs1PrivateToPkcs8(der('rsa-pkcs1.pem')), der('rsa-pkcs8.pem'));
});

test('PKCS#1 pública → SPKI: igual byte a byte ao openssl', () => {
  assert.deepEqual(pkcs1PublicToSpki(der('rsa-pkcs1-pub.pem')), der('rsa-spki.pem'));
});

test('certificado → SPKI: igual à chave pública do openssl', () => {
  assert.deepEqual(certificateToSpki(der('rsa-cert.pem')), der('rsa-spki.pem'));
});

test('DER truncado dá erro', () => {
  const cert = der('rsa-cert.pem');
  assert.throws(() => certificateToSpki(cert.slice(0, 40)), /truncado/);
});
