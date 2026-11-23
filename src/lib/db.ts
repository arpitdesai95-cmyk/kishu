import type { PersistedAppState } from '../types/app';
import bundledGiftManifestRaw from '../data/bundledGiftManifest.json';

const DB_NAME = 'kishu_birthday_gift_db';
const DB_VERSION = 1;
const STORE_STATE = 'state';
const STORE_PHOTOS = 'photoBlobs';
const STORE_AUDIO = 'audioBlobs';
const STATE_KEY = 'app_state_v1';

export interface StoredPhotoBlobs {
  full: Blob;
  thumb: Blob;
}

let cachedDbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (cachedDbPromise) return cachedDbPromise;
  cachedDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_STATE)) {
        db.createObjectStore(STORE_STATE);
      }
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS);
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO);
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        cachedDbPromise = null;
      };
      db.onclose = () => {
        cachedDbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () => {
      cachedDbPromise = null;
      reject(request.error);
    };
  });
  return cachedDbPromise;
}

export async function loadPersistedState(): Promise<PersistedAppState | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_STATE, 'readonly');
    const req = tx.objectStore(STORE_STATE).get(STATE_KEY);
    req.onsuccess = () => resolve((req.result as PersistedAppState) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function savePersistedState(state: PersistedAppState): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_STATE, 'readwrite');
    tx.objectStore(STORE_STATE).put(state, STATE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function savePhotoBlobs(id: string, blobs: StoredPhotoBlobs): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    tx.objectStore(STORE_PHOTOS).put(blobs, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function savePhotoBlobsBatch(
  entries: Array<{ id: string; blobs: StoredPhotoBlobs }>
): Promise<void> {
  if (entries.length === 0) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    const store = tx.objectStore(STORE_PHOTOS);
    for (const entry of entries) {
      store.put(entry.blobs, entry.id);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPhotoBlobs(id: string): Promise<StoredPhotoBlobs | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readonly');
    const req = tx.objectStore(STORE_PHOTOS).get(id);
    req.onsuccess = () => resolve((req.result as StoredPhotoBlobs) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhotoBlobs(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    tx.objectStore(STORE_PHOTOS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveAudioBlob(trackId: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readwrite');
    tx.objectStore(STORE_AUDIO).put(blob, trackId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAudioBlob(trackId: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readonly');
    const req = tx.objectStore(STORE_AUDIO).get(trackId);
    req.onsuccess = () => resolve((req.result as Blob) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAudioBlob(trackId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readwrite');
    tx.objectStore(STORE_AUDIO).delete(trackId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllDatabase(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_STATE, STORE_PHOTOS, STORE_AUDIO], 'readwrite');
    tx.objectStore(STORE_STATE).clear();
    tx.objectStore(STORE_PHOTOS).clear();
    tx.objectStore(STORE_AUDIO).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Optimizes large mobile camera photos into a crisp full-size Blob (max 1600px)
 * and a fast lightweight thumbnail Blob (max 420px) so hundreds of photos load
 * smoothly on smartphones without memory spikes.
 */
export async function optimizeImageFile(file: File): Promise<{
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
  mimeType: string;
}> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode image file'));
      el.src = objectUrl;
    });

    const createResizedBlob = (maxSide: number, quality: number): Promise<{ blob: Blob; w: number; h: number }> => {
      return new Promise((resolve, reject) => {
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > maxSide || h > maxSide) {
          if (w >= h) {
            h = Math.round((h * maxSide) / w);
            w = maxSide;
          } else {
            w = Math.round((w * maxSide) / h);
            h = maxSide;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to encode image'));
              return;
            }
            resolve({ blob, w, h });
          },
          'image/jpeg',
          quality
        );
      });
    };

    const fullRes = await createResizedBlob(1600, 0.86);
    const thumbRes = await createResizedBlob(440, 0.78);

    return {
      full: fullRes.blob,
      thumb: thumbRes.blob,
      width: fullRes.w,
      height: fullRes.h,
      mimeType: 'image/jpeg',
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function base64ToBlob(dataUrl: string): Promise<Blob> {
  if (dataUrl.startsWith('data:')) {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx !== -1) {
      const header = dataUrl.slice(5, commaIdx);
      const mimeMatch = header.match(/^([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const base64Data = dataUrl.slice(commaIdx + 1);
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return new Blob([bytes], { type: mimeType });
    }
  }
  const res = await fetch(dataUrl);
  return res.blob();
}

export interface BackupArchive {
  magic: 'KISHU_GIFT_BACKUP_V1';
  exportedAt: string;
  state: PersistedAppState;
  photos: Record<string, { full: string; thumb: string }>;
  audio: Record<string, string>;
}

export interface BundledManifestArchive {
  magic: 'KISHU_GIFT_MANIFEST_V1';
  exportedAt: string;
  state: PersistedAppState;
}

async function fetchBundledPhotoBlobs(photoId: string): Promise<StoredPhotoBlobs | null> {
  try {
    const [fullRes, thumbRes] = await Promise.all([
      fetch(`./bundled-photos/${photoId}_full.jpg`),
      fetch(`./bundled-photos/${photoId}_thumb.jpg`),
    ]);
    if (!fullRes.ok || !thumbRes.ok) return null;
    const [full, thumb] = await Promise.all([fullRes.blob(), thumbRes.blob()]);
    return { full, thumb };
  } catch {
    return null;
  }
}

export async function exportFullBackup(
  state: PersistedAppState,
  includeAudio: boolean,
  options?: { resetStoryProgressForGift?: boolean }
): Promise<Blob> {
  const photosMap: Record<string, { full: string; thumb: string }> = {};
  for (const photo of state.photos) {
    let blobs = await getPhotoBlobs(photo.id);
    if (!blobs && photo.bundled) {
      blobs = await fetchBundledPhotoBlobs(photo.id);
    }
    if (blobs) {
      photosMap[photo.id] = {
        full: await blobToBase64(blobs.full),
        thumb: await blobToBase64(blobs.thumb),
      };
    }
  }

  const audioMap: Record<string, string> = {};
  if (includeAudio) {
    for (const slot of state.audioSlots) {
      if (slot.hasFile) {
        const blob = await getAudioBlob(slot.id);
        if (blob) {
          audioMap[slot.id] = await blobToBase64(blob);
        }
      }
    }
  }

  const stateToExport: PersistedAppState = options?.resetStoryProgressForGift
    ? {
        ...state,
        content: {
          ...state.content,
          storyProgress: {
            currentChapter: 0,
            highestUnlocked: 12,
            completed: true,
            hasOpenedGift: false,
          },
        },
      }
    : state;

  const archive: BackupArchive = {
    magic: 'KISHU_GIFT_BACKUP_V1',
    exportedAt: new Date().toISOString(),
    state: stateToExport,
    photos: photosMap,
    audio: audioMap,
  };

  return new Blob([JSON.stringify(archive)], { type: 'application/json' });
}

export async function importBackupData(
  parsed: BackupArchive,
  options?: { markBundledSeed?: boolean }
): Promise<PersistedAppState> {
  if (!parsed || parsed.magic !== 'KISHU_GIFT_BACKUP_V1' || !parsed.state) {
    throw new Error('This file is not a valid Kishu ❤️ backup archive.');
  }

  await clearAllDatabase();

  const photoEntries = Object.entries(parsed.photos || {});
  const BATCH_SIZE = 12;
  for (let i = 0; i < photoEntries.length; i += BATCH_SIZE) {
    const slice = photoEntries.slice(i, i + BATCH_SIZE);
    const decoded: Array<{ id: string; blobs: StoredPhotoBlobs }> = [];
    for (const [photoId, entry] of slice) {
      const full = await base64ToBlob(entry.full);
      const thumb = await base64ToBlob(entry.thumb);
      decoded.push({ id: photoId, blobs: { full, thumb } });
    }
    await savePhotoBlobsBatch(decoded);
  }

  const restoredAudioSlots = parsed.state.audioSlots.map((slot) => ({
    ...slot,
    hasFile: Boolean(slot.bundledUrl || (parsed.audio && parsed.audio[slot.id])),
  }));

  for (const [trackId, dataUrl] of Object.entries(parsed.audio || {})) {
    const blob = await base64ToBlob(dataUrl);
    await saveAudioBlob(trackId, blob);
  }

  const restoredState: PersistedAppState = {
    ...parsed.state,
    bundledSeedStamp: options?.markBundledSeed
      ? parsed.exportedAt || new Date().toISOString()
      : parsed.state.bundledSeedStamp,
    audioSlots: restoredAudioSlots,
  };

  await savePersistedState(restoredState);
  return restoredState;
}

export async function importFullBackup(file: File): Promise<PersistedAppState> {
  const text = await file.text();
  const parsed = JSON.parse(text) as BackupArchive;
  return importBackupData(parsed);
}

export const BUNDLED_GIFT_MANIFEST = bundledGiftManifestRaw as unknown as BundledManifestArchive;

export const BUNDLED_PHOTO_IDS: ReadonlySet<string> = new Set(
  (BUNDLED_GIFT_MANIFEST?.state?.photos || []).map((p) => p.id)
);

export function getBundledGiftManifestState(): PersistedAppState | null {
  if (
    !BUNDLED_GIFT_MANIFEST ||
    BUNDLED_GIFT_MANIFEST.magic !== 'KISHU_GIFT_MANIFEST_V1' ||
    !BUNDLED_GIFT_MANIFEST.state
  ) {
    return null;
  }
  const cloned = JSON.parse(JSON.stringify(BUNDLED_GIFT_MANIFEST.state)) as PersistedAppState;
  cloned.photos = (cloned.photos || []).map((p) => ({ ...p, bundled: true }));
  cloned.bundledSeedStamp = BUNDLED_GIFT_MANIFEST.exportedAt || new Date().toISOString();
  return cloned;
}

/**
 * Loads the pre-packaged gift manifest compiled into the app bundle (with optional
 * runtime JSON fallback) so Kishu opens the APK/PWA with all 372 photos offline immediately.
 */
export async function tryLoadBundledGiftArchive(): Promise<PersistedAppState | null> {
  const compiledState = getBundledGiftManifestState();
  if (compiledState && compiledState.photos.length > 0) {
    await savePersistedState(compiledState);
    return compiledState;
  }

  try {
    const manifestRes = await fetch('./kishu-gift-manifest.json', { cache: 'no-store' });
    if (manifestRes.ok) {
      const contentType = (manifestRes.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('text/html')) {
        const parsed = (await manifestRes.json()) as BundledManifestArchive;
        if (parsed && parsed.magic === 'KISHU_GIFT_MANIFEST_V1' && parsed.state) {
          const restoredState: PersistedAppState = {
            ...parsed.state,
            photos: (parsed.state.photos || []).map((p) => ({ ...p, bundled: true })),
            bundledSeedStamp: parsed.exportedAt || new Date().toISOString(),
          };
          await savePersistedState(restoredState);
          return restoredState;
        }
      }
    }
  } catch {
    // Fall through to legacy single-file bundle check
  }

  try {
    const res = await fetch('./kishu-gift-bundle.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    // Skip SPA HTML fallbacks when no pre-packaged bundle exists
    if (contentType.includes('text/html')) {
      return null;
    }
    const parsed = (await res.json()) as BackupArchive;
    if (!parsed || parsed.magic !== 'KISHU_GIFT_BACKUP_V1') return null;
    return await importBackupData(parsed, { markBundledSeed: true });
  } catch {
    return null;
  }
}
