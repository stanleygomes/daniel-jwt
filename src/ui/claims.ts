// Claims registradas (RFC 7519 §4.1) em texto legível. Puro: testável no Node.

import type { Json } from '../jwt/token.ts';

export type Claim = { label: string; text: string };

const CLAIMS: Record<string, string> = {
  iss: 'Emissor',
  sub: 'Assunto',
  aud: 'Audiência',
  exp: 'Expira em',
  nbf: 'Não vale antes de',
  iat: 'Emitido em',
  jti: 'ID do token',
};
const TIME_CLAIMS = new Set(['exp', 'nbf', 'iat']);

function claimText(name: string, value: unknown, now: number): string {
  if (!TIME_CLAIMS.has(name) || typeof value !== 'number') {
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
  const date = new Date(value * 1000).toLocaleString('pt-BR');
  if (name === 'exp' && value < now) return `${date} (expirado)`;
  if (name === 'nbf' && value > now) return `${date} (ainda não vale)`;
  return date;
}

export function describeClaims(payload: Json, now = Date.now() / 1000): Claim[] {
  return Object.entries(payload)
    .filter(([name]) => name in CLAIMS)
    .map(([name, value]) => ({
      label: `${name} · ${CLAIMS[name]}`,
      text: claimText(name, value, now),
    }));
}
