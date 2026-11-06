// Barra de vida do token (exp): esvazia ao vivo, como num jogo de luta.

import type { Json } from '../../jwt/token.ts';
import { lifeLeft } from '../claims.ts';
import { $ } from '../dom.ts';

let current: Json | null = null;
let timer = 0;

function paint(): void {
  const box = $('d-life');
  const life = current ? lifeLeft(current) : null;
  box.hidden = life === null;
  if (life === null) return;
  const percent = Math.round(life * 100);
  box.dataset.level = life > 0.5 ? 'high' : life > 0.2 ? 'mid' : 'low';
  box.style.setProperty('--life', String(life));
  $('d-life-text').textContent = life === 0 ? 'K.O.' : `${percent}%`;
}

export function showLife(payload: Json | null): void {
  current = payload;
  paint();
  window.clearInterval(timer);
  if (payload) timer = window.setInterval(paint, 1000);
}
