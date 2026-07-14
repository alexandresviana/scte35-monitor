import { Play, Pause, RotateCcw, Trash2 } from 'lucide-react';

interface ManifestInputProps {
  manifestUrl: string;
  isMonitoring: boolean;
  onManifestUrlChange: (url: string) => void;
  onToggleMonitoring: () => void;
  onRefresh: () => void;
  onClearHistory: () => void;
}

export function ManifestInput({
  manifestUrl,
  isMonitoring,
  onManifestUrlChange,
  onToggleMonitoring,
  onRefresh,
  onClearHistory,
}: ManifestInputProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <input
        type="url"
        value={manifestUrl}
        onChange={(e) => onManifestUrlChange(e.target.value)}
        placeholder="Cole a URL do manifest HLS (.m3u8)"
        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleMonitoring}
          disabled={!manifestUrl.trim()}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isMonitoring
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isMonitoring ? (
            <>
              <Pause size={18} /> Parar
            </>
          ) : (
            <>
              <Play size={18} /> Iniciar
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={!manifestUrl.trim() || !isMonitoring}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw size={18} /> Atualizar
        </button>

        <button
          type="button"
          onClick={onClearHistory}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Trash2 size={18} /> Limpar
        </button>
      </div>
    </div>
  );
}
