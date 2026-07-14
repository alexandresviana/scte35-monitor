import { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { ManifestInput } from './components/ManifestInput';
import { VideoPlayer } from './components/VideoPlayer';
import { StatsPanel } from './components/StatsPanel';
import { VariantSelector } from './components/VariantSelector';
import { SegmentList } from './components/SegmentList';
import { EventLog } from './components/EventLog';
import { SettingsPanel } from './components/SettingsPanel';
import { ProxyStatusBanner } from './components/ProxyStatusBanner';
import { useHlsPlayer } from './hooks/useHlsPlayer';
import { useManifestMonitor } from './hooks/useManifestMonitor';
import type { MonitorSettings, SegmentFilter, Scte35Event } from './types';
import { exportEventsAsCsv, exportEventsAsJson } from './utils/export';
import {
  loadManifestUrl,
  loadSelectedVariant,
  loadSettings,
  saveManifestUrl,
  saveSelectedVariant,
  saveSettings,
} from './utils/storage';

function playAlertTone() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);
  } catch {
    // ignore audio errors
  }
}

function App() {
  const [manifestUrl, setManifestUrl] = useState(loadManifestUrl);
  const [selectedVariant, setSelectedVariant] = useState(loadSelectedVariant);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [settings, setSettings] = useState<MonitorSettings>(loadSettings);
  const [filter, setFilter] = useState<SegmentFilter>(
    loadSettings().showOnlySignals ? 'scte35' : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [playerError, setPlayerError] = useState<string | null>(null);
  const autoStarted = useRef(false);

  const handleNewEvents = useCallback(
    (newEvents: Scte35Event[]) => {
      if (settings.alertOnSignal && newEvents.length > 0) {
        playAlertTone();
      }
    },
    [settings.alertOnSignal]
  );

  const {
    variants,
    manifestData,
    historicalSegments,
    events,
    stats,
    error,
    lastUpdate,
    isFetching,
    fetchVariantPlaylist,
    clearHistory,
    formatVariantLabel,
  } = useManifestMonitor({
    manifestUrl,
    selectedVariant,
    isMonitoring,
    settings,
    onNewEvents: handleNewEvents,
  });

  const { videoRef, goToLive, updateCuePoints } = useHlsPlayer({
    manifestUrl,
    onError: setPlayerError,
  });

  useEffect(() => {
    if (variants.length === 0) return;

    const exists = variants.some((variant) => variant.url === selectedVariant);
    if (!exists) {
      const next = variants[0].url;
      setSelectedVariant(next);
      saveSelectedVariant(next);
    }
  }, [variants, selectedVariant]);

  useEffect(() => {
    if (manifestData?.segments) {
      updateCuePoints(manifestData.segments);
    }
  }, [manifestData, updateCuePoints]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (settings.showOnlySignals) {
      setFilter('scte35');
    }
  }, [settings.showOnlySignals]);

  useEffect(() => {
    if (autoStarted.current || !settings.autoStart || !manifestUrl.trim()) return;
    autoStarted.current = true;
    setIsMonitoring(true);
  }, [settings.autoStart, manifestUrl]);

  const handleManifestUrlChange = (url: string) => {
    setManifestUrl(url);
    saveManifestUrl(url);
  };

  const handleVariantSelect = (url: string) => {
    setSelectedVariant(url);
    saveSelectedVariant(url);
  };

  const handleSettingsChange = (next: MonitorSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  const displayError = error ?? playerError;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <Header isMonitoring={isMonitoring} isFetching={isFetching} />

          <div className="mt-6 space-y-4">
            <ManifestInput
              manifestUrl={manifestUrl}
              isMonitoring={isMonitoring}
              onManifestUrlChange={handleManifestUrlChange}
              onToggleMonitoring={() => setIsMonitoring((prev) => !prev)}
              onRefresh={fetchVariantPlaylist}
              onClearHistory={clearHistory}
            />

            {displayError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {displayError}
              </div>
            )}

            <ProxyStatusBanner />

            <StatsPanel stats={stats} />
          </div>
        </section>

        <SettingsPanel settings={settings} onChange={handleSettingsChange} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <VideoPlayer
              videoRef={videoRef}
              manifestData={manifestData}
              onGoLive={goToLive}
            />

            <VariantSelector
              variants={variants}
              selectedVariant={selectedVariant}
              formatVariantLabel={formatVariantLabel}
              onSelect={handleVariantSelect}
            />

            <EventLog events={events} />
          </div>

          <div className="min-h-[640px]">
            <SegmentList
              segments={historicalSegments}
              filter={filter}
              searchQuery={searchQuery}
              maxSegments={settings.maxSegments}
              lastUpdate={lastUpdate}
              onFilterChange={setFilter}
              onSearchChange={setSearchQuery}
              onExportJson={() => exportEventsAsJson(events)}
              onExportCsv={() => exportEventsAsCsv(events)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
