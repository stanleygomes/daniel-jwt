# 📜 Daniel

Decodifique, verifique e assine JWT direto no navegador. Nada sai da sua máquina.

> "Os teus presentes fiquem contigo; todavia lerei ao rei a escritura." (Daniel 5:17)

![Tela do Daniel](docs/screenshot.jpg)

## Por que confiar

Não confie: confira. A criptografia inteira cabe em [`src/jwt/`](src/jwt) (~150 linhas).

- **Sem rede.** A CSP de [`vercel.json`](vercel.json) tem `connect-src 'none'`: o navegador não envia nada.
- **Sem servidor.** Assinatura e verificação usam a WebCrypto nativa.
- **Sem rastreio.** Nada de cookie, analytics, CDN ou script de terceiros. Fontes (Bungee, Rajdhani, Share Tech Mono) e ícones são servidos pelo próprio site.
- **Rastreável.** Cada release tem atestação de proveniência; o rodapé mostra o commit no ar.
- **Ao vivo.** A tela conta as requisições para fora e os bloqueios da CSP. Ou abra o DevTools.

## Funciona com

| Família | Algoritmos | Chave |
| --- | --- | --- |
| HMAC | HS256, HS384, HS512 | segredo |
| RSA | RS256…512, PS256…512 | PEM (PKCS#8/SPKI) ou JWK |
| ECDSA | ES256, ES384, ES512 | PEM (PKCS#8/SPKI) ou JWK |
| EdDSA | Ed25519 | PEM (PKCS#8/SPKI) ou JWK |

## Rodar

Node 24+.

```bash
npm install
npm run dev       # desenvolvimento
npm test          # testes (node --test, TypeScript direto)
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
