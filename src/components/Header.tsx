import { Radio, Activity } from 'lucide-react';

interface HeaderProps {
  isMonitoring: boolean;
  isFetching: boolean;
}

export function Header({ isMonitoring, isFetching }: HeaderProps) {
  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-600/20">
            <Radio size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">HLS SCTE-35 Monitor</h1>
            <p className="text-sm text-slate-500">
              Monitoramento em tempo real de marcadores SCTE-35 em streams HLS
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isFetching && (
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Activity size={14} className="animate-pulse" />
            Atualizando...
          </span>
        )}
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            isMonitoring
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isMonitoring ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          {isMonitoring ? 'Monitorando' : 'Parado'}
        </span>
      </div>
    </header>
  );
}
