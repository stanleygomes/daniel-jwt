// Letreiro de plaquinhas: as letras giram e assentam da esquerda para a direita.

import { randomGlyph, reducedMotion } from './motion.ts';

const targets = new WeakMap<HTMLElement, string>();
const running = new WeakMap<HTMLElement, number>();

export function flap(el: HTMLElement, text: string, frames = 22): void {
  if (targets.get(el) === text) return;
  targets.set(el, text);
  cancelAnimationFrame(running.get(el) ?? 0);
  if (reducedMotion || !text) {
    el.textContent = text;
    return;
  }
  let frame = 0;
  const step = (): void => {
    const shown = Math.floor((text.length * ++frame) / frames);
    const spinning = Array.from(text.slice(shown), (c) => (/\s/.test(c) ? c : randomGlyph())).join('');
    el.textContent = text.slice(0, shown) + spinning;
    if (frame < frames) running.set(el, requestAnimationFrame(step));
  };
  step();
}
