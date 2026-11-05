// Importa a chave do usuário (segredo, PEM ou JWK) como CryptoKey.

import { algorithm } from './algorithms.ts';
import { fromBinary } from './base64url.ts';

export type Usage = 'sign' | 'verify';
type Pem = { format: 'spki' | 'pkcs8'; der: Uint8Array<ArrayBuffer> };

const enc = new TextEncoder();
const PRIVATE_JWK_FIELDS = ['d', 'p', 'q', 'dp', 'dq', 'qi'] as const;

// Para verificar basta a parte pública: aceita JWK privada e descarta o resto.
function parseJwk(text: string, usage: Usage): JsonWebKey {
  const jwk: JsonWebKey = JSON.parse(text);
  delete jwk.key_ops;
  if (usage === 'verify') PRIVATE_JWK_FIELDS.forEach((field) => delete jwk[field]);
  return jwk;
}

function parsePem(text: string, usage: Usage): Pem {
  if (/BEGIN (RSA|EC) (PUBLIC|PRIVATE) KEY/.test(text)) {
    throw new Error(
      'PEM PKCS#1/SEC1 não suportado. Converta para "BEGIN PRIVATE KEY" ou "BEGIN PUBLIC KEY".',
    );
  }
  const match = text.match(/-----BEGIN (PUBLIC|PRIVATE) KEY-----([\s\S]+?)-----END \1 KEY-----/);
  if (!match) throw new Error('Chave inválida: use PEM ou JWK.');
  const format = match[1] === 'PUBLIC' ? 'spki' : 'pkcs8';
  if (usage === 'verify' && format === 'pkcs8') {
    throw new Error('Para verificar, use a chave pública.');
  }
  return { format, der: fromBinary(atob(match[2].replace(/\s/g, ''))) };
}

export async function importKey(alg: string | undefined, text: string, usage: Usage): Promise<CryptoKey> {
  const params = algorithm(alg);
  if (params.name === 'HMAC') {
    return crypto.subtle.importKey('raw', enc.encode(text), params, false, [usage]);
  }
  const key = text.trim();
  const pem = key.startsWith('{') ? null : parsePem(key, usage);
  try {
    return await (pem
      ? crypto.subtle.importKey(pem.format, pem.der, params, false, [usage])
      : crypto.subtle.importKey('jwk', parseJwk(key, usage), params, false, [usage]));
  } catch (error) {
    throw new Error(`Essa chave não serve para ${alg}: ${(error as Error).message}`);
  }
}
