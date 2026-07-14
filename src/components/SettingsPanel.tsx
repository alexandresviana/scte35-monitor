import { Settings2 } from 'lucide-react';
import type { MonitorSettings } from '../types';

interface SettingsPanelProps {
  settings: MonitorSettings;
  onChange: (settings: MonitorSettings) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const update = <K extends keyof MonitorSettings>(key: K, value: MonitorSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Settings2 size={18} className="text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-800">Configurações</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Intervalo de polling (ms)</span>
          <input
            type="number"
            min={1000}
            step={500}
            value={settings.pollIntervalMs}
            onChange={(e) => update('pollIntervalMs', Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Máx. segmentos no histórico</span>
          <input
            type="number"
            min={100}
            step={100}
            value={settings.maxSegments}
            onChange={(e) => update('maxSegments', Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm">
          <input
            type="checkbox"
            checked={settings.useCorsProxy}
            onChange={(e) => update('useCorsProxy', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span>Usar proxy CORS (/proxy)</span>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm">
          <input
            type="checkbox"
            checked={settings.autoStart}
            onChange={(e) => update('autoStart', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span>Iniciar monitoramento automaticamente</span>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm">
          <input
            type="checkbox"
            checked={settings.alertOnSignal}
            onChange={(e) => update('alertOnSignal', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span>Alerta sonoro em novo SCTE-35</span>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm">
          <input
            type="checkbox"
            checked={settings.showOnlySignals}
            onChange={(e) => update('showOnlySignals', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span>Filtrar apenas sinais por padrão</span>
        </label>
      </div>
    </div>
  );
}
