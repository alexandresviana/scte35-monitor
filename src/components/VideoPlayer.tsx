import { Radio } from 'lucide-react';
import type { RefObject } from 'react';
import type { ManifestData } from '../types';
import { hasScte35 } from '../utils/scte35';

interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement>;
  manifestData: ManifestData | null;
  onGoLive: () => void;
}

export function VideoPlayer({ videoRef, manifestData, onGoLive }: VideoPlayerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black shadow-xl">
      <video
        ref={videoRef}
        controls
        playsInline
        muted
        className="aspect-video w-full bg-black"
      />

      {manifestData && manifestData.segments.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900/70">
          {manifestData.segments.map((segment, index) =>
            hasScte35(segment) ? (
              <div
                key={`${segment.uri}-${index}`}
                className="absolute h-full bg-amber-400"
                style={{
                  left: `${(index / manifestData.segments.length) * 100}%`,
                  width: `${(1 / manifestData.segments.length) * 100}%`,
                }}
                title={`SCTE-35: ${segment.cue?.type}`}
              />
            ) : null
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onGoLive}
        className="absolute bottom-14 right-4 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-rose-700"
      >
        <Radio size={12} className="animate-pulse" />
        Ao vivo
      </button>
    </div>
  );
}
