# 📜 Daniel

Decodifique, verifique e assine JWT direto no navegador. Nada sai da sua máquina.

> "Os teus presentes fiquem contigo; todavia lerei ao rei a escritura." (Daniel 5:17)

![Tela do Daniel](docs/screenshot.jpg)

## Por que Daniel

Em Daniel 5, uma mão escreve na parede do palácio de Belsazar: *Mene, Mene, Tequel, Ufarsim*. Nenhum sábio da Babilônia consegue ler. Daniel recusa os presentes do rei e decifra de graça: **Mene**, contado (seu reino chegou ao fim); **Tequel**, pesado na balança e achado em falta; **Peres**, dividido. O site faz o mesmo com o JWT: lê o token, pesa a assinatura (inválida = Tequel), mostra as três partes em que ele se divide e não fica com nada seu.

## Transparência

Este site lê seu token e não leva nada. Não confie: confira. Tudo o que está abaixo dá para checar sem acreditar em ninguém.

### O que o site promete

| Promessa | Como é garantido |
| --- | --- |
| **Nada sai do navegador** | A CSP de [`vercel.json`](vercel.json) tem `connect-src 'none'`: o navegador recusa qualquer `fetch`, XHR, WebSocket ou beacon. |
| **Sem injeção de script** | A CSP exige Trusted Types (`require-trusted-types-for 'script'`, sem nenhuma política): `innerHTML` e afins com texto são recusados pelo navegador. A tela só usa `textContent`. |
| **Nada gravado** | Token e chave ficam só nos campos da tela: nunca vão para cookie, `localStorage`, `sessionStorage` ou URL (há teste e2e para isso). O navegador só guarda o tema e as conquistas. |
| **Sem servidor** | Assinar e verificar usam a WebCrypto nativa do navegador. Não existe API. |
| **Sem rastreio** | Nada de cookie, analytics, CDN ou script de terceiros. Fontes (Bungee, Bungee Shade, Overpass, Press Start 2P) e ícones (Lucide) vêm do próprio site. |
| **Código pequeno e aberto** | A criptografia inteira cabe em [`src/jwt/`](src/jwt) (~150 linhas). A tela fica em [`src/ui/`](src/ui). O JS publicado não importa nada de fora. |
| **Build rastreável** | Cada release tem atestação de proveniência assinada pelo GitHub. O rodapé mostra a versão e o commit no ar, com link para o código exato. |

### Contadores ao vivo

No painel de transparência, no fim da página:

| Contador | O que mede |
| --- | --- |
| **Pacotes para fora** | Quantos arquivos a página baixou de outro domínio (`PerformanceObserver`, o mesmo dado da aba Network). Deve ficar em 0. |
| **Bloqueios da CSP** | Quantas vezes o navegador barrou algo proibido, como uma tentativa de enviar dados. Se alguém adulterar o JS para vazar seu token, sobe. |

### Confira você mesmo

1. **Rede:** abra o DevTools na aba Network, cole um token e veja que nenhuma requisição sai.
2. **CSP no ar:** `curl -sI https://daniel-jwt.vercel.app | grep -i content-security-policy`
3. **Código:** leia [`src/jwt/`](src/jwt) antes de colar um token de produção.
4. **Release:** `gh attestation verify daniel-jwt-vX.Y.Z.zip --repo stanleygomes/daniel-jwt`
5. **Offline:** baixe o zip da release (ou clone e `npm run build`), sirva o `dist/` localmente e desligue a internet.

## Funciona com

| Família | Algoritmos |
| --- | --- |
| HMAC | HS256, HS384, HS512 |
| RSA | RS256…512, PS256…512 |
| ECDSA | ES256, ES384, ES512 |
| EdDSA | Ed25519 |

Chaves aceitas:

- **Segredo** (HMAC), em texto ou base64.
- **PEM**: `PUBLIC KEY`, `PRIVATE KEY`, `RSA PUBLIC/PRIVATE KEY` (PKCS#1), `EC PRIVATE KEY` (SEC1).
- **Certificado X.509** (`BEGIN CERTIFICATE`): usa a chave pública de dentro.
- **JWK** e **JWKS** colado (`{"keys": [...]}`): escolhe a chave pelo `kid` do token.
- Para verificar, a chave privada também serve: a pública é derivada dela.

Buscar JWKS por URL fica de fora de propósito: o site não faz requisição nenhuma.

## Rodar

Node 24+.

```bash
npm install
npm run dev       # desenvolvimento
npm test          # testes unitários (node --test, TypeScript direto)
npm run test:e2e  # site real no Chromium, Firefox e WebKit (Playwright)
npm run lint      # Biome: lint + formatação (papel do ESLint + Prettier)
npm run build     # tsc + vite build → dist/
npm run preview   # serve o dist/ com a mesma CSP da produção
```

## Deploy

Vercel: importe o repo. O preset Vite é detectado sozinho; o `vercel.json` só adiciona os cabeçalhos de segurança.

## Release

```bash
npm version patch   # ou minor / major: sobe o package.json, commita e cria a tag
git push --follow-tags
```

A tag dispara o [`release.yml`](.github/workflows/release.yml): testa, gera o build e publica a release com
o site em zip, o `SHA256SUMS` e uma [atestação de proveniência](https://docs.github.com/actions/security-for-github-actions/using-artifact-attestations)
assinada pelo GitHub. Para conferir que o zip veio deste repositório:

```bash
gh attestation verify daniel-jwt-v1.0.0.zip --repo stanleygomes/daniel-jwt
```

O rodapé do site mostra a versão e o commit que está no ar.

## Licença

[MIT](LICENSE)
