import type { Scte35Cue, Scte35SignalType } from '../types';

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([A-Z0-9-]+)=("([^"]*)"|([^",]*))/gi;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(tag)) !== null) {
    attrs[match[1].toUpperCase()] = match[3] ?? match[4] ?? '';
  }

  return attrs;
}

function parseDurationValue(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function inferSignalType(tag: string): Scte35SignalType {
  const upper = tag.toUpperCase();

  if (upper.includes('SCTE35-OUT') || upper.includes('CUE-OUT')) return 'SCTE35-CUE-OUT';
  if (upper.includes('SCTE35-IN') || upper.includes('CUE-IN')) return 'SCTE35-CUE-IN';
  if (upper.startsWith('#EXT-X-DATERANGE')) return 'SCTE35-DATERANGE';
  if (upper.startsWith('#EXT-X-CUE')) return 'SCTE35-CUE';
  return 'SCTE35-SIGNAL';
}

export function parseScte35FromTag(tag: string): Scte35Cue | null {
  const trimmed = tag.trim();
  const upper = trimmed.toUpperCase();

  if (
    !upper.includes('SCTE35') &&
    !upper.startsWith('#EXT-X-CUE-OUT') &&
    !upper.startsWith('#EXT-X-CUE-IN') &&
    !upper.startsWith('#EXT-X-CUE:')
  ) {
    return null;
  }

  const attrs = parseAttributes(trimmed);
  const type = inferSignalType(trimmed);

  const cue: Scte35Cue = {
    type,
    rawTag: trimmed,
  };

  if (attrs['PLANNED-DURATION']) {
    cue.plannedDuration = parseDurationValue(attrs['PLANNED-DURATION']);
  }

  if (attrs.DURATION) {
    cue.duration = parseDurationValue(attrs.DURATION);
  }

  if (attrs.ID) cue.dateRangeId = attrs.ID;
  if (attrs['START-DATE']) cue.startDate = attrs['START-DATE'];
  if (attrs['END-DATE']) cue.endDate = attrs['END-DATE'];

  const outOfNetwork = attrs.OUT ?? attrs['SCTE35-OUT'];
  if (outOfNetwork !== undefined) {
    cue.outOfNetwork = outOfNetwork === '1' || outOfNetwork.toLowerCase() === 'true';
  }

  if (attrs['SPLICE-IMMEDIATE']) {
    cue.spliceImmediate =
      attrs['SPLICE-IMMEDIATE'] === '1' ||
      attrs['SPLICE-IMMEDIATE'].toLowerCase() === 'true';
  }

  if (attrs['SPLICE-EVENT-ID']) cue.spliceEventId = attrs['SPLICE-EVENT-ID'];
  if (attrs['UNIQUE-PROGRAM-ID']) {
    const id = parseInt(attrs['UNIQUE-PROGRAM-ID'], 10);
    if (Number.isFinite(id)) cue.uniqueProgramId = id;
  }

  const programMatch =
    trimmed.match(/SCTE35-CMD=0x([0-9A-F]+)/i) ??
    trimmed.match(/PROGRAM-ID=([0-9]+)/i);
  if (programMatch) cue.programId = programMatch[1];

  const payloadMatch =
    trimmed.match(/SCTE35-OUT=0x([0-9A-F]+)/i) ??
    trimmed.match(/SCTE35-IN=0x([0-9A-F]+)/i);
  if (payloadMatch) cue.base64Payload = payloadMatch[1];

  if (upper.startsWith('#EXT-X-CUE-OUT')) {
    cue.type = 'SCTE35-CUE-OUT';
    const durationMatch =
      trimmed.match(/#EXT-X-CUE-OUT:([\d.]+)/i) ??
      trimmed.match(/DURATION=([\d.]+)/i);
    if (durationMatch) cue.duration = parseFloat(durationMatch[1]);
    cue.outOfNetwork = true;
  }

  if (upper.startsWith('#EXT-X-CUE-IN')) {
    cue.type = 'SCTE35-CUE-IN';
    cue.outOfNetwork = false;
  }

  if (upper.startsWith('#EXT-OATCLS-SCTE35:') || upper.startsWith('#EXT-X-SCTE35:')) {
    cue.type = 'SCTE35-SIGNAL';
    const payload = trimmed.split(':').slice(1).join(':').trim();
    if (payload) cue.base64Payload = payload;
  }

  if (!cue.duration && cue.plannedDuration) {
    cue.duration = cue.plannedDuration;
  }

  return cue;
}

export function hasScte35(segment: { cue?: Scte35Cue }): boolean {
  return segment.cue !== undefined;
}

export function getSignalLabel(type: Scte35SignalType): string {
  const labels: Record<Scte35SignalType, string> = {
    'SCTE35-OUT': 'Ad Break Out',
    'SCTE35-IN': 'Return to Program',
    'SCTE35-CUE-OUT': 'Cue Out (Ad Start)',
    'SCTE35-CUE-IN': 'Cue In (Ad End)',
    'SCTE35-SIGNAL': 'SCTE-35 Signal',
    'SCTE35-DATERANGE': 'DateRange Marker',
    'SCTE35-CUE': 'Cue Marker',
  };
  return labels[type] ?? type;
}

export function getSignalColor(type: Scte35SignalType): string {
  if (type.includes('OUT')) return 'amber';
  if (type.includes('IN')) return 'emerald';
  if (type === 'SCTE35-DATERANGE') return 'violet';
  return 'yellow';
}
