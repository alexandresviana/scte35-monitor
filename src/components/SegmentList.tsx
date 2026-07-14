import { Download, RefreshCw, Search } from 'lucide-react';
import type { Segment, SegmentFilter } from '../types';
import { hasScte35 } from '../utils/scte35';
import { SegmentRow } from './SegmentRow';

interface SegmentListProps {
  segments: Segment[];
  filter: SegmentFilter;
  searchQuery: string;
  maxSegments: number;
  lastUpdate: Date | null;
  onFilterChange: (filter: SegmentFilter) => void;
  onSearchChange: (query: string) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
}

export function SegmentList({
  segments,
  filter,
  searchQuery,
  maxSegments,
  lastUpdate,
  onFilterChange,
  onSearchChange,
  onExportJson,
  onExportCsv,
}: SegmentListProps) {
  const filtered = segments
    .filter((segment) => {
      if (filter === 'scte35') return hasScte35(segment);
      if (filter === 'normal') return !hasScte35(segment);
      return true;
    })
    .filter((segment) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        segment.uri.toLowerCase().includes(q) ||
        segment.cue?.type.toLowerCase().includes(q) ||
        segment.cue?.programId?.toLowerCase().includes(q)
      );
    })
    .slice()
    .reverse();

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 p-4">
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Monitor de segmentos</h2>
            <p className="text-sm text-slate-500">
              Exibindo {filtered.length} de {segments.length} (máx. {maxSegments})
            </p>
          </div>

          {lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <RefreshCw size={14} />
              Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', { hour12: false })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por URI, tipo ou program ID..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'scte35', 'normal'] as SegmentFilter[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onFilterChange(option)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  filter === option
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option === 'all' ? 'Todos' : option === 'scte35' ? 'SCTE-35' : 'Normais'}
              </button>
            ))}

            <button
              type="button"
              onClick={onExportJson}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download size={16} /> JSON
            </button>
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download size={16} /> CSV
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Nenhum segmento encontrado com os filtros atuais.
          </div>
        ) : (
          filtered.map((segment, index) => (
            <SegmentRow key={`${segment.uri}-${segment.timestamp?.getTime() ?? index}`} segment={segment} />
          ))
        )}
      </div>
    </div>
  );
}
