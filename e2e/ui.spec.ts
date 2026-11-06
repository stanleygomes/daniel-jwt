import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { openApp } from './helpers.ts';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('abas trocam a seção e o aria-selected', async ({ page }) => {
  await openApp(page);
  const encode = page.getByRole('tab', { name: 'Selar' });
  await encode.click();
  await expect(encode).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#encode')).toBeVisible();
  await expect(page.locator('#decode')).toBeHidden();
});

test('tema segue o sistema e lembra a escolha', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'reduce' });
  const page = await context.newPage();
  await openApp(page);
  const theme = () => page.evaluate(() => document.documentElement.dataset.theme);
  expect(await theme()).toBe('light');
  await page.locator('#theme').click();
  expect(await theme()).toBe('dark');
  await page.reload();
  expect(await theme()).toBe('dark');
  await expect(page.locator('#theme')).toHaveAttribute('title', 'Mudar para o tema claro');
  await context.close();
});

test('ícones montados e rodapé com versão e commit', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('[data-icon]')).toHaveCount(0);
  await expect(page.locator('svg.icon').first()).toBeVisible();
  await expect(page.locator('#build')).toContainText(`v${version} · commit`);
});

test('celular: sem rolagem lateral', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 800 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await openApp(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await context.close();
});

test.describe('com animação', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('boot aparece na 1ª visita, pula com tecla e não volta na sessão', async ({ page }) => {
    await page.goto('/');
    const boot = page.locator('#boot');
    await expect(boot).toBeVisible();
    await expect(page.locator('#boot-log')).toContainText('BABILÔNIA');
    await page.keyboard.press('Enter');
    await expect(boot).toBeHidden();
    await page.reload();
    await expect(boot).toBeHidden();
  });

  test('veredito pisca em tela cheia quando a assinatura muda', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Enter');
    await expect(page.locator('#d-status')).toHaveText('Assinatura válida.');
    await page.locator('#d-key').fill('outro');
    await expect(page.locator('#verdict')).toHaveClass(/show/);
    await expect(page.locator('#verdict')).toHaveText('GAME OVER');
  });
});

test('com animação reduzida: sem boot', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#boot')).toBeHidden();
});

test('código Konami cifra o lema em Atbash e desfaz', async ({ page }) => {
  await openApp(page);
  const motto = page.locator('#motto');
  const konami = async () => {
    for (const key of [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ]) {
      await page.keyboard.press(key);
    }
  };
  await konami();
  await expect(motto).toHaveText(/^Nvmv, Nvmv, Gvjfvo.*\(Jr 25:26\)$/);
  await expect(page.locator('#hud-lives')).toHaveText('♥×30');
  await expect(page.locator('.toast')).toContainText('Achou a cifra de Jeremias');
  await konami();
  await expect(motto).toHaveText('Mene, Mene, Tequel: decifre seu JWT sem entregá-lo a ninguém.');
});

test('conquista aparece uma vez só, e não pelo exemplo inicial', async ({ page }) => {
  await openApp(page);
  await expect(page.locator('.toast')).toHaveCount(0);
  await page.locator('#d-key').fill('errado');
  await expect(page.locator('.toast')).toContainText('Tequel');
  await page.locator('#d-key').fill('mene-mene-tequel-ufarsim');
  await page.locator('#d-key').fill('errado de novo');
  await expect(page.locator('.toast')).toHaveCount(1);
});

test('placar: assinatura errada tira vida, a certa devolve e dá pontos', async ({ page }) => {
  await openApp(page);
  const lives = page.locator('#hud-lives');
  await expect(lives.locator('i:not(.lost)')).toHaveCount(3);
  await page.locator('#d-key').fill('errado');
  await expect(lives.locator('i:not(.lost)')).toHaveCount(2);
  await page.locator('#d-key').fill('mene-mene-tequel-ufarsim');
  await expect(lives.locator('i:not(.lost)')).toHaveCount(3);
  // 500 da conquista Tequel + 100 da assinatura válida
  await expect(page.locator('#hud-score')).toHaveText('000600');
  await expect(page.locator('#hud-hi')).toHaveText('000600');
});

test('sem vidas aparece CONTINUE?', async ({ page }) => {
  await openApp(page);
  for (let i = 0; i < 3; i++) {
    await page.locator('#d-key').fill(`errado ${i}`);
    await expect(page.locator('#d-status')).toHaveClass(/bad/);
    await page.locator('#d-key').fill('');
    await expect(page.locator('#d-status')).not.toHaveClass(/bad/);
  }
  await expect(page.locator('#hud-lives')).toHaveText('CONTINUE?');
});

test('campo vazio pede INSERT TOKEN', async ({ page }) => {
  await openApp(page);
  await page.locator('#d-token').fill('');
  await expect(page.locator('#d-status')).toHaveText('INSERT TOKEN');
});
