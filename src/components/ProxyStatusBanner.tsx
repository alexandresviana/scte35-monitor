import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type ProxyStatus = 'checking' | 'ok' | 'html' | 'error';

const TEST_URL =
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8';

export function ProxyStatusBanner() {
  const [status, setStatus] = useState<ProxyStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    async function checkProxy() {
      try {
        const response = await fetch(
          `/proxy?url=${encodeURIComponent(TEST_URL)}`,
          { cache: 'no-store' }
        );
        const text = (await response.text()).trim();

        if (cancelled) return;

        if (text.startsWith('#EXTM3U')) {
          setStatus('ok');
          return;
        }

        if (text.startsWith('<!DOCTYPE') || text.startsWith('<!doctype') || text.startsWith('<html')) {
          setStatus('html');
          return;
        }

        setStatus('error');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    checkProxy();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'checking' || status === 'ok') return null;

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Proxy CORS indisponível neste deploy</p>
          <p className="mt-1">
            {status === 'html'
              ? 'A rota /proxy está devolvendo HTML (index.html) em vez do manifest HLS. Isso acontece quando o deploy estático não inclui o Worker.'
              : 'Não foi possível validar o endpoint /proxy.'}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Build command: <code className="rounded bg-amber-100 px-1">npm run build</code></li>
            <li>Output directory: <code className="rounded bg-amber-100 px-1">dist</code></li>
            <li>Faça redeploy do último commit no GitHub (inclui <code className="rounded bg-amber-100 px-1">dist/_worker.js</code>)</li>
            <li>Ou desative o proxy e use um manifest com CORS liberado</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ProxyStatusOk() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch(`/proxy?url=${encodeURIComponent(TEST_URL)}`, { cache: 'no-store' })
      .then((r) => r.text())
      .then((t) => setOk(t.trim().startsWith('#EXTM3U')))
      .catch(() => setOk(false));
  }, []);

  if (!ok) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
      <CheckCircle2 size={14} />
      Proxy ativo
    </span>
  );
}
