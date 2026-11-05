// Gera chave nova para o alg: segredo aleatório (HMAC) ou par PEM (RSA, EC, Ed25519).

import { algorithm } from './algorithms.ts';
import { b64urlEncode } from './base64url.ts';

export type GeneratedKey = { privateKey: string; publicKey?: string };

const RSA = { modulusLength: 2048, publicExponent: Uint8Array.of(1, 0, 1) };

function toPem(label: 'PUBLIC' | 'PRIVATE', der: ArrayBuffer): string {
  const b64 = btoa(Array.from(new Uint8Array(der), (b) => String.fromCharCode(b)).join(''));
  const lines = b64.match(/.{1,64}/g) ?? [];
  return [`-----BEGIN ${label} KEY-----`, ...lines, `-----END ${label} KEY-----`].join('\n');
}

export async function generateKey(alg: string | undefined): Promise<GeneratedKey> {
  const params = algorithm(alg);
  if (params.name === 'HMAC') {
    // segredo do tamanho do hash, em texto base64url (dá para colar em qualquer lugar)
    const bytes = Number(params.hash?.slice(4)) / 8;
    return { privateKey: b64urlEncode(crypto.getRandomValues(new Uint8Array(bytes)).buffer) };
  }
  const isRsa = params.name.startsWith('RSA');
  const pair = (await crypto.subtle.generateKey(isRsa ? { ...params, ...RSA } : params, true, [
    'sign',
    'verify',
  ])) as CryptoKeyPair;
  return {
    privateKey: toPem('PRIVATE', await crypto.subtle.exportKey('pkcs8', pair.privateKey)),
    publicKey: toPem('PUBLIC', await crypto.subtle.exportKey('spki', pair.publicKey)),
  };
}
