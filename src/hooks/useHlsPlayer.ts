import { useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';

interface UseHlsPlayerOptions {
  manifestUrl: string;
  onError?: (message: string) => void;
}

export function useHlsPlayer({ manifestUrl, onError }: UseHlsPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !manifestUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          onError?.('Autoplay bloqueado. Clique em play para iniciar o vídeo.');
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            onError?.('Erro de rede. Tentando recuperar...');
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            onError?.('Erro de mídia. Tentando recuperar...');
            hls.recoverMediaError();
            break;
          default:
            onError?.('Erro fatal no player. Recarregue a página.');
            hls.destroy();
            break;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = manifestUrl;
      video.play().catch(() => {
        onError?.('Autoplay bloqueado. Clique em play para iniciar o vídeo.');
      });
    } else {
      onError?.('HLS não suportado neste navegador.');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [manifestUrl, onError]);

  const goToLive = useCallback(() => {
    const video = videoRef.current;
    const hls = hlsRef.current;

    if (hls) {
      hls.stopLoad();
      hls.nextLevel = -1;
      hls.startLoad(-1);
      video?.play();
    } else if (video) {
      video.currentTime = video.duration;
      video.play();
    }
  }, []);

  const updateCuePoints = useCallback(
    (segments: Array<{ duration: number; cue?: unknown }>) => {
      const video = videoRef.current;
      if (!video) return;

      const track = video.textTracks[0];
      if (track) {
        while (track.cues?.length) {
          track.removeCue(track.cues[0]);
        }
      }

      const scteTrack =
        track ?? video.addTextTrack('metadata', 'SCTE-35', 'pt-BR');
      scteTrack.mode = 'hidden';

      let currentTime = 0;
      for (const segment of segments) {
        if (segment.cue) {
          const cue = new VTTCue(
            currentTime,
            currentTime + segment.duration,
            JSON.stringify(segment.cue)
          );
          cue.line = -1;
          scteTrack.addCue(cue);
        }
        currentTime += segment.duration;
      }
    },
    []
  );

  return { videoRef, goToLive, updateCuePoints };
}
