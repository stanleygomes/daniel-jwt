// Carimbo em tela cheia quando a assinatura passa a ser válida (comemoração pode cobrir a tela).

import { $ } from '../dom.ts';
import { reducedMotion } from './motion.ts';

export function flashVerdict(): void {
  if (reducedMotion) return;
  const overlay = $('verdict');
  $('verdict-stamp').textContent = 'AUTÊNTICO';
  overlay.classList.remove('show');
  void overlay.offsetWidth; // reinicia a animação se vier outro em seguida
  overlay.classList.add('show');
}
