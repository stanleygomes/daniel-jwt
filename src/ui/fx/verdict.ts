// Fim de fase em tela cheia quando a assinatura muda de estado.

import { $ } from '../dom.ts';
import { reducedMotion } from './motion.ts';

const TEXT = { ok: 'STAGE CLEAR', bad: 'GAME OVER' };

export function flashVerdict(kind: 'ok' | 'bad'): void {
  if (reducedMotion) return;
  const overlay = $('verdict');
  overlay.textContent = TEXT[kind];
  overlay.className = `verdict ${kind}`;
  void overlay.offsetWidth; // reinicia a animação se vier outro em seguida
  overlay.classList.add('show');
}
