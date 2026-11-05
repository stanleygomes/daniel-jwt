// Tela: liga os campos ao núcleo (jwt.js) e mostra o painel de transparência.
import { decode, isHmac, sign, verify } from './jwt.js';

const $ = (id) => document.getElementById(id);
const el = (tag, text, className = '') => Object.assign(document.createElement(tag), { textContent: text, className });
const pretty = (value) => JSON.stringify(value, null, 2);

const CLAIMS = {
  iss: 'Emissor',
  sub: 'Assunto',
  aud: 'Audiência',
  exp: 'Expira em',
  nbf: 'Não vale antes de',
  iat: 'Emitido em',
  jti: 'ID do token',
};
const TIME_CLAIMS = new Set(['exp', 'nbf', 'iat']);

const SAMPLE = {
  header: { alg: 'HS256', typ: 'JWT' },
  payload: { sub: '1234567890', name: 'Belsazar', admin: true, iat: 1516239022 },
  secret: 'mene-mene-tequel-ufarsim',
};

function keyLabel(alg, usage) {
  if (isHmac(alg)) return 'Segredo';
  return usage === 'verify' ? 'Chave pública (PEM ou JWK)' : 'Chave privada (PEM ou JWK)';
}

function claimText(name, value) {
  if (!TIME_CLAIMS.has(name) || typeof value !== 'number') {
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
  const now = Date.now() / 1000;
  const date = new Date(value * 1000).toLocaleString('pt-BR');
  if (name === 'exp' && value < now) return `${date} (expirado)`;
  if (name === 'nbf' && value > now) return `${date} (ainda não vale)`;
  return date;
}

function renderClaims(payload) {
  const known = Object.entries(payload ?? {}).filter(([name]) => name in CLAIMS);
  $('d-claims').replaceChildren(
    ...known.flatMap(([name, value]) => [
      el('dt', `${name} · ${CLAIMS[name]}`),
      el('dd', claimText(name, value)),
    ]),
  );
}

function setStatus([kind, text]) {
  $('d-status').className = `status ${kind}`;
  $('d-status').textContent = text;
}

async function verdict(token, alg, key) {
  if (alg === 'none') return ['bad', 'alg "none": token sem assinatura. Não confie nele.'];
  if (!key) return ['', 'Informe a chave para verificar a assinatura.'];
  try {
    return (await verify(token, key))
      ? ['ok', '✓ Assinatura válida.']
      : ['bad', '✗ Tequel: pesado na balança e achado em falta.'];
  } catch (error) {
    return ['bad', error.message];
  }
}

let decodeRun = 0;
async function runDecode() {
  const run = ++decodeRun;
  const token = $('d-token').value.trim();
  let jwt;
  try {
    jwt = decode(token);
  } catch (error) {
    $('d-error').textContent = token ? error.message : '';
    $('d-header').textContent = $('d-payload').textContent = '';
    renderClaims(null);
    setStatus(['', '']);
    return;
  }
  $('d-error').textContent = '';
  $('d-header').textContent = pretty(jwt.header);
  $('d-payload').textContent = pretty(jwt.payload);
  renderClaims(jwt.payload);
  $('d-key-label').textContent = keyLabel(jwt.header.alg, 'verify');
  const status = await verdict(token, jwt.header.alg, $('d-key').value);
  if (run === decodeRun) setStatus(status);
}

function parseJson(text, name) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${name} não é um JSON válido.`);
  }
}

function renderToken(token) {
  const parts = token.split('.').map((part, i) => el('span', part, `part-${i}`));
  $('e-token').replaceChildren(parts[0], '.', parts[1], '.', parts[2]);
}

let encodeRun = 0;
let encodedToken = '';
async function runEncode() {
  const run = ++encodeRun;
  try {
    const header = parseJson($('e-header').value, 'O cabeçalho');
    const payload = parseJson($('e-payload').value, 'O conteúdo');
    $('e-key-label').textContent = keyLabel(header.alg, 'sign');
    const token = await sign(header, payload, $('e-key').value);
    if (run !== encodeRun) return;
    encodedToken = token;
    $('e-error').textContent = '';
    renderToken(token);
  } catch (error) {
    if (run !== encodeRun) return;
    encodedToken = '';
    $('e-error').textContent = error.message;
    $('e-token').replaceChildren();
  }
}

function selectTab(name) {
  for (const tab of document.querySelectorAll('[role="tab"]')) {
    const selected = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', selected);
    $(tab.dataset.tab).hidden = !selected;
  }
}

// Transparência: conta requisições para fora e bloqueios da CSP, ao vivo.
function watchNetwork() {
  let external = 0;
  let blocked = 0;
  new PerformanceObserver((list) => {
    external += list.getEntries().filter((entry) => !entry.name.startsWith(location.origin)).length;
    $('t-requests').textContent = external;
  }).observe({ type: 'resource', buffered: true });
  document.addEventListener('securitypolicyviolation', () => {
    $('t-blocked').textContent = ++blocked;
  });
}

async function init() {
  watchNetwork();
  $('d-token').addEventListener('input', runDecode);
  $('d-key').addEventListener('input', runDecode);
  for (const id of ['e-header', 'e-payload', 'e-key']) $(id).addEventListener('input', runEncode);
  for (const tab of document.querySelectorAll('[role="tab"]')) {
    tab.addEventListener('click', () => selectTab(tab.dataset.tab));
  }
  $('e-copy').addEventListener('click', async () => {
    if (!encodedToken) return;
    await navigator.clipboard.writeText(encodedToken);
    $('e-copy').textContent = 'Copiado';
    setTimeout(() => ($('e-copy').textContent = 'Copiar'), 1500);
  });

  $('e-header').value = pretty(SAMPLE.header);
  $('e-payload').value = pretty(SAMPLE.payload);
  $('e-key').value = SAMPLE.secret;
  await runEncode();
  $('d-token').value = encodedToken;
  $('d-key').value = SAMPLE.secret;
  await runDecode();
}

init();
