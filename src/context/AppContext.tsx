import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { BUNDLED_THEME_SONG_ID, createDefaultState } from '../data/defaults';
import {
  BUNDLED_PHOTO_IDS,
  clearAllDatabase,
  deleteAudioBlob,
  deletePhotoBlobs,
  getAudioBlob,
  getBundledGiftManifestState,
  getPhotoBlobs,
  loadPersistedState,
  optimizeImageFile,
  saveAudioBlob,
  savePersistedState,
  savePhotoBlobs,
  tryLoadBundledGiftArchive,
} from '../lib/db';
import type {
  Album,
  AppContent,
  AudioTrackSlot,
  CollageLayoutMode,
  MusicSettings,
  OpenWhenCard,
  PersistedAppState,
  PhotoItem,
  ReasonItem,
  SavedCollage,
  SceneMusicKey,
  ScreenId,
} from '../types/app';

export const TOTAL_LINEAR_STEPS = 12;

export const LINEAR_STEP_SCREENS: Record<number, ScreenId> = {
  0: 'first',
  1: 'journey',           // Chapter 1: Anaval Mahadev
  2: 'trips',             // Chapter 2: Mountains & Temple Trips
  3: 'movies',            // Chapter 3: Movie Memories
  4: 'sugarcane',         // Chapter 4: Sugarcane Juice Memory
  5: 'journey',           // Chapter 5: The Hardest Chapter
  6: 'journey',           // Chapter 6: When Families Agreed
  7: 'journey',           // Chapter 7: Her Birthday -> Big Reveal
  8: 'birthday',          // Chapter 8: Birthday Surprise & Letter
  9: 'why_love',          // Chapter 9: Why I Love You
  10: 'open_when',        // Chapter 10: Open When Letters
  11: 'all_over_memories',// Chapter 11: All Over Memories (every remaining photo till today)
  12: 'final_reveal',     // Chapter 12: Final Reveal (Girlfriend -> Loading -> Wife)
};

interface NavigationPayload {
  albumId?: string;
  chapterIndex?: number;
  collagePhotoIds?: string[];
  returnToBeat?: number;
  nextBeatLabel?: string;
}

interface AppContextValue {
  ready: boolean;
  state: PersistedAppState;
  screen: ScreenId;
  navPayload: NavigationPayload;
  navigate: (to: ScreenId, payload?: NavigationPayload) => void;
  goBack: () => void;
  toast: string | null;
  showToast: (msg: string) => void;

  // Linear storyProgress Navigation Controller
  isLinearLocked: boolean;
  isInStorySequence: boolean;
  currentLinearStep: number;
  highestUnlockedStep: number;
  openGiftFromCover: () => void;
  startStoryFromStep: (step: number) => void;
  advanceLinearChapter: (fromStep: number) => void;
  goToLinearStep: (step: number) => void;
  completeLinearJourney: () => void;

  // Photo URL hydration & management
  getPhotoUrl: (photoId: string, variant?: 'thumb' | 'full') => string | null;
  uploadPhotos: (files: FileList | File[], albumId: string, chapterKey?: string) => Promise<PhotoItem[]>;
  updatePhoto: (photoId: string, patch: Partial<PhotoItem>) => void;
  deletePhoto: (photoId: string) => Promise<void>;
  reorderPhoto: (photoId: string, direction: 'up' | 'down', subsetIds: string[]) => void;

  // Albums
  createAlbum: (name: string, subtitle: string) => Album;
  setAlbumCover: (albumId: string, photoId: string) => void;
  deleteAlbum: (albumId: string) => void;

  // Collages
  saveCollage: (collage: Omit<SavedCollage, 'id' | 'createdAt'> & { id?: string }) => SavedCollage;
  deleteCollage: (collageId: string) => void;

  // Reasons
  addReason: (text: string) => void;
  updateReason: (id: string, text: string) => void;
  deleteReason: (id: string) => void;
  reorderReason: (id: string, direction: 'up' | 'down') => void;

  // Open When
  addOpenWhen: (title: string, subtitle: string, message: string, accent: OpenWhenCard['accent']) => void;
  updateOpenWhen: (id: string, patch: Partial<OpenWhenCard>) => void;
  deleteOpenWhen: (id: string) => void;

  // Content & Story Progress
  updateContent: (updater: (prev: AppContent) => AppContent) => void;

  // Audio / Music Engine
  activeTrackId: string | null;
  isPlaying: boolean;
  audioCurrentTime: number;
  audioDuration: number;
  uploadAudioForSlot: (slotId: string, file: File) => Promise<void>;
  removeAudioForSlot: (slotId: string) => Promise<void>;
  updateAudioSlotMeta: (slotId: string, patch: Partial<AudioTrackSlot>) => void;
  updateMusicSettings: (patch: Partial<MusicSettings>) => void;
  toggleMusicMaster: () => void;
  playTrack: (trackId: string) => Promise<void>;
  pauseMusic: () => void;
  togglePlayPause: () => Promise<void>;
  seekAudio: (time: number) => void;
  triggerSceneMusic: (scene: SceneMusicKey) => void;

  // Backup / Restore / Reset / Replay
  replaceAllState: (nextState: PersistedAppState) => void;
  replayOurStory: () => void;
  resetEverything: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<PersistedAppState>(
    () => getBundledGiftManifestState() || createDefaultState()
  );
  const [screen, setScreen] = useState<ScreenId>('first');
  const [navPayload, setNavPayload] = useState<NavigationPayload>({});
  const [historyStack, setHistoryStack] = useState<Array<{ screen: ScreenId; payload: NavigationPayload }>>([]);
  const [toast, setToast] = useState<string | null>(null);

  // URL caches for photo thumbs and full-res images
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});
  const [fullUrls, setFullUrls] = useState<Record<string, string>>({});
  const pendingPhotoLoads = useRef<Set<string>>(new Set());
  const thumbUrlsRef = useRef<Record<string, string>>({});
  const fullUrlsRef = useRef<Record<string, string>>({});

  // Audio player engine
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const activeTrackIdRef = useRef<string | null>(null);
  const musicEnabledRef = useRef<boolean>(true);
  const autoPlayAttemptedRef = useRef<boolean>(false);
  const fadeTimerRef = useRef<number | null>(null);
  const stateRef = useRef<PersistedAppState>(state);
  stateRef.current = state;
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const toastTimeoutRef = useRef<number | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  // Hydrate persisted state from IndexedDB on boot (or auto-load pre-packaged APK bundle on fresh device)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let stored = await loadPersistedState();
        const compiledBundled = getBundledGiftManifestState();
        if (!stored || !Array.isArray(stored.photos) || stored.photos.length === 0) {
          const bundled = await tryLoadBundledGiftArchive();
          if (bundled && bundled.photos.length > 0) {
            stored = bundled;
          }
        } else if (compiledBundled && compiledBundled.photos.length > 0) {
          const compiledById = new Map(compiledBundled.photos.map((bp) => [bp.id, bp]));
          const needsSeedSync =
            stored.bundledSeedStamp !== compiledBundled.bundledSeedStamp ||
            stored.photos.some((p) => {
              const match = compiledById.get(p.id);
              return (
                (match?.bundledUrl && p.bundledUrl !== match.bundledUrl) ||
                (BUNDLED_PHOTO_IDS.has(p.id) && !p.bundled)
              );
            });

          if (needsSeedSync) {
            const existingIds = new Set(stored.photos.map((p) => p.id));
            const upgradedPhotos = stored.photos
              .filter((p) => !p.bundled || compiledById.has(p.id))
              .map((p) => {
                const match = compiledById.get(p.id);
                if (match) {
                  return {
                    ...p,
                    bundled: true,
                    bundledUrl: match.bundledUrl || p.bundledUrl,
                  };
                }
                return BUNDLED_PHOTO_IDS.has(p.id) ? { ...p, bundled: true } : p;
              });
            const missingBundledPhotos = compiledBundled.photos.filter(
              (bp) => !existingIds.has(bp.id)
            );
            const existingAlbums = Array.isArray(stored.albums) ? stored.albums : [];
            const existingAlbumIds = new Set(existingAlbums.map((a) => a.id));
            const mergedBundledAlbums = [
              ...existingAlbums.map((a) => {
                const match = compiledBundled.albums.find((ba) => ba.id === a.id);
                return !a.coverPhotoId && match?.coverPhotoId
                  ? { ...a, coverPhotoId: match.coverPhotoId }
                  : a;
              }),
              ...compiledBundled.albums.filter((ba) => !existingAlbumIds.has(ba.id)),
            ];
            stored = {
              ...stored,
              albums: mergedBundledAlbums,
              photos: [...upgradedPhotos, ...missingBundledPhotos],
              bundledSeedStamp: compiledBundled.bundledSeedStamp,
            };
            await savePersistedState(stored);
          }
        }
        if (active && stored) {
          const def = createDefaultState();
          // Ensure newly introduced system albums (like all_over_memories) exist without losing any existing data
          const storedAlbums = Array.isArray(stored.albums) ? stored.albums : def.albums;
          const missingSystemAlbums = def.albums.filter(
            (da) => !storedAlbums.some((sa) => sa.id === da.id)
          );
          const mergedAlbums = [...storedAlbums, ...missingSystemAlbums];

          // Ensure bundled theme song exists for existing browser sessions without touching uploaded audio
          const storedAudioSlots = Array.isArray(stored.audioSlots) ? stored.audioSlots : def.audioSlots;
          const defaultBundledSlot = def.audioSlots.find((s) => s.id === BUNDLED_THEME_SONG_ID);
          const hasBundledSlot = storedAudioSlots.some((s) => s.id === BUNDLED_THEME_SONG_ID);
          const mergedAudioSlots =
            defaultBundledSlot && !hasBundledSlot
              ? [defaultBundledSlot, ...storedAudioSlots]
              : storedAudioSlots;

          const rawSceneTracks = {
            ...def.musicSettings.sceneTracks,
            ...(stored.musicSettings?.sceneTracks || {}),
          };
          const slotHasAudio = (id: string) =>
            mergedAudioSlots.some((s) => s.id === id && s.hasFile);
          const mergedSceneTracks: Record<SceneMusicKey, string> = {
            ...rawSceneTracks,
            opening: slotHasAudio(rawSceneTracks.opening)
              ? rawSceneTracks.opening
              : BUNDLED_THEME_SONG_ID,
            birthday: slotHasAudio(rawSceneTracks.birthday)
              ? rawSceneTracks.birthday
              : BUNDLED_THEME_SONG_ID,
            final_reveal: slotHasAudio(rawSceneTracks.final_reveal)
              ? rawSceneTracks.final_reveal
              : BUNDLED_THEME_SONG_ID,
          };

          const mergedEnabled = stored.musicSettings?.enabled ?? def.musicSettings.enabled;
          musicEnabledRef.current = mergedEnabled;

          // Merge safely so any newly added fields always exist
          setState({
            ...def,
            ...stored,
            albums: mergedAlbums,
            audioSlots: mergedAudioSlots,
            musicSettings: {
              ...def.musicSettings,
              ...stored.musicSettings,
              sceneTracks: mergedSceneTracks,
            },
            content: {
              ...def.content,
              ...stored.content,
              chapters: {
                ...def.content.chapters,
                ...(stored.content?.chapters || {}),
              },
              storyProgress: {
                ...def.content.storyProgress,
                ...(stored.content?.storyProgress || {}),
                highestUnlocked: TOTAL_LINEAR_STEPS,
                completed: true,
              },
            },
          });
        }
      } catch (err) {
        console.error('Failed to load saved state from IndexedDB:', err);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Persist state changes to IndexedDB
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      savePersistedState(state).catch((err) => console.error('Failed to persist state:', err));
    }, 150);
    return () => window.clearTimeout(timer);
  }, [state, ready]);

  // Android / browser hardware back button support via History API
  useEffect(() => {
    window.history.replaceState({ kishuScreen: 'first', payload: {} }, '');
    const handlePopState = (event: PopStateEvent) => {
      const target = event.state?.kishuScreen as ScreenId | undefined;
      const payload = (event.state?.payload as NavigationPayload) || {};
      if (target) {
        if (typeof payload.chapterIndex === 'number') {
          const step = Math.max(0, Math.min(TOTAL_LINEAR_STEPS, payload.chapterIndex));
          setState((prev) => ({
            ...prev,
            content: {
              ...prev.content,
              storyProgress: {
                ...prev.content.storyProgress,
                currentChapter: step,
              },
            },
          }));
        }
        setScreen(target);
        setNavPayload(payload);
        setHistoryStack((prev) => prev.slice(0, -1));
      } else {
        setScreen('first');
        setNavPayload({});
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback(
    (to: ScreenId, payload: NavigationPayload = {}) => {
      setHistoryStack((prev) => [...prev, { screen, payload: navPayload }]);
      setScreen(to);
      setNavPayload(payload);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      try {
        window.history.pushState({ kishuScreen: to, payload }, '');
      } catch {
        // Ignore history pushState restrictions in strict iframes
      }
    },
    [screen, navPayload]
  );

  const isLinearLocked = !state.content.storyProgress.completed;
  const isInStorySequence =
    isLinearLocked || typeof navPayload.chapterIndex === 'number';
  const currentLinearStep = Math.max(
    0,
    Math.min(TOTAL_LINEAR_STEPS, state.content.storyProgress.currentChapter || 0)
  );
  const highestUnlockedStep = Math.max(
    currentLinearStep,
    Math.min(TOTAL_LINEAR_STEPS, state.content.storyProgress.highestUnlocked || 0)
  );

  const startStoryFromStep = useCallback((step: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_LINEAR_STEPS, step));
    const targetScreen = LINEAR_STEP_SCREENS[clamped] || 'journey';
    setHistoryStack((prev) => [...prev, { screen, payload: navPayload }]);
    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        storyProgress: {
          ...prev.content.storyProgress,
          currentChapter: clamped,
          highestUnlocked: Math.max(prev.content.storyProgress.highestUnlocked || 0, clamped),
        },
      },
    }));
    setScreen(targetScreen);
    setNavPayload({ chapterIndex: clamped });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    try {
      window.history.pushState(
        { kishuScreen: targetScreen, payload: { chapterIndex: clamped } },
        ''
      );
    } catch {
      // Ignore history restrictions in iframes
    }
  }, [screen, navPayload]);

  const goToLinearStep = useCallback(
    (targetStep: number) => {
      const clamped = Math.max(0, Math.min(TOTAL_LINEAR_STEPS, targetStep));
      const allowedMax = state.content.storyProgress.completed
        ? TOTAL_LINEAR_STEPS
        : Math.max(1, state.content.storyProgress.highestUnlocked || 1);
      const safeStep = Math.min(clamped, allowedMax);
      const nextScreen = LINEAR_STEP_SCREENS[safeStep] || 'journey';

      setState((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          storyProgress: {
            ...prev.content.storyProgress,
            currentChapter: safeStep,
          },
        },
      }));
      setScreen(nextScreen);
      setNavPayload({ chapterIndex: safeStep });
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      try {
        window.history.pushState(
          { kishuScreen: nextScreen, payload: { chapterIndex: safeStep } },
          ''
        );
      } catch {
        // Ignore history restrictions in iframes
      }
    },
    [state.content.storyProgress.completed, state.content.storyProgress.highestUnlocked]
  );

  // Clicking Next on chapter N programmatically unlocks ONLY chapter N + 1
  const advanceLinearChapter = useCallback((fromStep: number) => {
    const nextStep = Math.max(1, Math.min(TOTAL_LINEAR_STEPS, fromStep + 1));
    const nextScreen = LINEAR_STEP_SCREENS[nextStep] || 'final_reveal';

    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        storyProgress: {
          ...prev.content.storyProgress,
          currentChapter: nextStep,
          highestUnlocked: Math.max(prev.content.storyProgress.highestUnlocked || 0, nextStep),
        },
      },
    }));
    setScreen(nextScreen);
    setNavPayload({ chapterIndex: nextStep });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    try {
      window.history.pushState(
        { kishuScreen: nextScreen, payload: { chapterIndex: nextStep } },
        ''
      );
    } catch {
      // Ignore history restrictions
    }
  }, []);

  const openGiftFromCover = useCallback(() => {
    const progress = state.content.storyProgress;
    if (progress.completed) {
      setScreen('journey');
      setNavPayload({});
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      try {
        window.history.pushState({ kishuScreen: 'journey', payload: {} }, '');
      } catch {
        // Ignore history restrictions in strict iframes
      }
      return;
    }
    // Start at Chapter 1 (Anaval Mahadev) or resume Kishu's exact saved linear chapter
    const targetStep =
      progress.currentChapter && progress.currentChapter >= 1
        ? Math.min(TOTAL_LINEAR_STEPS, progress.currentChapter)
        : 1;
    const targetScreen = LINEAR_STEP_SCREENS[targetStep] || 'journey';

    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        storyProgress: {
          ...prev.content.storyProgress,
          currentChapter: targetStep,
          highestUnlocked: Math.max(prev.content.storyProgress.highestUnlocked || 0, targetStep),
        },
      },
    }));
    setScreen(targetScreen);
    setNavPayload({ chapterIndex: targetStep });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    try {
      window.history.pushState(
        { kishuScreen: targetScreen, payload: { chapterIndex: targetStep } },
        ''
      );
    } catch {
      // Ignore history restrictions in strict iframes
    }
  }, [state.content.storyProgress]);

  const completeLinearJourney = useCallback(() => {
    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        storyProgress: {
          ...prev.content.storyProgress,
          currentChapter: TOTAL_LINEAR_STEPS,
          highestUnlocked: TOTAL_LINEAR_STEPS,
          completed: true,
        },
      },
    }));
  }, []);

  const goBack = useCallback(() => {
    if (historyStack.length > 0) {
      const last = historyStack[historyStack.length - 1];
      setHistoryStack((prev) => prev.slice(0, -1));
      if (typeof last.payload.chapterIndex === 'number') {
        const step = Math.max(0, Math.min(TOTAL_LINEAR_STEPS, last.payload.chapterIndex));
        setState((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            storyProgress: {
              ...prev.content.storyProgress,
              currentChapter: step,
            },
          },
        }));
      }
      setScreen(last.screen);
      setNavPayload(last.payload);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } else if (isLinearLocked && currentLinearStep > 1 && screen !== 'settings') {
      goToLinearStep(currentLinearStep - 1);
    } else if (isLinearLocked && currentLinearStep <= 1 && screen !== 'first' && screen !== 'settings') {
      setScreen('first');
      setNavPayload({});
    } else if (screen !== 'journey' && screen !== 'first') {
      setScreen('journey');
      setNavPayload({});
    }
  }, [historyStack, screen, isLinearLocked, currentLinearStep, goToLinearStep]);

  // Lazy-load photo object URLs on demand from IndexedDB
  const ensurePhotoLoaded = useCallback((photoId: string, variant: 'thumb' | 'full') => {
    const cacheKey = `${photoId}:${variant}`;
    if (variant === 'thumb' && thumbUrlsRef.current[photoId]) return;
    if (variant === 'full' && fullUrlsRef.current[photoId]) return;
    if (pendingPhotoLoads.current.has(cacheKey)) return;

    pendingPhotoLoads.current.add(cacheKey);
    getPhotoBlobs(photoId)
      .then((blobs) => {
        if (!blobs) return;
        const blob = variant === 'full' ? blobs.full : blobs.thumb;
        const url = URL.createObjectURL(blob);
        if (variant === 'thumb') {
          thumbUrlsRef.current[photoId] = url;
          setThumbUrls((prev) => ({ ...prev, [photoId]: url }));
        } else {
          fullUrlsRef.current[photoId] = url;
          setFullUrls((prev) => ({ ...prev, [photoId]: url }));
        }
      })
      .catch(() => {})
      .finally(() => {
        pendingPhotoLoads.current.delete(cacheKey);
      });
  }, []);

  const getPhotoUrl = useCallback(
    (photoId: string, variant: 'thumb' | 'full' = 'thumb'): string | null => {
      const photo = stateRef.current.photos.find((p) => p.id === photoId);
      if (photo?.bundledUrl) {
        return photo.bundledUrl;
      }
      if (photo?.bundled || BUNDLED_PHOTO_IDS.has(photoId)) {
        return `./bundled-photos/${photoId}_${variant}.jpg`;
      }
      if (variant === 'full') {
        const existing = fullUrls[photoId];
        if (!existing) {
          ensurePhotoLoaded(photoId, 'full');
          // Return thumb immediately as smooth progressive preview while full decodes
          return thumbUrls[photoId] || null;
        }
        return existing;
      }
      const existingThumb = thumbUrls[photoId];
      if (!existingThumb) {
        ensurePhotoLoaded(photoId, 'thumb');
        return null;
      }
      return existingThumb;
    },
    [thumbUrls, fullUrls, ensurePhotoLoaded]
  );

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(thumbUrlsRef.current).forEach((u) => URL.revokeObjectURL(u));
      Object.values(fullUrlsRef.current).forEach((u) => URL.revokeObjectURL(u));
      if (audioObjectUrlRef.current) URL.revokeObjectURL(audioObjectUrlRef.current);
    };
  }, []);

  // Initialize HTML5 Audio Element
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audioElRef.current = audio;

    const onTimeUpdate = () => setAudioCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setAudioDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const fadeVolume = useCallback((targetVolume: number, durationMs = 500, onDone?: () => void) => {
    const audio = audioElRef.current;
    if (!audio) return;
    if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);

    const startVol = audio.volume;
    const steps = 16;
    const interval = durationMs / steps;
    let currentStep = 0;

    fadeTimerRef.current = window.setInterval(() => {
      currentStep += 1;
      const progress = Math.min(1, currentStep / steps);
      audio.volume = Math.max(0, Math.min(1, startVol + (targetVolume - startVol) * progress));
      if (progress >= 1) {
        if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
        if (onDone) onDone();
      }
    }, interval);
  }, []);

  useEffect(() => {
    musicEnabledRef.current = state.musicSettings.enabled;
    const audio = audioElRef.current;
    if (!audio) return;
    if (!state.musicSettings.enabled) {
      audio.pause();
    } else if (isPlaying) {
      audio.volume = state.musicSettings.volume;
    }
  }, [state.musicSettings.enabled, state.musicSettings.volume, isPlaying]);

  const playTrackInternal = useCallback(
    async (trackId: string): Promise<boolean> => {
      const audio = audioElRef.current;
      if (!audio) return false;
      const slot = state.audioSlots.find((s) => s.id === trackId);
      if (!slot || !slot.hasFile) {
        return false;
      }

      if (activeTrackIdRef.current === trackId && !audio.paused) {
        return true;
      }

      try {
        if (activeTrackIdRef.current !== trackId || !audio.src) {
          if (slot.bundledUrl) {
            if (audioObjectUrlRef.current) {
              URL.revokeObjectURL(audioObjectUrlRef.current);
              audioObjectUrlRef.current = null;
            }
            audio.src = slot.bundledUrl;
            activeTrackIdRef.current = trackId;
            setActiveTrackId(trackId);
          } else {
            const blob = await getAudioBlob(trackId);
            if (!blob) return false;
            if (audioObjectUrlRef.current) {
              URL.revokeObjectURL(audioObjectUrlRef.current);
            }
            const url = URL.createObjectURL(blob);
            audioObjectUrlRef.current = url;
            audio.src = url;
            activeTrackIdRef.current = trackId;
            setActiveTrackId(trackId);
          }
        }

        audio.volume = 0.05;
        await audio.play();
        fadeVolume(state.musicSettings.volume, 700);
        return true;
      } catch {
        // Browser blocked autoplay before user gesture; handled by fallback unlock listener
        return false;
      }
    },
    [state.audioSlots, state.musicSettings.volume, fadeVolume]
  );

  const playTrack = useCallback(
    async (trackId: string) => {
      await playTrackInternal(trackId);
    },
    [playTrackInternal]
  );

  const playTrackInternalRef = useRef(playTrackInternal);
  playTrackInternalRef.current = playTrackInternal;

  // Auto-start the opening theme song as soon as the app opens
  useEffect(() => {
    if (!ready || autoPlayAttemptedRef.current) return;
    autoPlayAttemptedRef.current = true;

    const currentState = stateRef.current;
    if (!currentState.musicSettings.enabled) return;

    const openingId =
      currentState.musicSettings.sceneTracks.opening ||
      currentState.audioSlots.find((s) => s.hasFile)?.id;
    if (!openingId) return;

    const openingSlot = currentState.audioSlots.find((s) => s.id === openingId && s.hasFile);
    if (!openingSlot) return;

    // Pre-assign bundled audio source immediately so playback can start with zero latency
    const audio = audioElRef.current;
    if (audio && openingSlot.bundledUrl && !audio.src) {
      audio.src = openingSlot.bundledUrl;
      activeTrackIdRef.current = openingSlot.id;
      setActiveTrackId(openingSlot.id);
    }

    let cleanedUp = false;
    let gestureAttached = false;

    const removeGestureUnlock = () => {
      if (!gestureAttached) return;
      gestureAttached = false;
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    const handleFirstGesture = () => {
      removeGestureUnlock();
      if (!musicEnabledRef.current) return;
      const el = audioElRef.current;
      if (el && !el.paused) return;
      void playTrackInternalRef.current(openingSlot.id);
    };

    void playTrackInternalRef.current(openingSlot.id).then((started) => {
      if (!started && !cleanedUp && musicEnabledRef.current) {
        gestureAttached = true;
        window.addEventListener('click', handleFirstGesture);
        window.addEventListener('keydown', handleFirstGesture);
      }
    });

    return () => {
      cleanedUp = true;
      removeGestureUnlock();
    };
  }, [ready]);

  const pauseMusic = useCallback(() => {
    const audio = audioElRef.current;
    if (!audio || audio.paused) return;
    fadeVolume(0, 320, () => {
      audio.pause();
    });
  }, [fadeVolume]);

  const togglePlayPause = useCallback(async () => {
    const audio = audioElRef.current;
    if (!audio) return;
    if (!audio.paused) {
      pauseMusic();
      return;
    }
    const targetId =
      activeTrackId ||
      state.musicSettings.sceneTracks.opening ||
      state.audioSlots.find((s) => s.hasFile)?.id;
    if (!targetId) {
      showToast('Add a song in Our Song 🎵 to play music');
      return;
    }
    const slot = state.audioSlots.find((s) => s.id === targetId);
    if (!slot?.hasFile) {
      const firstAvailable = state.audioSlots.find((s) => s.hasFile);
      if (firstAvailable) {
        await playTrack(firstAvailable.id);
      } else {
        showToast('Add your audio files in Our Song 🎵');
      }
      return;
    }
    await playTrack(targetId);
  }, [activeTrackId, state.audioSlots, state.musicSettings.sceneTracks.opening, pauseMusic, playTrack, showToast]);

  const seekAudio = useCallback((time: number) => {
    const audio = audioElRef.current;
    if (!audio || Number.isNaN(time)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, time));
    setAudioCurrentTime(audio.currentTime);
  }, []);

  const triggerSceneMusic = useCallback(
    (scene: SceneMusicKey) => {
      if (!state.musicSettings.enabled || !state.musicSettings.backgroundPlay) return;
      const assignedId = state.musicSettings.sceneTracks[scene];
      const assignedSlot = state.audioSlots.find((s) => s.id === assignedId && s.hasFile);
      if (assignedSlot) {
        playTrack(assignedSlot.id);
        return;
      }
      // Fallback to first uploaded song only if nothing is currently playing
      if (!isPlaying) {
        const fallback = state.audioSlots.find((s) => s.hasFile);
        if (fallback) playTrack(fallback.id);
      }
    },
    [state.musicSettings, state.audioSlots, isPlaying, playTrack]
  );

  const toggleMusicMaster = useCallback(() => {
    setState((prev) => {
      const nextEnabled = !prev.musicSettings.enabled;
      musicEnabledRef.current = nextEnabled;
      if (!nextEnabled) {
        pauseMusic();
      } else {
        const firstId =
          prev.musicSettings.sceneTracks.opening ||
          prev.audioSlots.find((s) => s.hasFile)?.id;
        if (firstId && prev.audioSlots.some((s) => s.id === firstId && s.hasFile)) {
          setTimeout(() => playTrack(firstId), 40);
        }
      }
      return {
        ...prev,
        musicSettings: {
          ...prev.musicSettings,
          enabled: nextEnabled,
        },
      };
    });
  }, [pauseMusic, playTrack]);

  // Photo actions
  const uploadPhotos = useCallback(
    async (files: FileList | File[], albumId: string, chapterKey?: string): Promise<PhotoItem[]> => {
      const fileArr = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (fileArr.length === 0) return [];

      const created: PhotoItem[] = [];
      let baseOrder = state.photos.length;

      for (const file of fileArr) {
        try {
          const optimized = await optimizeImageFile(file);
          const id = makeId('photo');
          await savePhotoBlobs(id, { full: optimized.full, thumb: optimized.thumb });

          const thumbUrl = URL.createObjectURL(optimized.thumb);
          thumbUrlsRef.current[id] = thumbUrl;
          setThumbUrls((prev) => ({ ...prev, [id]: thumbUrl }));

          created.push({
            id,
            albumId,
            chapterKey,
            caption: '',
            order: baseOrder++,
            createdAt: Date.now(),
            width: optimized.width,
            height: optimized.height,
            mimeType: optimized.mimeType,
          });
        } catch (err) {
          console.error('Failed to process image:', err);
        }
      }

      if (created.length > 0) {
        setState((prev) => {
          const albums = prev.albums.map((alb) =>
            alb.id === albumId && !alb.coverPhotoId
              ? { ...alb, coverPhotoId: created[0].id }
              : alb
          );
          return {
            ...prev,
            albums,
            photos: [...prev.photos, ...created],
          };
        });
        showToast(
          created.length === 1
            ? '1 photo added & saved offline ❤️'
            : `${created.length} photos added & saved offline ❤️`
        );
      }

      return created;
    },
    [state.photos.length, showToast]
  );

  const updatePhoto = useCallback((photoId: string, patch: Partial<PhotoItem>) => {
    setState((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === photoId ? { ...p, ...patch } : p)),
    }));
  }, []);

  const deletePhoto = useCallback(
    async (photoId: string) => {
      await deletePhotoBlobs(photoId);
      if (thumbUrlsRef.current[photoId]) {
        URL.revokeObjectURL(thumbUrlsRef.current[photoId]);
        delete thumbUrlsRef.current[photoId];
      }
      if (fullUrlsRef.current[photoId]) {
        URL.revokeObjectURL(fullUrlsRef.current[photoId]);
        delete fullUrlsRef.current[photoId];
      }
      setThumbUrls((prev) => {
        const next = { ...prev };
        delete next[photoId];
        return next;
      });
      setFullUrls((prev) => {
        const next = { ...prev };
        delete next[photoId];
        return next;
      });
      setState((prev) => ({
        ...prev,
        photos: prev.photos.filter((p) => p.id !== photoId),
        albums: prev.albums.map((a) =>
          a.coverPhotoId === photoId ? { ...a, coverPhotoId: undefined } : a
        ),
        collages: prev.collages.map((c) => ({
          ...c,
          photoIds: c.photoIds.filter((id) => id !== photoId),
        })),
      }));
      showToast('Photo removed');
    },
    [showToast]
  );

  const reorderPhoto = useCallback(
    (photoId: string, direction: 'up' | 'down', subsetIds: string[]) => {
      const idx = subsetIds.indexOf(photoId);
      if (idx === -1) return;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= subsetIds.length) return;
      const targetId = subsetIds[swapIdx];

      setState((prev) => {
        const p1 = prev.photos.find((p) => p.id === photoId);
        const p2 = prev.photos.find((p) => p.id === targetId);
        if (!p1 || !p2) return prev;
        const order1 = p1.order;
        const order2 = p2.order;
        return {
          ...prev,
          photos: prev.photos.map((p) => {
            if (p.id === photoId) return { ...p, order: order2 };
            if (p.id === targetId) return { ...p, order: order1 };
            return p;
          }),
        };
      });
    },
    []
  );

  // Albums
  const createAlbum = useCallback(
    (name: string, subtitle: string): Album => {
      const album: Album = {
        id: makeId('album'),
        name: name.trim() || 'New Album',
        subtitle: subtitle.trim() || 'Our moments together',
        isSystem: false,
        createdAt: Date.now(),
      };
      setState((prev) => ({ ...prev, albums: [...prev.albums, album] }));
      showToast(`Created album "${album.name}"`);
      return album;
    },
    [showToast]
  );

  const setAlbumCover = useCallback(
    (albumId: string, photoId: string) => {
      setState((prev) => ({
        ...prev,
        albums: prev.albums.map((a) => (a.id === albumId ? { ...a, coverPhotoId: photoId } : a)),
      }));
      showToast('Album cover updated');
    },
    [showToast]
  );

  const deleteAlbum = useCallback(
    (albumId: string) => {
      setState((prev) => ({
        ...prev,
        albums: prev.albums.filter((a) => a.id !== albumId || a.isSystem),
        photos: prev.photos.map((p) => (p.albumId === albumId ? { ...p, albumId: 'random_us' } : p)),
      }));
      showToast('Album removed (photos moved to Random Us)');
    },
    [showToast]
  );

  // Collages
  const saveCollage = useCallback(
    (input: Omit<SavedCollage, 'id' | 'createdAt'> & { id?: string }): SavedCollage => {
      const id = input.id || makeId('collage');
      const record: SavedCollage = {
        id,
        title: input.title.trim() || 'Our Collage',
        caption: input.caption.trim(),
        layout: input.layout as CollageLayoutMode,
        photoIds: input.photoIds,
        createdAt: Date.now(),
      };
      setState((prev) => {
        const exists = prev.collages.some((c) => c.id === id);
        return {
          ...prev,
          collages: exists
            ? prev.collages.map((c) => (c.id === id ? record : c))
            : [record, ...prev.collages],
        };
      });
      showToast('Collage saved to Your Collages ❤️');
      return record;
    },
    [showToast]
  );

  const deleteCollage = useCallback(
    (collageId: string) => {
      setState((prev) => ({
        ...prev,
        collages: prev.collages.filter((c) => c.id !== collageId),
      }));
      showToast('Collage deleted');
    },
    [showToast]
  );

  // Reasons
  const addReason = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      setState((prev) => ({
        ...prev,
        reasons: [
          ...prev.reasons,
          { id: makeId('reason'), text: text.trim(), order: prev.reasons.length },
        ],
      }));
      showToast('Reason added ❤️');
    },
    [showToast]
  );

  const updateReason = useCallback((id: string, text: string) => {
    setState((prev) => ({
      ...prev,
      reasons: prev.reasons.map((r) => (r.id === id ? { ...r, text } : r)),
    }));
  }, []);

  const deleteReason = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        reasons: prev.reasons
          .filter((r) => r.id !== id)
          .map((r, i) => ({ ...r, order: i })),
      }));
      showToast('Reason removed');
    },
    [showToast]
  );

  const reorderReason = useCallback((id: string, direction: 'up' | 'down') => {
    setState((prev) => {
      const sorted = [...prev.reasons].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((r) => r.id === id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (idx === -1 || swapIdx < 0 || swapIdx >= sorted.length) return prev;
      [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];
      return {
        ...prev,
        reasons: sorted.map((r, i) => ({ ...r, order: i })),
      };
    });
  }, []);

  // Open When
  const addOpenWhen = useCallback(
    (title: string, subtitle: string, message: string, accent: OpenWhenCard['accent']) => {
      setState((prev) => ({
        ...prev,
        openWhen: [
          ...prev.openWhen,
          {
            id: makeId('ow'),
            title: title.trim() || 'Open when…',
            subtitle: subtitle.trim() || 'A personal note from Arpit',
            message: message.trim(),
            accent,
            order: prev.openWhen.length,
          },
        ],
      }));
      showToast('Envelope added 💌');
    },
    [showToast]
  );

  const updateOpenWhen = useCallback((id: string, patch: Partial<OpenWhenCard>) => {
    setState((prev) => ({
      ...prev,
      openWhen: prev.openWhen.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteOpenWhen = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        openWhen: prev.openWhen.filter((c) => c.id !== id),
      }));
      showToast('Envelope removed');
    },
    [showToast]
  );

  // Editable Content
  const updateContent = useCallback((updater: (prev: AppContent) => AppContent) => {
    setState((prev) => ({
      ...prev,
      content: updater(prev.content),
    }));
  }, []);

  // Audio Slot Management
  const uploadAudioForSlot = useCallback(
    async (slotId: string, file: File) => {
      await saveAudioBlob(slotId, file);
      if (activeTrackIdRef.current === slotId) {
        activeTrackIdRef.current = null;
      }
      setState((prev) => ({
        ...prev,
        audioSlots: prev.audioSlots.map((s) =>
          s.id === slotId
            ? {
                ...s,
                hasFile: true,
                fileName: file.name,
                mimeType: file.type || 'audio/mpeg',
                bundledUrl: undefined,
              }
            : s
        ),
      }));
      showToast(`Saved "${file.name}" offline 🎵`);
    },
    [showToast]
  );

  const removeAudioForSlot = useCallback(
    async (slotId: string) => {
      if (activeTrackId === slotId) {
        pauseMusic();
        activeTrackIdRef.current = null;
        setActiveTrackId(null);
      }
      await deleteAudioBlob(slotId);
      setState((prev) => ({
        ...prev,
        audioSlots: prev.audioSlots.map((s) =>
          s.id === slotId
            ? {
                ...s,
                hasFile: false,
                fileName: undefined,
                mimeType: undefined,
                bundledUrl: undefined,
              }
            : s
        ),
      }));
      showToast('Audio file removed');
    },
    [activeTrackId, pauseMusic, showToast]
  );

  const updateAudioSlotMeta = useCallback((slotId: string, patch: Partial<AudioTrackSlot>) => {
    setState((prev) => ({
      ...prev,
      audioSlots: prev.audioSlots.map((s) => (s.id === slotId ? { ...s, ...patch } : s)),
    }));
  }, []);

  const updateMusicSettings = useCallback((patch: Partial<MusicSettings>) => {
    if (typeof patch.enabled === 'boolean') {
      musicEnabledRef.current = patch.enabled;
    }
    setState((prev) => ({
      ...prev,
      musicSettings: {
        ...prev.musicSettings,
        ...patch,
        sceneTracks: patch.sceneTracks
          ? { ...prev.musicSettings.sceneTracks, ...patch.sceneTracks }
          : prev.musicSettings.sceneTracks,
      },
    }));
  }, []);

  const replaceAllState = useCallback(
    (nextState: PersistedAppState) => {
      // Clear cached photo URLs so new blobs hydrate fresh
      Object.values(thumbUrlsRef.current).forEach((u) => URL.revokeObjectURL(u));
      Object.values(fullUrlsRef.current).forEach((u) => URL.revokeObjectURL(u));
      thumbUrlsRef.current = {};
      fullUrlsRef.current = {};
      setThumbUrls({});
      setFullUrls({});

      const def = createDefaultState();
      const defaultBundledSlot = def.audioSlots.find((s) => s.id === BUNDLED_THEME_SONG_ID);
      const hasBundledSlot = nextState.audioSlots.some((s) => s.id === BUNDLED_THEME_SONG_ID);
      const mergedAudioSlots =
        defaultBundledSlot && !hasBundledSlot
          ? [defaultBundledSlot, ...nextState.audioSlots]
          : nextState.audioSlots;
      const slotHasAudio = (id: string) =>
        mergedAudioSlots.some((s) => s.id === id && s.hasFile);

      setState({
        ...nextState,
        audioSlots: mergedAudioSlots,
        musicSettings: {
          ...nextState.musicSettings,
          sceneTracks: {
            ...nextState.musicSettings.sceneTracks,
            opening: slotHasAudio(nextState.musicSettings.sceneTracks.opening)
              ? nextState.musicSettings.sceneTracks.opening
              : BUNDLED_THEME_SONG_ID,
          },
        },
      });
      showToast('Backup restored successfully ❤️');
    },
    [showToast]
  );

  const replayOurStory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        storyProgress: {
          currentChapter: 0,
          highestUnlocked: TOTAL_LINEAR_STEPS,
          completed: true,
          hasOpenedGift: false,
        },
      },
    }));
    setHistoryStack([]);
    setNavPayload({});
    setScreen('first');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    showToast('Ready to replay Our Story from the beginning ❤️');
  }, [showToast]);

  const resetEverything = useCallback(async () => {
    pauseMusic();
    activeTrackIdRef.current = null;
    setActiveTrackId(null);
    await clearAllDatabase();
    Object.values(thumbUrlsRef.current).forEach((u) => URL.revokeObjectURL(u));
    Object.values(fullUrlsRef.current).forEach((u) => URL.revokeObjectURL(u));
    thumbUrlsRef.current = {};
    fullUrlsRef.current = {};
    setThumbUrls({});
    setFullUrls({});
    const fresh = (await tryLoadBundledGiftArchive()) || createDefaultState();
    setState(fresh);
    await savePersistedState(fresh);
    showToast('App reset to initial gift state ❤️');
  }, [pauseMusic, showToast]);

  return (
    <AppContext.Provider
      value={{
        ready,
        state,
        screen,
        navPayload,
        navigate,
        goBack,
        toast,
        showToast,
        isLinearLocked,
        isInStorySequence,
        currentLinearStep,
        highestUnlockedStep,
        openGiftFromCover,
        startStoryFromStep,
        advanceLinearChapter,
        goToLinearStep,
        completeLinearJourney,
        getPhotoUrl,
        uploadPhotos,
        updatePhoto,
        deletePhoto,
        reorderPhoto,
        createAlbum,
        setAlbumCover,
        deleteAlbum,
        saveCollage,
        deleteCollage,
        addReason,
        updateReason,
        deleteReason,
        reorderReason,
        addOpenWhen,
        updateOpenWhen,
        deleteOpenWhen,
        updateContent,
        activeTrackId,
        isPlaying,
        audioCurrentTime,
        audioDuration,
        uploadAudioForSlot,
        removeAudioForSlot,
        updateAudioSlotMeta,
        updateMusicSettings,
        toggleMusicMaster,
        playTrack,
        pauseMusic,
        togglePlayPause,
        seekAudio,
        triggerSceneMusic,
        replaceAllState,
        replayOurStory,
        resetEverything,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
