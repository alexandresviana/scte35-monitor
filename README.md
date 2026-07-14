# SCTE-35 Monitor

Monitor web HLS em tempo real para detecção de marcadores SCTE-35.

## Cloudflare Pages

Configuração recomendada:

| Campo | Valor |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

O build gera automaticamente `dist/_worker.js`, que implementa o proxy CORS em `/proxy`.

### Problema comum: tags HTML nos segmentos

Se o monitor mostra `<!doctype html>` ou tags HTML nos segmentos, a rota `/proxy` está devolvendo o `index.html` do SPA em vez do manifest `.m3u8`.

**Causa:** deploy apenas estático, sem o Worker.

**Solução:**
1. Conecte o projeto ao GitHub (deploy automático)
2. Confirme build `npm run build` → output `dist`
3. Faça redeploy do branch `main`
4. Teste: `https://SEU-DOMINIO/proxy?url=URL_DO_MANIFEST` deve começar com `#EXTM3U`

### Desenvolvimento local

```bash
npm install
npm run dev
```

O proxy local funciona via middleware do Vite em `http://localhost:5173/proxy`.
