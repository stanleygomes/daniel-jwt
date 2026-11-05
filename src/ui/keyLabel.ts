import { isHmac } from '../jwt/algorithms.ts';
import type { Usage } from '../jwt/keys.ts';

// Rótulo do campo de chave conforme o algoritmo e o uso.
export function keyLabel(alg: string | undefined, usage: Usage): string {
  if (isHmac(alg)) return 'Segredo';
  return usage === 'verify' ? 'Chave pública (PEM, certificado, JWK ou JWKS)' : 'Chave privada (PEM ou JWK)';
}
