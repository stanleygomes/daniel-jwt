// Mapa da linha: cada parte do token é uma estação, e um trem percorre a linha.

import { $ } from '../dom.ts';

export function showRoute(token: string | null): void {
  const route = $('d-route');
  const parts = token?.split('.') ?? [];
  route.querySelectorAll('small').forEach((small, i) => {
    small.textContent = parts[i] === undefined ? '—' : `${parts[i].length} caracteres`;
  });
  route.classList.toggle('off', !token);
  route.classList.remove('run');
  void route.offsetWidth; // reinicia o trem a cada token novo
  if (token) route.classList.add('run');
}
