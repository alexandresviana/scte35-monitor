import { DEFAULT_SETTINGS, STORAGE_KEYS, type MonitorSettings } from '../types';

export function loadManifestUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.manifestUrl) ?? '';
  } catch {
    return '';
  }
}

export function saveManifestUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.manifestUrl, url);
  } catch {
    // ignore storage errors
  }
}

export function loadSettings(): MonitorSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: MonitorSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

export function loadSelectedVariant(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.selectedVariant) ?? '';
  } catch {
    return '';
  }
}

export function saveSelectedVariant(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.selectedVariant, url);
  } catch {
    // ignore storage errors
  }
}
