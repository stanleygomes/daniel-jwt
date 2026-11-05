// Ícones Lucide empacotados no build (SVG inline, nada vem de fora).

import {
  Check,
  Code,
  Copy,
  createElement,
  KeyRound,
  Moon,
  ScrollText,
  ShieldCheck,
  ShieldX,
  Stamp,
  Sun,
} from 'lucide';

const ICONS = {
  sun: Sun,
  moon: Moon,
  copy: Copy,
  check: Check,
  decode: ScrollText,
  encode: Stamp,
  valid: ShieldCheck,
  invalid: ShieldX,
  code: Code,
  key: KeyRound,
};

export type IconName = keyof typeof ICONS;

export const icon = (name: IconName, size = 18): SVGElement =>
  createElement(ICONS[name], { width: size, height: size, class: 'icon', 'aria-hidden': 'true' });

// Troca cada <span data-icon="nome"> do HTML pelo SVG.
export function mountIcons(): void {
  for (const slot of document.querySelectorAll<HTMLElement>('[data-icon]')) {
    slot.replaceWith(icon(slot.dataset.icon as IconName));
  }
}
