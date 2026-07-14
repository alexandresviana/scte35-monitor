import type { Scte35Event } from '../types';
import { getSignalLabel } from './scte35';

export function exportEventsAsJson(events: Scte35Event[]): void {
  const payload = events.map((event) => ({
    detectedAt: event.detectedAt.toISOString(),
    segmentUri: event.segmentUri,
    segmentDuration: event.segmentDuration,
    mediaSequence: event.mediaSequence,
    signalType: event.cue.type,
    signalLabel: getSignalLabel(event.cue.type),
    duration: event.cue.duration,
    plannedDuration: event.cue.plannedDuration,
    programId: event.cue.programId,
    spliceEventId: event.cue.spliceEventId,
    uniqueProgramId: event.cue.uniqueProgramId,
    outOfNetwork: event.cue.outOfNetwork,
    base64Payload: event.cue.base64Payload,
    rawTag: event.cue.rawTag,
  }));

  downloadFile(
    JSON.stringify(payload, null, 2),
    `scte35-events-${timestamp()}.json`,
    'application/json'
  );
}

export function exportEventsAsCsv(events: Scte35Event[]): void {
  const headers = [
    'detectedAt',
    'signalType',
    'signalLabel',
    'segmentUri',
    'segmentDuration',
    'mediaSequence',
    'duration',
    'programId',
    'spliceEventId',
    'outOfNetwork',
  ];

  const rows = events.map((event) =>
    [
      event.detectedAt.toISOString(),
      event.cue.type,
      getSignalLabel(event.cue.type),
      event.segmentUri,
      event.segmentDuration,
      event.mediaSequence ?? '',
      event.cue.duration ?? '',
      event.cue.programId ?? '',
      event.cue.spliceEventId ?? '',
      event.cue.outOfNetwork ?? '',
    ]
      .map(csvEscape)
      .join(',')
  );

  downloadFile(
    [headers.join(','), ...rows].join('\n'),
    `scte35-events-${timestamp()}.csv`,
    'text/csv'
  );
}

function csvEscape(value: string | number | boolean): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
