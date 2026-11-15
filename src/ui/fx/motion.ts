// Quem pediu menos animação no sistema recebe a página estática.
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
