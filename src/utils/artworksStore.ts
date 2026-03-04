import { Artwork } from '../types';
import { mockArtworks } from '../data/mockData';

const STORAGE_KEY = 'artworks';

export function getArtworks(): Artwork[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Artwork[];
      // If empty, reinitialize with mock data
      if (parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockArtworks));
        return mockArtworks;
      }
      return parsed;
    }
    // If not present, initialize with mock data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockArtworks));
    return mockArtworks;
  } catch (err) {
    console.warn('Failed to read artworks from localStorage, falling back to mockData');
    return mockArtworks;
  }
}

export function saveArtworks(list: Artwork[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  // notify other windows/components
  window.dispatchEvent(new Event('artworks-updated'));
}

export function addArtwork(a: Artwork) {
  const current = getArtworks();
  const next = [a, ...current];
  saveArtworks(next);
}

export function clearDemoData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event('artworks-updated'));
}

export function updateArtwork(artworkId: string, updatedData: Partial<Artwork>) {
  const current = getArtworks();
  const updated = current.map(art => 
    art.id === artworkId ? { ...art, ...updatedData } : art
  );
  saveArtworks(updated);
}

export function deleteArtwork(artworkId: string) {
  const current = getArtworks();
  const filtered = current.filter(art => art.id !== artworkId);
  saveArtworks(filtered);
}

export function getArtworksByArtist(artistId: string): Artwork[] {
  const allArtworks = getArtworks();
  return allArtworks.filter(art => art.artistId === artistId);
}

export function seedDemoData() {
  // write mockArtworks into storage (if user wants to restore)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockArtworks));
  window.dispatchEvent(new Event('artworks-updated'));
}
