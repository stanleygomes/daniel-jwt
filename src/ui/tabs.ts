// Abas acessíveis: cada [role="tab"] mostra a seção do seu data-tab.

import { $ } from './dom.ts';

export function setupTabs(): void {
  const tabs = [...document.querySelectorAll<HTMLElement>('[role="tab"]')];
  const select = (name?: string): void => {
    for (const tab of tabs) {
      const selected = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(selected));
      $(tab.dataset.tab ?? '').hidden = !selected;
    }
  };
  for (const tab of tabs) tab.addEventListener('click', () => select(tab.dataset.tab));
}
