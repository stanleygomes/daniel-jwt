// Aba "Selar": cabeçalho + conteúdo + chave → token assinado.

import { sign, type Header, type Json } from '../jwt/token.ts';
import { $, el, errorMessage, field, pretty } from './dom.ts';
import { keyLabel } from './keyLabel.ts';

export type Draft = { header: Header; payload: Json; key: string };

let token = '';

function parseJson(text: string, name: string): Json {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${name} não é um JSON válido.`);
  }
}

function render(error = ''): void {
  $('e-error').textContent = error;
  const parts = token ? token.split('.').map((part, i) => el('span', part, `part-${i}`)) : [];
  $('e-token').replaceChildren(...parts.flatMap((part, i) => (i ? ['.', part] : [part])));
}

let lastRun = 0;
async function update(): Promise<void> {
  const run = ++lastRun;
  try {
    const header: Header = parseJson(field('e-header').value, 'O cabeçalho');
    const payload = parseJson(field('e-payload').value, 'O conteúdo');
    $('e-key-label').textContent = keyLabel(header.alg, 'sign');
    const signed = await sign(header, payload, field('e-key').value);
    if (run !== lastRun) return;
    token = signed;
    render();
  } catch (error) {
    if (run !== lastRun) return;
    token = '';
    render(errorMessage(error));
  }
}

async function copy(): Promise<void> {
  if (!token) return;
  await navigator.clipboard.writeText(token);
  $('e-copy').textContent = 'Copiado';
  setTimeout(() => ($('e-copy').textContent = 'Copiar'), 1500);
}

// Monta a aba com o rascunho inicial e devolve o token gerado.
export async function setupEncoder({ header, payload, key }: Draft): Promise<string> {
  field('e-header').value = pretty(header);
  field('e-payload').value = pretty(payload);
  field('e-key').value = key;
  for (const id of ['e-header', 'e-payload', 'e-key']) field(id).addEventListener('input', update);
  $('e-copy').addEventListener('click', copy);
  await update();
  return token;
}
