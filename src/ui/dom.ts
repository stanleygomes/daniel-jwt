// Atalhos de DOM usados pelas telas.

export const $ = <T extends HTMLElement = HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

export const field = (id: string): HTMLTextAreaElement => $<HTMLTextAreaElement>(id);

export const el = (tag: string, text: string, className = ''): HTMLElement =>
  Object.assign(document.createElement(tag), { textContent: text, className });

export const pretty = (value: unknown): string => JSON.stringify(value, null, 2);

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
