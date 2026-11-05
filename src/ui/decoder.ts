// Aba "Decifrar": token + chave → cabeçalho, conteúdo, claims e veredito.

import { decode, verify, type Decoded } from '../jwt/token.ts';
import { describeClaims } from './claims.ts';
import { $, el, errorMessage, field, pretty } from './dom.ts';
import { icon } from './icons.ts';
import { keyLabel } from './keyLabel.ts';

type Status = [kind: '' | 'ok' | 'bad', text: string];

async function verdict(token: string, alg: string | undefined, key: string): Promise<Status> {
  if (alg === 'none') return ['bad', 'alg "none": token sem assinatura. Não confie nele.'];
  if (!key) return ['', 'Informe a chave para verificar a assinatura.'];
  try {
    return (await verify(token, key))
      ? ['ok', 'Assinatura válida.']
      : ['bad', 'Tequel: pesado na balança e achado em falta.'];
  } catch (error) {
    return ['bad', errorMessage(error)];
  }
}

function setStatus([kind, text]: Status): void {
  $('d-status').className = `status ${kind}`;
  $('d-status').replaceChildren(...(kind ? [icon(kind === 'ok' ? 'valid' : 'invalid', 20)] : []), text);
}

function render(jwt: Decoded | null): void {
  $('d-header').textContent = jwt ? pretty(jwt.header) : '';
  $('d-payload').textContent = jwt ? pretty(jwt.payload) : '';
  $('d-claims').replaceChildren(
    ...describeClaims(jwt?.payload ?? {}).flatMap(({ label, text }) => [el('dt', label), el('dd', text)]),
  );
}

// Cada digitação dispara uma verificação; só a mais recente pinta o resultado.
let lastRun = 0;
async function update(): Promise<void> {
  const run = ++lastRun;
  const token = field('d-token').value.trim();
  let jwt: Decoded;
  try {
    jwt = decode(token);
  } catch (error) {
    $('d-error').textContent = token ? errorMessage(error) : '';
    render(null);
    setStatus(['', '']);
    return;
  }
  $('d-error').textContent = '';
  render(jwt);
  $('d-key-label').textContent = keyLabel(jwt.header.alg, 'verify');
  const status = await verdict(token, jwt.header.alg, field('d-key').value);
  if (run === lastRun) setStatus(status);
}

export async function setupDecoder(token: string, key: string): Promise<void> {
  field('d-token').value = token;
  field('d-key').value = key;
  for (const id of ['d-token', 'd-key']) field(id).addEventListener('input', update);
  await update();
}
