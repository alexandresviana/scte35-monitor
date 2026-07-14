import axios from 'axios';
import { Parser } from 'm3u8-parser';
import type { ManifestData, Segment, VariantInfo } from '../types';
import { parseScte35FromTag } from './scte35';

export function parseManifest(manifestContent: string): ManifestData {
  const parser = new Parser();
  parser.push(manifestContent);
  parser.end();

  const manifest = parser.manifest;

  return {
    segments: (manifest.segments ?? []) as Segment[],
    targetDuration: manifest.targetDuration ?? 0,
    mediaSequence: manifest.mediaSequence ?? 0,
    discontinuitySequence: manifest.discontinuitySequence ?? 0,
    endList: Boolean(manifest.endlist),
    playlistType: manifest.playlistType ?? 'UNKNOWN',
    version: manifest.version,
  };
}

export function enrichSegmentsFromRaw(rawContent: string, baseMediaSequence = 0): Segment[] {
  const lines = rawContent.split('\n');
  const segments: Segment[] = [];
  let currentSegment: Partial<Segment> = {};
  let mediaSequence = baseMediaSequence;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('#EXTINF:')) {
      currentSegment.duration = parseFloat(line.split(':')[1]);
      const titlePart = line.split(',')[1];
      if (titlePart) currentSegment.title = titlePart;
    } else if (line.startsWith('#EXT-X-PROGRAM-DATE-TIME:')) {
      const dateTime = line.replace('#EXT-X-PROGRAM-DATE-TIME:', '').trim();
      currentSegment.dateTimeString = dateTime;
      currentSegment.dateTimeObject = new Date(dateTime);
    } else if (line.startsWith('#EXT-X-DISCONTINUITY')) {
      currentSegment.discontinuity = true;
    } else if (
      line.startsWith('#EXT-X-DATERANGE') ||
      line.startsWith('#EXT-X-CUE') ||
      line.startsWith('#EXT-OATCLS-SCTE35') ||
      line.startsWith('#EXT-X-SCTE35')
    ) {
      const cue = parseScte35FromTag(line);
      if (cue) currentSegment.cue = cue;
    } else if (!line.startsWith('#') && line.length > 0) {
      currentSegment.uri = line;
      currentSegment.mediaSequence = mediaSequence;
      segments.push(currentSegment as Segment);
      currentSegment = {};
      mediaSequence += 1;
    }
  }

  return segments;
}

export function extractVariants(manifestContent: string, manifestUrl: string): VariantInfo[] {
  const parser = new Parser();
  parser.push(manifestContent);
  parser.end();

  const playlists = parser.manifest.playlists ?? [];
  if (playlists.length > 0) {
    return playlists.map((playlist: Record<string, unknown>, index: number) => {
      const uri = playlist.uri as string;
      const url = new URL(uri, manifestUrl).toString();
      const attrs = (playlist.attributes ?? {}) as Record<string, unknown>;

      return {
        url,
        bandwidth: attrs.BANDWIDTH as number | undefined,
        resolution: attrs.RESOLUTION as string | undefined,
        codecs: attrs.CODECS as string | undefined,
        frameRate: attrs['FRAME-RATE'] as number | undefined,
        name: (attrs.NAME as string | undefined) ?? `Variant ${index + 1}`,
      };
    });
  }

  return [{ url: manifestUrl, name: 'Media Playlist' }];
}

export function formatVariantLabel(variant: VariantInfo, index: number): string {
  const parts: string[] = [variant.name ?? `Variant ${index + 1}`];

  if (variant.resolution) parts.push(variant.resolution);
  if (variant.bandwidth) parts.push(`${Math.round(variant.bandwidth / 1000)} kbps`);
  if (variant.codecs) parts.push(variant.codecs);

  return parts.join(' · ');
}

export async function fetchManifestText(
  url: string,
  useCorsProxy: boolean
): Promise<string> {
  const fetchUrl = useCorsProxy
    ? `/proxy?url=${encodeURIComponent(url)}`
    : url;

  const response = await axios.get<string>(fetchUrl, {
    responseType: 'text',
    timeout: 15000,
    headers: useCorsProxy ? undefined : { Accept: 'application/vnd.apple.mpegurl, text/plain, */*' },
  });

  return response.data;
}

export function mergeManifestData(
  parsed: ManifestData,
  enrichedSegments: Segment[]
): ManifestData {
  return {
    ...parsed,
    segments: enrichedSegments.length > 0 ? enrichedSegments : parsed.segments,
  };
}
