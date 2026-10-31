import { Composition } from '../types/satie.ts';

const STORAGE_KEY = 'radio_satie_saved_tunes';

export function getSavedTunes(): Composition[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTune(composition: Composition): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getSavedTunes();
    if (!list.some((item) => item.id === composition.id)) {
      list.unshift(composition);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function removeSavedTune(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getSavedTunes().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore
  }
}
