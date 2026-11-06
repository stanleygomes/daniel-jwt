// Atbash: a cifra de Jeremias 25:26 ("Sheshach" = Babel). A primeira letra vira a última,
// a segunda a penúltima... Aqui no alfabeto latino, sem acento. Aplicar duas vezes desfaz.

const A = 'a'.charCodeAt(0);
const Z = 'z'.charCodeAt(0);

export function atbash(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/[a-z]/gi, (c) => {
      const lower = c.toLowerCase();
      const swapped = String.fromCharCode(Z - (lower.charCodeAt(0) - A));
      return c === lower ? swapped : swapped.toUpperCase();
    });
}
