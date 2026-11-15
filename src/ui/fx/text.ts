// Máquina de escrever: as letras aparecem da esquerda para a direita.
// O resto do texto fica invisível no lugar, para a linha não pular.

import { el } from '../dom.ts';
import { reducedMotion } from './motion.ts';

const targets = new WeakMap<HTMLElement, string>();
const running = new WeakMap<HTMLElement, number>();

export function typeOut(target: HTMLElement, text: string, frames = 40): void {
  if (targets.get(target) === text) return;
  targets.set(target, text);
  cancelAnimationFrame(running.get(target) ?? 0);
  if (reducedMotion || !text) {
    target.textContent = text;
    return;
  }
  let frame = 0;
  const step = (): void => {
    const shown = Math.floor((text.length * ++frame) / frames);
    if (frame >= frames) {
      target.textContent = text;
      return;
    }
    target.replaceChildren(text.slice(0, shown), el('span', text.slice(shown), 'unwritten'));
    running.set(target, requestAnimationFrame(step));
  };
  step();
}
