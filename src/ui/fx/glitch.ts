// Defeito analógico de TV antiga, sempre ligado a um evento e de vida curta:
// assinatura inválida = rasgo horizontal + estática; troca de tema = desmagnetização.

import { reducedMotion } from './motion.ts';

const SLICES = 4;

// Rasgo: 4 fatias clonadas do elemento escorregam para os lados e somem (~180ms).
export function tear(target: HTMLElement): void {
  if (reducedMotion) return;
  const box = target.getBoundingClientRect();
  for (let i = 0; i < SLICES; i++) {
    const slice = target.cloneNode(true) as HTMLElement;
    slice.removeAttribute('id');
    slice.removeAttribute('role');
    slice.setAttribute('aria-hidden', 'true');
    slice.classList.add('tear-slice');
    const top = (100 / SLICES) * i;
    Object.assign(slice.style, {
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      clipPath: `inset(${top}% 0 ${100 - top - 100 / SLICES}% 0)`,
    });
    slice.style.setProperty('--dx', `${(i % 2 ? 1 : -1) * (4 + Math.round(Math.random() * 6))}px`);
    slice.addEventListener('animationend', () => slice.remove());
    document.body.append(slice);
  }
  restart(target, 'static');
}

// Desmagnetização (degauss): a página toda tremula de cor e endireita em 1s.
export function degauss(): void {
  if (!reducedMotion) restart(document.documentElement, 'degauss');
}

function restart(target: HTMLElement, className: string): void {
  target.classList.remove(className);
  void target.offsetWidth; // reinicia se vier outro em seguida
  target.classList.add(className);
  setTimeout(() => target.classList.remove(className), 1000);
}
