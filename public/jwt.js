// Núcleo JWT: base64url, decode, sign e verify com a WebCrypto nativa.
// Sem DOM e sem rede: o mesmo arquivo roda no navegador e nos testes (Node).

const enc = new TextEncoder();
const dec = new TextDecoder();

export const ALGS = { EdDSA: { name: 'Ed25519' }, Ed25519: { name: 'Ed25519' } };
for (const bits of [256, 384, 512]) {
  const hash = `SHA-${bits}`;
  ALGS[`HS${bits}`] = { name: 'HMAC', hash };
  ALGS[`RS${bits}`] = { name: 'RSASSA-PKCS1-v1_5', hash };
  ALGS[`PS${bits}`] = { name: 'RSA-PSS', hash, saltLength: bits / 8 };
  ALGS[`ES${bits}`] = { name: 'ECDSA', hash, namedCurve: `P-${bits === 512 ? 521 : bits}` };
}

export const isHmac = (alg) => ALGS[alg]?.name === 'HMAC';

export function b64urlEncode(data) {
  const bytes = typeof data === 'string' ? enc.encode(data) : new Uint8Array(data);
  const bin = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(str) {
  if (!/^[A-Za-z0-9_-]*$/.test(str) || str.length % 4 === 1) {
    throw new Error('Base64url inválido.');
  }
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '=')), (c) =>
    c.charCodeAt(0),
  );
}

function parsePart(str, name) {
  try {
    return JSON.parse(dec.decode(b64urlDecode(str)));
  } catch {
    throw new Error(`${name} não é um JSON em base64url válido.`);
  }
}

export function decode(token) {
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

function algorithm(alg) {
  const params = ALGS[alg];
  if (!params) throw new Error(`Algoritmo não suportado: ${alg}.`);
  return params;
}

const PRIVATE_JWK_FIELDS = ['d', 'p', 'q', 'dp', 'dq', 'qi'];

function parseJwk(text, usage) {
  const jwk = JSON.parse(text);
  delete jwk.key_ops;
  if (usage === 'verify') PRIVATE_JWK_FIELDS.forEach((field) => delete jwk[field]);
  return jwk;
}

function parsePem(text, usage) {
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
  const der = Uint8Array.from(atob(match[2].replace(/\s/g, '')), (c) => c.charCodeAt(0));
  return [format, der];
}

async function importKey(alg, text, usage) {
  const params = algorithm(alg);
  if (params.name === 'HMAC') {
    return crypto.subtle.importKey('raw', enc.encode(text), params, false, [usage]);
  }
  const key = text.trim();
  const [format, data] = key.startsWith('{')
    ? ['jwk', parseJwk(key, usage)]
    : parsePem(key, usage);
  try {
    return await crypto.subtle.importKey(format, data, params, false, [usage]);
  } catch (error) {
    throw new Error(`Essa chave não serve para ${alg}: ${error.message}`);
  }
}

export async function sign(header, payload, key) {
  const input = `${b64urlEncode(JSON.stringify(header))}.${b64urlEncode(JSON.stringify(payload))}`;
  if (header.alg === 'none') return `${input}.`;
  if (!key) throw new Error('Informe a chave para assinar.');
  const cryptoKey = await importKey(header.alg, key, 'sign');
  const signature = await crypto.subtle.sign(algorithm(header.alg), cryptoKey, enc.encode(input));
  return `${input}.${b64urlEncode(signature)}`;
}

export async function verify(token, key) {
  const { alg } = decode(token).header;
  if (alg === 'none') return false;
  const [header, payload, signature] = token.trim().split('.');
  const cryptoKey = await importKey(alg, key, 'verify');
  return crypto.subtle.verify(
    algorithm(alg),
    cryptoKey,
    b64urlDecode(signature),
    enc.encode(`${header}.${payload}`),
  );
}
