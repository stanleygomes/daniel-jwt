// Aba "Selar": cabeçalho + conteúdo + chave → token assinado.

import { isHmac, SIGNING_ALGS } from '../jwt/algorithms.ts';
import { generateKey } from '../jwt/generate.ts';
import { type Header, type Json, sign } from '../jwt/token.ts';
import { decodeToken } from './decoder.ts';
import { $, el, errorMessage, field, pretty } from './dom.ts';
import { unlock } from './fx/achievements.ts';
import { addPoints, pop } from './fx/score.ts';
import { icon } from './icons.ts';
import { keyLabel } from './keyLabel.ts';
import { showTab } from './tabs.ts';

export type Draft = { header: Header; payload: Json; key: string };

let token = '';
let seals = 0; // placar de fliperama: quantos tokens já foram selados

const base64 = (): HTMLInputElement => $<HTMLInputElement>('e-b64');
const algSelect = (): HTMLSelectElement => $<HTMLSelectElement>('e-alg');

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

// Placar: soma um selo e, depois do carregamento, solta uma moedinha "+1".
let ready = false;
function addSeal(): void {
  $('e-score').textContent = String(++seals).padStart(6, '0');
  if (!ready) return;
  unlock('seal');
  addPoints(10, $('e-score'));
}

let lastRun = 0;
async function update(): Promise<void> {
  const run = ++lastRun;
  try {
    const header: Header = parseJson(field('e-header').value, 'O cabeçalho');
    const payload = parseJson(field('e-payload').value, 'O conteúdo');
    const hmac = isHmac(header.alg);
    // o seletor acompanha o cabeçalho; alg fora da lista deixa o seletor em branco
    algSelect().value = SIGNING_ALGS.includes(header.alg ?? '') ? (header.alg as string) : '';
    $('e-key-label').textContent = keyLabel(header.alg, 'sign');
    $('e-b64-box').hidden = !hmac;
    $('e-public-box').hidden = hmac || !field('e-public').value;
    const signed = await sign(header, payload, field('e-key').value, {
      base64Secret: hmac && base64().checked,
    });
    if (run !== lastRun) return;
    if (signed !== token) addSeal();
    token = signed;
    render();
  } catch (error) {
    if (run !== lastRun) return;
    token = '';
    render(errorMessage(error));
  }
}

// Chave nova para o alg do cabeçalho; a pública aparece logo abaixo para verificar.
async function generate(): Promise<void> {
  try {
    const { alg } = parseJson(field('e-header').value, 'O cabeçalho') as Header;
    const { privateKey, publicKey } = await generateKey(alg);
    field('e-key').value = privateKey;
    unlock('forge');
    addPoints(200, $('e-generate'));
    pop($('e-key'), 'POWER UP!');
    field('e-public').value = publicKey ?? '';
    base64().checked = false;
    await update();
  } catch (error) {
    render(errorMessage(error));
  }
}

// Escolher o algoritmo troca o alg do cabeçalho e já forja um par de chaves novo.
async function chooseAlg(): Promise<void> {
  let header: Header;
  try {
    header = parseJson(field('e-header').value, 'O cabeçalho');
  } catch {
    header = { typ: 'JWT' };
  }
  field('e-header').value = pretty({ ...header, alg: algSelect().value });
  await generate();
}

// Leva o token e a chave de verificação (pública, ou o próprio segredo) para a aba Decifrar.
async function decodeThis(): Promise<void> {
  if (!token) return;
  const hmac = !field('e-public').value || $('e-public-box').hidden;
  const key = hmac ? field('e-key').value : field('e-public').value;
  showTab('decode');
  await decodeToken(token, key, hmac && base64().checked);
}

async function copy(): Promise<void> {
  if (!token) return;
  await navigator.clipboard.writeText(token);
  unlock('copy');
  $('e-copy').replaceChildren(icon('check'), 'Copiado');
  setTimeout(() => $('e-copy').replaceChildren(icon('copy'), 'Copiar'), 1500);
}

// Monta a aba com o rascunho inicial e devolve o token gerado.
export async function setupEncoder({ header, payload, key }: Draft): Promise<string> {
  field('e-header').value = pretty(header);
  field('e-payload').value = pretty(payload);
  field('e-key').value = key;
  for (const id of ['e-header', 'e-payload', 'e-key']) field(id).addEventListener('input', update);
  base64().addEventListener('change', update);
  $('e-generate').addEventListener('click', generate);
  $('e-copy').addEventListener('click', copy);
  $('e-decode').addEventListener('click', decodeThis);
  algSelect().append(el('option', 'Personalizado'), ...SIGNING_ALGS.map((alg) => el('option', alg)));
  (algSelect().options[0] as HTMLOptionElement).value = '';
  (algSelect().options[0] as HTMLOptionElement).disabled = true;
  algSelect().addEventListener('change', chooseAlg);
  await update();
  ready = true;
  return token;
}
