// Abas acessíveis: cada [role="tab"] mostra a seção do seu data-tab.

import { $ } from './dom.ts';

const tabs = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[role="tab"]')];

export function showTab(name?: string): void {
  for (const tab of tabs()) {
    const selected = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(selected));
    $(tab.dataset.tab ?? '').hidden = !selected;
  }
}

export function setupTabs(): void {
  for (const tab of tabs()) tab.addEventListener('click', () => showTab(tab.dataset.tab));
}
