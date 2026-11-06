// Quem pediu menos animação no sistema recebe a página estática.
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Plaquinhas de letreiro antigo: maiúsculas e números.
export const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const randomGlyph = (): string => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
