import { Clock3 } from 'lucide-react';
import type { Scte35Event } from '../types';
import { getSignalColor, getSignalLabel } from '../utils/scte35';

interface EventLogProps {
  events: Scte35Event[];
}

const badgeColors = {
  amber: 'bg-amber-100 text-amber-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  violet: 'bg-violet-100 text-violet-800',
  yellow: 'bg-yellow-100 text-yellow-800',
} as const;

export function EventLog({ events }: EventLogProps) {
  const recent = [...events].reverse().slice(0, 50);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Log de eventos SCTE-35</h3>
        <span className="text-xs text-slate-500">{events.length} eventos</span>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum evento SCTE-35 detectado ainda.</p>
      ) : (
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {recent.map((event) => {
            const color = getSignalColor(event.cue.type);
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <Clock3 size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">
                      {event.detectedAt.toLocaleTimeString('pt-BR', { hour12: false })}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColors[color]}`}
                    >
                      {getSignalLabel(event.cue.type)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-700">{event.segmentUri}</p>
                  {event.cue.duration !== undefined && (
                    <p className="text-xs text-slate-500">Duração: {event.cue.duration}s</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
