import { AlertTriangle } from 'lucide-react';
import type { Segment } from '../types';
import { getSignalColor, getSignalLabel, hasScte35 } from '../utils/scte35';

interface SegmentRowProps {
  segment: Segment;
}

const colorClasses = {
  amber: 'border-amber-300 bg-amber-50',
  emerald: 'border-emerald-300 bg-emerald-50',
  violet: 'border-violet-300 bg-violet-50',
  yellow: 'border-yellow-300 bg-yellow-50',
} as const;

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function SegmentRow({ segment }: SegmentRowProps) {
  const isSignal = hasScte35(segment);
  const color = isSignal ? getSignalColor(segment.cue!.type) : null;

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        isSignal && color
          ? colorClasses[color]
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-900">{segment.uri}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <span>Duração: {segment.duration}s</span>
            {segment.mediaSequence !== undefined && (
              <span>Seq: {segment.mediaSequence}</span>
            )}
            {segment.timestamp && <span>Detectado: {formatTimestamp(segment.timestamp)}</span>}
            {segment.dateTimeString && <span>PTS: {segment.dateTimeString}</span>}
          </div>
        </div>

        {isSignal && (
          <div className="flex shrink-0 items-center gap-2 text-amber-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-semibold">SCTE-35</span>
          </div>
        )}
      </div>

      {isSignal && segment.cue && (
        <div className="mt-3 rounded-lg border border-white/60 bg-white/80 p-3 text-sm">
          <h4 className="mb-2 font-semibold text-slate-800">Detalhes do sinal</h4>
          <dl className="grid gap-1 sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Tipo</dt>
              <dd className="font-medium">{getSignalLabel(segment.cue.type)}</dd>
            </div>
            {segment.cue.duration !== undefined && (
              <div>
                <dt className="text-slate-500">Duração</dt>
                <dd className="font-medium">{segment.cue.duration}s</dd>
              </div>
            )}
            {segment.cue.programId && (
              <div>
                <dt className="text-slate-500">Program ID</dt>
                <dd className="font-mono text-xs">{segment.cue.programId}</dd>
              </div>
            )}
            {segment.cue.spliceEventId && (
              <div>
                <dt className="text-slate-500">Splice Event ID</dt>
                <dd className="font-mono text-xs">{segment.cue.spliceEventId}</dd>
              </div>
            )}
            {segment.cue.uniqueProgramId !== undefined && (
              <div>
                <dt className="text-slate-500">Unique Program ID</dt>
                <dd className="font-medium">{segment.cue.uniqueProgramId}</dd>
              </div>
            )}
            {segment.cue.outOfNetwork !== undefined && (
              <div>
                <dt className="text-slate-500">Out of Network</dt>
                <dd className="font-medium">{segment.cue.outOfNetwork ? 'Sim' : 'Não'}</dd>
              </div>
            )}
            {segment.cue.base64Payload && (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Payload</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                  {segment.cue.base64Payload.slice(0, 120)}
                  {segment.cue.base64Payload.length > 120 ? '…' : ''}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
