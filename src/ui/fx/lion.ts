// O leão da cova, em desenho animado dos anos 1930: cabeça de juba redonda e olho de pizza.
// Montado com createElementNS (a CSP proíbe innerHTML) em cada <span class="lion">.

const SVG = 'http://www.w3.org/2000/svg';

type Shape = [tag: string, className: string, attrs: Record<string, number | string>];

const MANE = Array.from({ length: 10 }, (_, i): Shape => {
  const angle = (i * Math.PI) / 5;
  const cx = (32 + 20 * Math.cos(angle)).toFixed(1);
  const cy = (34 + 20 * Math.sin(angle)).toFixed(1);
  return ['circle', 'lion-mane', { cx, cy, r: 9 }];
});

const SHAPES: Shape[] = [
  ...MANE,
  ['circle', 'lion-mane', { cx: 32, cy: 34, r: 20 }],
  ['circle', 'lion-face', { cx: 21, cy: 22, r: 5 }],
  ['circle', 'lion-face', { cx: 43, cy: 22, r: 5 }],
  ['circle', 'lion-face', { cx: 32, cy: 35, r: 15 }],
  ['ellipse', 'lion-ink', { cx: 26.5, cy: 31, rx: 2.6, ry: 4 }],
  ['ellipse', 'lion-ink', { cx: 37.5, cy: 31, rx: 2.6, ry: 4 }],
  // o "pedaço de pizza" que falta no olho de desenho antigo
  ['path', 'lion-face-cut', { d: 'M26.5 31L28 27.4L29.4 29.6Z' }],
  ['path', 'lion-face-cut', { d: 'M37.5 31L39 27.4L40.4 29.6Z' }],
  ['ellipse', 'lion-muzzle', { cx: 32, cy: 41, rx: 8, ry: 5.5 }],
  ['path', 'lion-ink', { d: 'M29 37.5H35L32 40.5Z' }],
  ['path', 'lion-line', { d: 'M28 43.5Q32 46.5 36 43.5' }],
];

function draw(): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('aria-hidden', 'true');
  for (const [tag, className, attrs] of SHAPES) {
    const shape = document.createElementNS(SVG, tag);
    shape.setAttribute('class', className);
    for (const [name, value] of Object.entries(attrs)) shape.setAttribute(name, String(value));
    svg.append(shape);
  }
  return svg;
}

export function mountLions(): void {
  for (const slot of document.querySelectorAll('.lion')) slot.replaceChildren(draw());
}
