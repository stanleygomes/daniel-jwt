// Tela de abertura de fliperama na primeira visita da sessão, desligando como um CRT.

import { $ } from '../dom.ts';
import { reducedMotion } from './motion.ts';

const SEEN_KEY = 'daniel-booted';
const LINE_MS = 260;

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

// sessionStorage pode não existir (aba privada, site bloqueado): aí o boot roda sempre.
function seen(): boolean {
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return true;
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // segue sem lembrar
  }
  return false;
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
    if (shown >= all.length) setTimeout(finish, 500);
  }, LINE_MS);

  screen.addEventListener('click', finish);
  addEventListener('keydown', finish, { once: true });
}
