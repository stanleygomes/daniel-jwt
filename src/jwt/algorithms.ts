// Tabela alg do JWT → parâmetros da WebCrypto.

export type Params = { name: string; hash?: string; saltLength?: number; namedCurve?: string };

export const ALGS: Record<string, Params> = {
  EdDSA: { name: 'Ed25519' },
  Ed25519: { name: 'Ed25519' },
};
for (const bits of [256, 384, 512]) {
  const hash = `SHA-${bits}`;
  ALGS[`HS${bits}`] = { name: 'HMAC', hash };
  ALGS[`RS${bits}`] = { name: 'RSASSA-PKCS1-v1_5', hash };
  ALGS[`PS${bits}`] = { name: 'RSA-PSS', hash, saltLength: bits / 8 };
  ALGS[`ES${bits}`] = { name: 'ECDSA', hash, namedCurve: `P-${bits === 512 ? 521 : bits}` };
}

export const isHmac = (alg?: string): boolean => ALGS[alg ?? '']?.name === 'HMAC';

export function algorithm(alg?: string): Params {
  const params = ALGS[alg ?? ''];
  if (!params) throw new Error(`Algoritmo não suportado: ${alg}.`);
  return params;
}
