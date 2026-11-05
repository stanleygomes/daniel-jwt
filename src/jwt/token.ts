// Operações do JWT: decode, sign e verify. Sem DOM e sem rede (roda no Node).

import { algorithm } from './algorithms.ts';
import { b64urlDecode, b64urlEncode } from './base64url.ts';
import { importKey } from './keys.ts';

export type SignOptions = { base64Secret?: boolean };

export type Json = Record<string, unknown>;
export type Header = Json & { alg?: string };
export type Decoded = { header: Header; payload: Json; signature: string };

const enc = new TextEncoder();
const dec = new TextDecoder();

function parsePart(str: string, name: string): Json {
  try {
    return JSON.parse(dec.decode(b64urlDecode(str)));
  } catch {
    throw new Error(`${name} não é um JSON em base64url válido.`);
  }
}

export function decode(token: string): Decoded {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Um JWT tem 3 partes separadas por ponto: cabeçalho.conteúdo.assinatura.');
  }
  return {
    header: parsePart(parts[0], 'O cabeçalho'),
    payload: parsePart(parts[1], 'O conteúdo'),
    signature: parts[2],
  };
}

export async function sign(
  header: Header,
  payload: Json,
  key = '',
  { base64Secret }: SignOptions = {},
): Promise<string> {
  const input = `${b64urlEncode(JSON.stringify(header))}.${b64urlEncode(JSON.stringify(payload))}`;
  if (header.alg === 'none') return `${input}.`;
  if (!key) throw new Error('Informe a chave para assinar.');
  const kid = typeof header.kid === 'string' ? header.kid : undefined;
  const cryptoKey = await importKey(header.alg, key, 'sign', { base64Secret, kid });
  const signature = await crypto.subtle.sign(algorithm(header.alg), cryptoKey, enc.encode(input));
  return `${input}.${b64urlEncode(signature)}`;
}

// alg "none" nunca é válido: token sem assinatura não prova nada.
export async function verify(
  token: string,
  key: string,
  { base64Secret }: SignOptions = {},
): Promise<boolean> {
  const { alg, kid } = decode(token).header;
  if (alg === 'none') return false;
  const [header, payload, signature] = token.trim().split('.');
  const cryptoKey = await importKey(alg, key, 'verify', {
    base64Secret,
    kid: typeof kid === 'string' ? kid : undefined,
  });
  return crypto.subtle.verify(
    algorithm(alg),
    cryptoKey,
    b64urlDecode(signature),
    enc.encode(`${header}.${payload}`),
  );
}
