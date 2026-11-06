// Tela de abertura de fliperama na primeira visita da sessão, desligando como um CRT.

import { $ } from '../dom.ts';
import { reducedMotion } from './motion.ts';

const SEEN_KEY = 'daniel-booted-at';
const DAY_MS = 24 * 60 * 60 * 1000;
// tudo em até 1s: 10 linhas × 50ms + 150ms parado + 300ms do CRT desligando
const LINE_MS = 50;
const HOLD_MS = 150;

const lines = (version: string): string[] => [
  `DANIEL v${version}`,
  '© 539 A.C. BABILÔNIA',
  '',
  '1UP     000000',
  'HI      539000',
  '',
  'PACOTES PARA FORA .... 0',
  "CONNECT-SRC .... 'NONE'",
  '',
  'MENE MENE TEQUEL UFARSIM',
];

// No máximo uma vez por dia neste navegador (F5 e aba nova não repetem).
// Sem localStorage (aba privada, site bloqueado): aí não roda, para não repetir.
function seen(): boolean {
  try {
    const last = Number(localStorage.getItem(SEEN_KEY));
    if (Date.now() - last < DAY_MS) return true;
    localStorage.setItem(SEEN_KEY, String(Date.now()));
    return false;
  } catch {
    return true;
  }
}

export function boot(version: string): void {
  const screen = $('boot');
  if (reducedMotion || seen()) {
    screen.hidden = true;
    return;
  }
  const log = $('boot-log');
  const all = lines(version);
  let shown = 0;
  let done = false;

  const finish = (): void => {
    if (done) return;
    done = true;
    clearInterval(timer);
    log.textContent = all.join('\n');
    screen.classList.add('off');
    screen.addEventListener('animationend', () => (screen.hidden = true), { once: true });
  };
  const timer = setInterval(() => {
    log.textContent = all.slice(0, ++shown).join('\n');
    if (shown >= all.length) setTimeout(finish, HOLD_MS);
  }, LINE_MS);

  screen.addEventListener('click', finish);
  addEventListener('keydown', finish, { once: true });
}
