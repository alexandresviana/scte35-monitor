import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function corsProxyPlugin(): Plugin {
  return {
    name: 'cors-proxy',
    configureServer(server) {
      server.middlewares.use('/proxy', async (req, res) => {
        const requestUrl = new URL(req.url ?? '', 'http://localhost');
        const target = requestUrl.searchParams.get('url');

        if (!target) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Missing url query parameter');
          return;
        }

        try {
          const response = await fetch(target, {
            headers: {
              Accept: 'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain, */*',
            },
          });

          const body = await response.text();
          res.statusCode = response.status;
          res.setHeader(
            'Content-Type',
            response.headers.get('content-type') ?? 'application/vnd.apple.mpegurl'
          );
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(body);
        } catch (error) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(error instanceof Error ? error.message : 'Proxy fetch failed');
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), corsProxyPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    open: true,
  },
});
