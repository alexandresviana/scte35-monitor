export type Scte35SignalType =
  | 'SCTE35-OUT'
  | 'SCTE35-IN'
  | 'SCTE35-CUE-OUT'
  | 'SCTE35-CUE-IN'
  | 'SCTE35-SIGNAL'
  | 'SCTE35-DATERANGE'
  | 'SCTE35-CUE';

export interface Scte35Cue {
  type: Scte35SignalType;
  duration?: number;
  plannedDuration?: number;
  programId?: string;
  spliceEventId?: string;
  uniqueProgramId?: number;
  outOfNetwork?: boolean;
  spliceImmediate?: boolean;
  base64Payload?: string;
  dateRangeId?: string;
  startDate?: string;
  endDate?: string;
  rawTag?: string;
}

export interface Segment {
  uri: string;
  duration: number;
  title?: string;
  dateTimeString?: string;
  dateTimeObject?: Date;
  timestamp?: Date;
  mediaSequence?: number;
  discontinuity?: boolean;
  cue?: Scte35Cue;
}

export interface ManifestData {
  segments: Segment[];
  targetDuration: number;
  mediaSequence: number;
  discontinuitySequence: number;
  endList: boolean;
  playlistType: string;
  version?: number;
}

export interface VariantInfo {
  url: string;
  bandwidth?: number;
  resolution?: string;
  codecs?: string;
  frameRate?: number;
  name?: string;
}

export interface MonitorStats {
  totalSegments: number;
  scte35Count: number;
  cueOutCount: number;
  cueInCount: number;
  signalCount: number;
  lastSignalAt: Date | null;
  pollingIntervalMs: number;
  isLive: boolean;
}

export interface Scte35Event {
  id: string;
  detectedAt: Date;
  segmentUri: string;
  segmentDuration: number;
  mediaSequence?: number;
  cue: Scte35Cue;
}

export type SegmentFilter = 'all' | 'scte35' | 'normal';

export interface MonitorSettings {
  pollIntervalMs: number;
  maxSegments: number;
  useCorsProxy: boolean;
  autoStart: boolean;
  alertOnSignal: boolean;
  showOnlySignals: boolean;
}

export const DEFAULT_SETTINGS: MonitorSettings = {
  pollIntervalMs: 5000,
  maxSegments: 2000,
  useCorsProxy: true,
  autoStart: false,
  alertOnSignal: true,
  showOnlySignals: false,
};

export const STORAGE_KEYS = {
  manifestUrl: 'scte35-monitor:manifest-url',
  settings: 'scte35-monitor:settings',
  selectedVariant: 'scte35-monitor:selected-variant',
} as const;
