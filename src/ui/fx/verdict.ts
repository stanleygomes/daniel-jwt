// Fim de fase em tela cheia quando a assinatura passa a ser válida.

import { $ } from '../dom.ts';
import { reducedMotion } from './motion.ts';

export function flashVerdict(): void {
  if (reducedMotion) return;
  const overlay = $('verdict');
  overlay.textContent = 'STAGE CLEAR';
  overlay.className = 'verdict ok';
  void overlay.offsetWidth; // reinicia a animação se vier outro em seguida
  overlay.classList.add('show');
}
