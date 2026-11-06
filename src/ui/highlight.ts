// Realce de sintaxe sem innerHTML (a CSP exige Trusted Types): cada pedaço vira um <span>.

import { el } from './dom.ts';

export type Piece = { kind: 'key' | 'string' | 'number' | 'literal' | 'plain'; text: string };

const JSON_TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

// Puro: separa um JSON já formatado em pedaços com tipo (testável no Node).
export function jsonPieces(text: string): Piece[] {
  const pieces: Piece[] = [];
  let last = 0;
  const plain = (end: number): void => {
    if (end > last) pieces.push({ kind: 'plain', text: text.slice(last, end) });
  };
  for (const match of text.matchAll(JSON_TOKEN)) {
    const [token, quoted, colon] = match;
    plain(match.index);
    if (quoted) {
      pieces.push({ kind: colon ? 'key' : 'string', text: quoted });
      if (colon) pieces.push({ kind: 'plain', text: colon });
    } else {
      pieces.push({ kind: /\d/.test(token) ? 'number' : 'literal', text: token });
    }
    last = match.index + token.length;
  }
  plain(text.length);
  return pieces;
}

export function paintJson(target: HTMLElement, text: string): void {
  target.replaceChildren(
    ...jsonPieces(text).map(({ kind, text }) => (kind === 'plain' ? text : el('span', text, `json-${kind}`))),
  );
}

// Token: cabeçalho, conteúdo e assinatura em cores; os pontos ficam neutros.
export function paintToken(target: HTMLElement, raw: string, colored: boolean): void {
  if (!colored) {
    target.textContent = raw;
    return;
  }
  let part = 0;
  target.replaceChildren(
    ...raw.split(/(\.)/).map((chunk) => {
      if (chunk === '.') {
        part++;
        return chunk;
      }
      return el('span', chunk, `part-${part}`);
    }),
  );
}
