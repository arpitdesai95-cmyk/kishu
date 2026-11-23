export type ScreenId =
  | 'first'
  | 'journey'
  | 'memories'
  | 'trips'
  | 'movies'
  | 'sugarcane'
  | 'why_love'
  | 'open_when'
  | 'collage'
  | 'birthday'
  | 'all_over_memories'
  | 'song'
  | 'final_reveal'
  | 'settings';

export type SceneMusicKey =
  | 'opening'
  | 'story'
  | 'hard_chapter'
  | 'birthday'
  | 'final_reveal';

export type MovieLayoutMode =
  | 'poster'
  | 'film-strip'
  | 'polaroid'
  | 'dense-grid'
  | 'scrapbook'
  | 'cinematic-collage'
  | 'slideshow';

export type CollageLayoutMode =
  | '2-photo'
  | '4-photo'
  | '6-photo'
  | '9-photo'
  | '12-photo'
  | 'dense'
  | 'polaroid'
  | 'heart'
  | 'film-strip'
  | 'scrapbook'
  | 'cinematic';

export interface Album {
  id: string;
  name: string;
  subtitle: string;
  coverPhotoId?: string;
  isSystem?: boolean;
  createdAt: number;
}

export interface PhotoItem {
  id: string;
  albumId: string;
  chapterKey?: string;
  caption: string;
  dateLabel?: string;
  order: number;
  createdAt: number;
  width: number;
  height: number;
  mimeType: string;
  bundled?: boolean;
  bundledUrl?: string;
}

export interface SavedCollage {
  id: string;
  title: string;
  caption: string;
  layout: CollageLayoutMode;
  photoIds: string[];
  createdAt: number;
}

export interface ReasonItem {
  id: string;
  text: string;
  order: number;
}

export interface OpenWhenCard {
  id: string;
  title: string;
  subtitle: string;
  message: string;
  accent: 'rose' | 'gold' | 'plum' | 'sage' | 'dusk' | 'blush';
  order: number;
}

export interface AudioTrackSlot {
  id: string;
  title: string;
  artist: string;
  description: string;
  hasFile: boolean;
  fileName?: string;
  mimeType?: string;
  bundledUrl?: string;
  isSystem?: boolean;
}

export interface MusicSettings {
  enabled: boolean;
  backgroundPlay: boolean;
  volume: number;
  sceneTracks: Record<SceneMusicKey, string>;
}

export interface StoryChaptersContent {
  ch1Title: string;
  ch1Lead: string;
  ch1Place: string;
  ch1Body: string;
  ch2Title: string;
  ch2Subtitle: string;
  ch2Body: string;
  ch3Title: string;
  ch3Body: string;
  ch4Title: string;
  ch4Lines: string[];
  ch4Body: string;
  ch5Title: string;
  ch5Lines: string[];
  ch5Body: string;
  ch6Steps: string[];
  ch6BirthdayHeading: string;
  ch6GirlfriendLine: string;
  ch6NextTimeLine: string;
  ch6WifeLine: string;
}

export interface AppContent {
  chapters: StoryChaptersContent;
  movieQuote: string;
  movieLayout: MovieLayoutMode;
  sugarcaneLines: string[];
  sugarcaneCaption: string;
  birthdayHeading: string;
  birthdayLetter: string;
  ujjainEnabled: boolean;
  ujjainNote: string;
  finalRevealLines: string[];
  finalRevealMilestone: string;
  finalRevealEnding: string;
  storyProgress: {
    currentChapter: number;
    highestUnlocked?: number;
    completed: boolean;
    hasOpenedGift: boolean;
  };
}

export interface PersistedAppState {
  version: number;
  bundledSeedStamp?: string;
  albums: Album[];
  photos: PhotoItem[];
  collages: SavedCollage[];
  reasons: ReasonItem[];
  openWhen: OpenWhenCard[];
  audioSlots: AudioTrackSlot[];
  musicSettings: MusicSettings;
  content: AppContent;
}
