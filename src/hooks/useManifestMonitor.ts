import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type {
  ManifestData,
  MonitorSettings,
  MonitorStats,
  Segment,
  Scte35Event,
  VariantInfo,
} from '../types';
import {
  enrichSegmentsFromRaw,
  extractVariants,
  fetchManifestText,
  formatVariantLabel,
  mergeManifestData,
  parseManifest,
} from '../utils/manifest';
import { hasScte35 } from '../utils/scte35';

function createEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function computeStats(
  segments: Segment[],
  pollIntervalMs: number,
  isLive: boolean
): MonitorStats {
  const scteSegments = segments.filter(hasScte35);
  const lastSignal = scteSegments.at(-1);

  return {
    totalSegments: segments.length,
    scte35Count: scteSegments.length,
    cueOutCount: scteSegments.filter((s) => s.cue?.type.includes('OUT')).length,
    cueInCount: scteSegments.filter((s) => s.cue?.type.includes('IN')).length,
    signalCount: scteSegments.filter((s) => s.cue?.type === 'SCTE35-SIGNAL').length,
    lastSignalAt: lastSignal?.timestamp ?? null,
    pollingIntervalMs: pollIntervalMs,
    isLive,
  };
}

interface UseManifestMonitorOptions {
  manifestUrl: string;
  selectedVariant: string;
  isMonitoring: boolean;
  settings: MonitorSettings;
  onNewEvents?: (events: Scte35Event[]) => void;
}

export function useManifestMonitor({
  manifestUrl,
  selectedVariant,
  isMonitoring,
  settings,
  onNewEvents,
}: UseManifestMonitorOptions) {
  const [variants, setVariants] = useState<VariantInfo[]>([]);
  const [manifestData, setManifestData] = useState<ManifestData | null>(null);
  const [historicalSegments, setHistoricalSegments] = useState<Segment[]>([]);
  const [events, setEvents] = useState<Scte35Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const seenEventKeys = useRef<Set<string>>(new Set());

  const updateHistoricalSegments = useCallback(
    (newSegments: Segment[]) => {
      const timestamped = newSegments.map((segment) => ({
        ...segment,
        timestamp: new Date(),
      }));

      setHistoricalSegments((prev) => {
        const combined = [...prev, ...timestamped];
        return combined.slice(-settings.maxSegments);
      });

      const newEvents: Scte35Event[] = [];
      for (const segment of timestamped) {
        if (!segment.cue) continue;

        const key = [
          segment.uri,
          segment.cue.type,
          segment.cue.rawTag,
          segment.mediaSequence,
        ].join('|');

        if (seenEventKeys.current.has(key)) continue;
        seenEventKeys.current.add(key);

        newEvents.push({
          id: createEventId(),
          detectedAt: segment.timestamp!,
          segmentUri: segment.uri,
          segmentDuration: segment.duration,
          mediaSequence: segment.mediaSequence,
          cue: segment.cue,
        });
      }

      if (newEvents.length > 0) {
        setEvents((prev) => [...prev, ...newEvents].slice(-settings.maxSegments));
        onNewEvents?.(newEvents);
      }
    },
    [settings.maxSegments, onNewEvents]
  );

  const fetchMasterPlaylist = useCallback(async () => {
    if (!manifestUrl) return;

    setIsFetching(true);
    try {
      const content = await fetchManifestText(manifestUrl, settings.useCorsProxy);
      const extracted = extractVariants(content, manifestUrl);
      setVariants(extracted);
      setError(null);
    } catch {
      setError('Falha ao buscar master playlist. Verifique a URL ou ative o proxy CORS.');
    } finally {
      setIsFetching(false);
    }
  }, [manifestUrl, settings.useCorsProxy]);

  const fetchVariantPlaylist = useCallback(async () => {
    if (!selectedVariant) return;

    setIsFetching(true);
    try {
      const rawContent = await fetchManifestText(
        selectedVariant,
        settings.useCorsProxy
      );
      const parsed = parseManifest(rawContent);
      const enriched = enrichSegmentsFromRaw(rawContent, parsed.mediaSequence);
      const merged = mergeManifestData(parsed, enriched);

      setManifestData(merged);
      updateHistoricalSegments(merged.segments);
      setLastUpdate(new Date());
      setError(null);
    } catch {
      setError('Falha ao buscar variant playlist.');
    } finally {
      setIsFetching(false);
    }
  }, [selectedVariant, settings.useCorsProxy, updateHistoricalSegments]);

  useEffect(() => {
    if (manifestUrl && isMonitoring) {
      fetchMasterPlaylist();
    }
  }, [manifestUrl, isMonitoring, fetchMasterPlaylist]);

  useEffect(() => {
    if (!isMonitoring || !selectedVariant) return;

    fetchVariantPlaylist();
    const interval = setInterval(fetchVariantPlaylist, settings.pollIntervalMs);
    return () => clearInterval(interval);
  }, [
    isMonitoring,
    selectedVariant,
    settings.pollIntervalMs,
    fetchVariantPlaylist,
  ]);

  const stats = useMemo(
    () =>
      computeStats(
        historicalSegments,
        settings.pollIntervalMs,
        manifestData ? !manifestData.endList : true
      ),
    [historicalSegments, settings.pollIntervalMs, manifestData]
  );

  const clearHistory = useCallback(() => {
    setHistoricalSegments([]);
    setEvents([]);
    seenEventKeys.current.clear();
  }, []);

  return {
    variants,
    manifestData,
    historicalSegments,
    events,
    stats,
    error,
    lastUpdate,
    isFetching,
    fetchMasterPlaylist,
    fetchVariantPlaylist,
    clearHistory,
    formatVariantLabel,
  };
}
