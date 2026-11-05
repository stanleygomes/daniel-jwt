// Importa a chave do usuário como CryptoKey. Aceita:
// segredo (texto ou base64), PEM (SPKI, PKCS#8, PKCS#1, SEC1, certificado X.509),
// JWK e JWKS ({"keys": [...]}, escolhendo pelo kid do token).

import { algorithm, type Params } from './algorithms.ts';
import { b64urlDecode, fromBinary } from './base64url.ts';
import { certificateToSpki, pkcs1PrivateToPkcs8, pkcs1PublicToSpki, sec1ToPkcs8 } from './der.ts';

export type Usage = 'sign' | 'verify';
export type KeyOptions = { base64Secret?: boolean; kid?: string };

type Bytes = Uint8Array<ArrayBuffer>;
type Der = { format: 'spki' | 'pkcs8'; der: Bytes };

const enc = new TextEncoder();
const PRIVATE_JWK_FIELDS = ['d', 'p', 'q', 'dp', 'dq', 'qi'] as const;

// PEM → formato que a WebCrypto entende. EC PARAMETERS (que o openssl põe antes) é ignorado.
const PEM_LABELS: Record<string, (der: Bytes) => Der> = {
  'PUBLIC KEY': (der) => ({ format: 'spki', der }),
  'RSA PUBLIC KEY': (der) => ({ format: 'spki', der: pkcs1PublicToSpki(der) }),
  CERTIFICATE: (der) => ({ format: 'spki', der: certificateToSpki(der) }),
  'PRIVATE KEY': (der) => ({ format: 'pkcs8', der }),
  'RSA PRIVATE KEY': (der) => ({ format: 'pkcs8', der: pkcs1PrivateToPkcs8(der) }),
  'EC PRIVATE KEY': (der) => ({ format: 'pkcs8', der: sec1ToPkcs8(der) }),
};

function parsePem(text: string): Der {
  if (text.includes('ENCRYPTED PRIVATE KEY')) {
    throw new Error('Chave privada com senha: remova a senha (openssl pkcs8 -nocrypt).');
  }
  for (const [, label, body] of text.matchAll(/-----BEGIN ([A-Z0-9 ]+)-----([\s\S]+?)-----END \1-----/g)) {
    const convert = PEM_LABELS[label];
    if (convert) return convert(fromBinary(atob(body.replace(/\s/g, ''))));
  }
  throw new Error('Chave inválida: use PEM, certificado, JWK ou JWKS.');
}

// JWKS: com kid, pega a chave dele; sem kid, só serve se o conjunto tiver uma chave.
function pickJwk(json: { keys?: JsonWebKey[] } & JsonWebKey, kid?: string): JsonWebKey {
  if (!Array.isArray(json.keys)) return json;
  const keys = json.keys as (JsonWebKey & { kid?: string })[];
  const found = kid ? keys.find((key) => key.kid === kid) : keys.length === 1 ? keys[0] : undefined;
  if (found) return found;
  throw new Error(
    kid
      ? `Nenhuma chave do JWKS tem kid "${kid}".`
      : `O JWKS tem ${keys.length} chaves e o token não tem kid para escolher.`,
  );
}

function publicJwk(jwk: JsonWebKey): JsonWebKey {
  const copy = { ...jwk };
  delete copy.key_ops;
  for (const field of PRIVATE_JWK_FIELDS) delete copy[field];
  return copy;
}

function secret(text: string, base64: boolean): Bytes {
  if (!base64) return enc.encode(text);
  try {
    return b64urlDecode(text.trim().replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
  } catch {
    throw new Error('O segredo não é base64 válido.');
  }
}

// Verificar só precisa da parte pública: de uma chave privada, ela é derivada aqui.
async function importDer({ format, der }: Der, params: Params, usage: Usage): Promise<CryptoKey> {
  if (usage === 'sign' || format === 'spki') {
    return crypto.subtle.importKey(format, der, params, false, [usage]);
  }
  const privateKey = await crypto.subtle.importKey(format, der, params, true, ['sign']);
  const jwk = publicJwk(await crypto.subtle.exportKey('jwk', privateKey));
  return crypto.subtle.importKey('jwk', jwk, params, false, ['verify']);
}

function importJwk(jwk: JsonWebKey, params: Params, usage: Usage): Promise<CryptoKey> {
  const key = usage === 'verify' ? publicJwk(jwk) : { ...jwk, key_ops: undefined };
  return crypto.subtle.importKey('jwk', key, params, false, [usage]);
}

export async function importKey(
  alg: string | undefined,
  text: string,
  usage: Usage,
  { base64Secret = false, kid }: KeyOptions = {},
): Promise<CryptoKey> {
  const params = algorithm(alg);
  if (params.name === 'HMAC') {
    return crypto.subtle.importKey('raw', secret(text, base64Secret), params, false, [usage]);
  }
  const key = text.trim();
  const jwk = key.startsWith('{') ? pickJwk(JSON.parse(key), kid) : null;
  const der = jwk ? null : parsePem(key);
  try {
    return await (jwk ? importJwk(jwk, params, usage) : importDer(der as Der, params, usage));
  } catch (error) {
    throw new Error(`Essa chave não serve para ${alg}: ${(error as Error).message}`);
  }
}
