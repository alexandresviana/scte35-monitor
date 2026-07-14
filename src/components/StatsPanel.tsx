import type { MonitorStats } from '../types';

interface StatsPanelProps {
  stats: MonitorStats;
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      <StatCard label="Segmentos" value={stats.totalSegments} />
      <StatCard label="SCTE-35" value={stats.scte35Count} accent="text-amber-600" />
      <StatCard label="Cue Out" value={stats.cueOutCount} accent="text-orange-600" />
      <StatCard label="Cue In" value={stats.cueInCount} accent="text-emerald-600" />
      <StatCard label="Sinais" value={stats.signalCount} accent="text-violet-600" />
      <StatCard
        label="Último sinal"
        value={
          stats.lastSignalAt
            ? stats.lastSignalAt.toLocaleTimeString('pt-BR', { hour12: false })
            : '—'
        }
      />
      <StatCard
        label="Stream"
        value={stats.isLive ? 'Live' : 'VOD'}
        accent={stats.isLive ? 'text-emerald-600' : 'text-slate-600'}
      />
    </div>
  );
}
