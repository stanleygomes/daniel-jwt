// Aba "Decifrar": token + chave → cabeçalho, conteúdo, claims e veredito.

import { isHmac } from '../jwt/algorithms.ts';
import { type Decoded, decode, verify } from '../jwt/token.ts';
import { describeClaims } from './claims.ts';
import { $, el, errorMessage, field, pretty } from './dom.ts';
import { unlock } from './fx/achievements.ts';
import { showLife } from './fx/life.ts';
import { showRoute } from './fx/route.ts';
import { addPoints, loseLife, setLives } from './fx/score.ts';
import { flap } from './fx/text.ts';
import { flashVerdict } from './fx/verdict.ts';
import { paintJson, paintToken } from './highlight.ts';
import { icon } from './icons.ts';
import { keyLabel } from './keyLabel.ts';

type Status = [kind: '' | 'idle' | 'ok' | 'bad', text: string];

async function verdict(
  token: string,
  alg: string | undefined,
  key: string,
  base64Secret: boolean,
): Promise<Status> {
  if (alg === 'none') return ['bad', 'alg "none": token sem assinatura. Não confie nele.'];
  if (!key) return ['', 'Informe a chave para verificar a assinatura.'];
  try {
    return (await verify(token, key, { base64Secret }))
      ? ['ok', 'Assinatura válida.']
      : ['bad', 'Tequel: pesado na balança e achado em falta.'];
  } catch (error) {
    return ['bad', errorMessage(error)];
  }
}

// Só pisca o veredito quando ele muda, e nunca no carregamento.
let lastKind: Status[0] | null = null;

function setStatus([kind, text]: Status): void {
  const scored = kind === 'ok' || kind === 'bad';
  if (scored && lastKind !== null && kind !== lastKind) {
    flashVerdict(kind);
    // ganhar ou perder só na virada, para não perder vida a cada tecla
    if (kind === 'bad') loseLife();
    else {
      setLives();
      addPoints(100, $('d-status'));
    }
  }
  lastKind = kind;
  $('d-status').className = `status ${kind}`;
  $('d-status').replaceChildren(...(scored ? [icon(kind === 'ok' ? 'valid' : 'invalid', 20)] : []), text);
}

function render(jwt: Decoded | null): void {
  for (const [id, value] of [
    ['d-header', jwt?.header],
    ['d-payload', jwt?.payload],
  ] as const) {
    const text = value ? pretty(value) : '';
    flap($(id), text, 22, () => paintJson($(id), text));
  }
  $('d-claims').replaceChildren(
    ...describeClaims(jwt?.payload ?? {}).flatMap(({ label, text }) => [el('dt', label), el('dd', text)]),
  );
  showLife(jwt?.payload ?? null);
}

// Conquistas só pelo que a pessoa faz, nunca pelo exemplo do carregamento.
let ready = false;

function achievements(jwt: Decoded, [kind]: Status, hmac: boolean): void {
  if (!ready) return;
  const { exp } = jwt.payload;
  if (typeof exp === 'number' && exp < Date.now() / 1000) unlock('expired');
  if (jwt.header.alg === 'none') unlock('none');
  else if (kind === 'bad') unlock('tequel');
  else if (kind === 'ok' && !hmac) unlock('rival');
}

// Cada digitação dispara uma verificação; só a mais recente pinta o resultado.
let lastRun = 0;
let lastToken = '';
async function update(): Promise<void> {
  const run = ++lastRun;
  const raw = field('d-token').value;
  const token = raw.trim();
  let jwt: Decoded;
  try {
    jwt = decode(token);
  } catch (error) {
    $('d-error').textContent = token ? errorMessage(error) : '';
    paintToken($('d-token-paint'), raw, false);
    render(null);
    showRoute(null);
    lastToken = '';
    setStatus(token ? ['', ''] : ['idle', 'INSERT TOKEN']);
    return;
  }
  $('d-error').textContent = '';
  paintToken($('d-token-paint'), raw, true);
  render(jwt);
  if (token !== lastToken) showRoute(token);
  lastToken = token;
  const hmac = isHmac(jwt.header.alg);
  $('d-key-label').textContent = keyLabel(jwt.header.alg, 'verify');
  $('d-b64-box').hidden = !hmac;
  const base64Secret = hmac && $<HTMLInputElement>('d-b64').checked;
  const status = await verdict(token, jwt.header.alg, field('d-key').value, base64Secret);
  if (run !== lastRun) return;
  setStatus(status);
  achievements(jwt, status, hmac);
}

// Vindo da aba Selar ("Decifrar este"): token + chave pública (ou segredo) já preenchidos.
export async function decodeToken(token: string, key: string, base64Secret: boolean): Promise<void> {
  field('d-token').value = token;
  field('d-key').value = key;
  $<HTMLInputElement>('d-b64').checked = base64Secret;
  await update();
}

export async function setupDecoder(token: string, key: string): Promise<void> {
  field('d-token').value = token;
  field('d-key').value = key;
  for (const id of ['d-token', 'd-key']) field(id).addEventListener('input', update);
  // a camada colorida embaixo do campo rola junto com ele
  field('d-token').addEventListener('scroll', () => {
    $('d-token-paint').scrollTop = field('d-token').scrollTop;
  });
  $('d-b64').addEventListener('change', update);
  await update();
  ready = true;
}
