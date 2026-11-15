// Abertura no tubo de TV antigo: cartela de teste do "canal 539" e o tubo desligando.

import { $, el } from '../dom.ts';
import { reducedMotion } from './motion.ts';

const SEEN_KEY = 'daniel-booted-at';
const DAY_MS = 24 * 60 * 60 * 1000;
// tudo em até 1s: 10 linhas × 50ms + 150ms parado + 300ms do tubo desligando
const LINE_MS = 50;
const HOLD_MS = 150;
const OFF_MS = 300;
const GRAIN_MS = 50; // ~20 quadros por segundo, só enquanto a abertura dura

const lines = (version: string): string[] => [
  `DANIEL v${version}`,
  'ESTAÇÃO BABILÔNIA · 539 A.C.',
  '',
  'BILHETERIA  000000',
  'RECORDE     539000',
  '',
  'PACOTES PARA FORA .... 0',
  "CONNECT-SRC .... 'NONE'",
  '',
  'MENE MENE TEQUEL UFARSIM',
];

// só a primeira e a última linha brilham (fósforo); o resto fica apagado
const GLOW = new Set([0, 9]);

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

function paintLog(all: string[], count: number): void {
  $('boot-log').replaceChildren(
    ...all
      .slice(0, count)
      .flatMap((line, i) => [...(i ? ['\n'] : []), el('span', line, GLOW.has(i) ? 'glow' : '')]),
  );
}

// Chuvisco: pontos claros e escuros num canvas pequeno, esticado sobre o tubo.
function grain(): () => void {
  const canvas = $<HTMLCanvasElement>('boot-grain');
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const image = ctx.createImageData(canvas.width, canvas.height);
  const paint = (): void => {
    for (let i = 0; i < image.data.length; i += 4) {
      const v = Math.random() * 255;
      image.data.set([v, v * 0.9, v * 0.75, Math.random() < 0.5 ? 40 : 0], i);
    }
    ctx.putImageData(image, 0, 0);
  };
  paint();
  const timer = setInterval(paint, GRAIN_MS);
  return () => clearInterval(timer);
}

export function boot(version: string): void {
  const screen = $('boot');
  if (reducedMotion || seen()) {
    screen.hidden = true;
    return;
  }
  const all = lines(version);
  const stopGrain = grain();
  let shown = 0;
  let done = false;

  const finish = (): void => {
    if (done) return;
    done = true;
    clearInterval(timer);
    paintLog(all, all.length);
    screen.classList.add('off');
    // prazo fixo, não o fim da animação: máquina lenta pula quadros, mas não segura a tela
    setTimeout(() => {
      stopGrain();
      screen.hidden = true;
    }, OFF_MS);
  };
  const timer = setInterval(() => {
    paintLog(all, ++shown);
    if (shown >= all.length) setTimeout(finish, HOLD_MS);
  }, LINE_MS);
  setTimeout(finish, all.length * LINE_MS + HOLD_MS);

  screen.addEventListener('click', finish);
  addEventListener('keydown', finish, { once: true });
}
