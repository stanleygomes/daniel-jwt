// Base64url (RFC 4648 §5), o alfabeto das 3 partes de um JWT.

const enc = new TextEncoder();

export const fromBinary = (bin: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(bin, (c) => c.charCodeAt(0));

export function b64urlEncode(data: string | ArrayBuffer): string {
  const bytes = typeof data === 'string' ? enc.encode(data) : new Uint8Array(data);
  const bin = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(str: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]*$/.test(str) || str.length % 4 === 1) {
    throw new Error('Base64url inválido.');
  }
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return fromBinary(atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '=')));
}
