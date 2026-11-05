// Efeitos de texto: "descriptografar" (embaralha e revela) e digitar.

import { randomGlyph, reducedMotion } from './motion.ts';

const FRAMES = 22;
const targets = new WeakMap<HTMLElement, string>();
const running = new WeakMap<HTMLElement, number>();

export function decrypt(el: HTMLElement, text: string): void {
  if (targets.get(el) === text) return;
  targets.set(el, text);
  cancelAnimationFrame(running.get(el) ?? 0);
  if (reducedMotion || !text) {
    el.textContent = text;
    return;
  }
  let frame = 0;
  const step = (): void => {
    const shown = Math.floor((text.length * ++frame) / FRAMES);
    const noise = Array.from(text.slice(shown), (c) => (/\s/.test(c) ? c : randomGlyph())).join('');
    el.textContent = text.slice(0, shown) + noise;
    if (frame < FRAMES) running.set(el, requestAnimationFrame(step));
  };
  step();
}

export function typeText(el: HTMLElement, text: string, delay = 32): void {
  if (reducedMotion) {
    el.textContent = text;
    return;
  }
  let i = 0;
  el.textContent = '';
  const timer = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i >= text.length) clearInterval(timer);
  }, delay);
}
