// DER mínimo: o suficiente para converter PEM antigo (PKCS#1, SEC1) para os formatos
// que a WebCrypto aceita (PKCS#8, SPKI) e tirar a chave pública de um certificado X.509.

type Bytes = Uint8Array<ArrayBuffer>;
type Node = { tag: number; start: number; header: number; end: number };

const SEQUENCE = 0x30;
const OCTET_STRING = 0x04;
const BIT_STRING = 0x03;
const CONTEXT_0 = 0xa0;
const VERSION_0 = Uint8Array.of(0x02, 0x01, 0x00);
const NULL = Uint8Array.of(0x05, 0x00);
const RSA_OID = Uint8Array.of(0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01);
const EC_OID = Uint8Array.of(0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01);

// ---------- leitura ----------

function read(der: Bytes, offset: number): Node {
  if (offset + 2 > der.length) throw new Error('DER truncado.');
  let length = der[offset + 1];
  let header = 2;
  if (length & 0x80) {
    const size = length & 0x7f;
    length = 0;
    for (let i = 0; i < size; i++) length = length * 256 + der[offset + 2 + i];
    header += size;
  }
  const end = offset + header + length;
  if (end > der.length) throw new Error('DER truncado.');
  return { tag: der[offset], start: offset, header, end };
}

function children(der: Bytes, node: Node): Node[] {
  const list: Node[] = [];
  for (let pos = node.start + node.header; pos < node.end; ) {
    const child = read(der, pos);
    list.push(child);
    pos = child.end;
  }
  return list;
}

const bytesOf = (der: Bytes, node: Node): Bytes => der.slice(node.start, node.end);

// ---------- escrita ----------

function concat(parts: Uint8Array[]): Bytes {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let pos = 0;
  for (const part of parts) {
    out.set(part, pos);
    pos += part.length;
  }
  return out;
}

function length(n: number): number[] {
  if (n < 0x80) return [n];
  const bytes: number[] = [];
  for (; n > 0; n = Math.floor(n / 256)) bytes.unshift(n & 0xff);
  return [0x80 | bytes.length, ...bytes];
}

const tlv = (tag: number, ...parts: Uint8Array[]): Bytes => {
  const body = concat(parts);
  return concat([Uint8Array.of(tag, ...length(body.length)), body]);
};

// ---------- conversões ----------

// RSA PRIVATE KEY (PKCS#1) → PRIVATE KEY (PKCS#8)
export const pkcs1PrivateToPkcs8 = (pkcs1: Bytes): Bytes =>
  tlv(SEQUENCE, VERSION_0, tlv(SEQUENCE, RSA_OID, NULL), tlv(OCTET_STRING, pkcs1));

// RSA PUBLIC KEY (PKCS#1) → PUBLIC KEY (SPKI)
export const pkcs1PublicToSpki = (pkcs1: Bytes): Bytes =>
  tlv(SEQUENCE, tlv(SEQUENCE, RSA_OID, NULL), tlv(BIT_STRING, Uint8Array.of(0), pkcs1));

// EC PRIVATE KEY (SEC1) → PRIVATE KEY (PKCS#8); a curva vem do campo [0] da SEC1.
export function sec1ToPkcs8(sec1: Bytes): Bytes {
  const params = children(sec1, read(sec1, 0)).find((node) => node.tag === CONTEXT_0);
  if (!params) throw new Error('EC PRIVATE KEY sem a curva: gere com "openssl ecparam -genkey".');
  const curve = bytesOf(sec1, children(sec1, params)[0]);
  return tlv(SEQUENCE, VERSION_0, tlv(SEQUENCE, EC_OID, curve), tlv(OCTET_STRING, sec1));
}

// CERTIFICATE (X.509) → PUBLIC KEY (SPKI): 7º campo do tbsCertificate (6º sem versão).
export function certificateToSpki(cert: Bytes): Bytes {
  const tbs = children(cert, read(cert, 0))[0];
  const fields = children(cert, tbs);
  const spki = fields[fields[0].tag === CONTEXT_0 ? 6 : 5];
  if (spki?.tag !== SEQUENCE) throw new Error('Certificado X.509 inválido.');
  return bytesOf(cert, spki);
}
