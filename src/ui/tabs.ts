// Abas acessíveis: cada [role="tab"] mostra a seção do seu data-tab.
// Setas trocam de aba, Home/End vão para a primeira/última (padrão WAI-ARIA).

import { $ } from './dom.ts';

const tabs = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[role="tab"]')];

export function showTab(name?: string): void {
  for (const tab of tabs()) {
    const selected = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $(tab.dataset.tab ?? '').hidden = !selected;
  }
}

function moveFocus(event: KeyboardEvent): void {
  const all = tabs();
  const current = all.indexOf(event.target as HTMLElement);
  const rtl = getComputedStyle(event.target as HTMLElement).direction === 'rtl';
  const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[event.key];
  let next: number;
  if (step) next = (current + step + all.length) % all.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = all.length - 1;
  else return;
  event.preventDefault();
  all[next].focus();
  showTab(all[next].dataset.tab);
}

export function setupTabs(): void {
  for (const tab of tabs()) {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
    tab.addEventListener('keydown', moveFocus);
  }
}
