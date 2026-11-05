// Quem pediu menos animação no sistema recebe a página estática.
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export const randomGlyph = (): string => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
