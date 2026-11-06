// ↑↑↓↓←→←→BA: o lema vira (e desvira) Atbash, a cifra de Jeremias.

import { atbash } from '../atbash.ts';
import { $ } from '../dom.ts';
import { unlock } from './achievements.ts';
import { flap } from './text.ts';

const CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export function listenKonami(): void {
  const motto = $('motto');
  const original = motto.textContent ?? '';
  let typed: string[] = [];
  let ciphered = false;
  addEventListener('keydown', (event) => {
    typed = [...typed, event.key.length === 1 ? event.key.toLowerCase() : event.key].slice(-CODE.length);
    if (typed.join() !== CODE.join()) return;
    typed = [];
    ciphered = !ciphered;
    flap(motto, ciphered ? `${atbash(original)} (Jr 25:26)` : original, 60);
    unlock('konami');
  });
}
