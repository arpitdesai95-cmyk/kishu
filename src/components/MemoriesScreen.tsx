import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  FolderPlus,
  Grid2x2,
  ImagePlus,
  LayoutGrid,
  Play,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { SCENIC_ASSETS } from '../data/defaults';
import { getPhotoQuote, type QuoteCategory } from '../data/romanticQuotes';
import { useApp } from '../context/AppContext';
import type { PhotoItem } from '../types/app';
import { PhotoImage, ScenicImage } from './PhotoImage';
import { PhotoLightbox } from './PhotoLightbox';
import { TopBar } from './TopBar';

interface MemoriesScreenProps {
  mode?: 'all' | 'trips';
}

const FIREFLIES = [
  { left: '12%', top: '16%', delay: '0s', size: 4 },
  { left: '84%', top: '24%', delay: '1.1s', size: 3 },
  { left: '72%', top: '52%', delay: '0.5s', size: 5 },
  { left: '22%', top: '66%', delay: '1.9s', size: 3 },
];

function albumToQuoteCategory(albumId: string, mode: 'all' | 'trips'): QuoteCategory {
  if (mode === 'trips' || albumId === 'temples' || albumId === 'mountains' || albumId === 'trips_combined') {
    return 'trips';
  }
  if (albumId === 'first_memories') return 'anaval';
  if (albumId === 'movies') return 'movies';
  if (albumId === 'sugarcane') return 'sugarcane';
  if (albumId === 'hard_chapter') return 'hard_chapter';
  if (albumId === 'families_agreed') return 'families_agreed';
  if (albumId === 'birthday') return 'birthday';
  return 'all_over';
}

export const MemoriesScreen: React.FC<MemoriesScreenProps> = ({ mode = 'all' }) => {
  const {
    state,
    navPayload,
    navigate,
    isInStorySequence,
    advanceLinearChapter,
    goToLinearStep,
    uploadPhotos,
    deletePhoto,
    reorderPhoto,
    createAlbum,
    setAlbumCover,
    deleteAlbum,
  } = useApp();

  const isTripsStoryStep = mode === 'trips' && isInStorySequence;
  const isTwilightTheme = mode === 'trips';

  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(
    mode === 'trips' ? 'trips_combined' : navPayload.albumId || 'all'
  );
  // Default to Romantic Polaroids with Quotes instead of a plain sterile grid!
  const [viewMode, setViewMode] = useState<'polaroid' | 'grid'>('polaroid');
  const [manageMode, setManageMode] = useState(false);
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumSubtitle, setNewAlbumSubtitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<{
    photos: PhotoItem[];
    index: number;
    slideshow: boolean;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const visibleAlbums = useMemo(() => {
    if (mode === 'trips') {
      return state.albums.filter((a) => a.id === 'temples' || a.id === 'mountains');
    }
    return state.albums;
  }, [state.albums, mode]);

  const filteredPhotos = useMemo(() => {
    let list = [...state.photos];
    if (mode === 'trips') {
      if (selectedAlbumId === 'trips_combined') {
        list = list.filter((p) => p.albumId === 'temples' || p.albumId === 'mountains');
      } else {
        list = list.filter((p) => p.albumId === selectedAlbumId);
      }
    } else if (selectedAlbumId !== 'all') {
      list = list.filter((p) => p.albumId === selectedAlbumId);
    }
    return list.sort((a, b) => a.order - b.order);
  }, [state.photos, selectedAlbumId, mode]);

  const activeAlbum = useMemo(
    () => state.albums.find((a) => a.id === selectedAlbumId),
    [state.albums, selectedAlbumId]
  );

  const targetUploadAlbumId =
    selectedAlbumId === 'all'
      ? 'all_over_memories'
      : selectedAlbumId === 'trips_combined'
      ? 'temples'
      : selectedAlbumId;

  const quoteCategory = albumToQuoteCategory(selectedAlbumId, mode);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      await uploadPhotos(files, targetUploadAlbumId);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    const created = createAlbum(newAlbumName, newAlbumSubtitle);
    setSelectedAlbumId(created.id);
    setNewAlbumName('');
    setNewAlbumSubtitle('');
    setCreatingAlbum(false);
  };

  const subsetIds = filteredPhotos.map((p) => p.id);

  const heroPoem =
    mode === 'trips'
      ? state.content.chapters.ch2Body
      : selectedAlbumId === 'first_memories'
      ? state.content.chapters.ch1Body
      : activeAlbum?.subtitle ||
        'Every photograph here is a heartbeat I want to keep beside me forever.';

  return (
    <div
      className={`relative min-h-dvh pb-safe overflow-x-clip ${
        isTwilightTheme
          ? 'bg-[#1A0D14] text-[#FFF8F2]'
          : 'bg-blush-silk text-[#4A1220]'
      }`}
    >
      {/* Twilight Sunset Mountain Backdrop for Mountains & Temple Trips Chapter */}
      {isTwilightTheme && (
        <div className="fixed inset-0 z-0 pointer-events-none max-w-[460px] mx-auto overflow-hidden">
          <ScenicImage
            src={SCENIC_ASSETS.twilightPath}
            alt="Sunset mountains backdrop"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(24,10,18,0.82) 0%, rgba(34,14,24,0.62) 40%, rgba(20,9,15,0.96) 100%)',
            }}
          />
          {FIREFLIES.map((f, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[#FFEBB8] animate-float-mote"
              style={{
                left: f.left,
                top: f.top,
                width: `${f.size}px`,
                height: `${f.size}px`,
                animationDelay: f.delay,
                boxShadow: '0 0 12px 3px rgba(255, 214, 146, 0.72)',
              }}
            />
          ))}
        </div>
      )}

      <TopBar
        title={mode === 'trips' ? 'Mountains & Trips 🏔️' : 'Our Memories 📸'}
        dark={isTwilightTheme}
        onBack={isTripsStoryStep ? () => goToLinearStep(1) : undefined}
        rightAction={
          <button
            type="button"
            onClick={() => setManageMode((m) => !m)}
            aria-label={manageMode ? 'Done managing photos' : 'Manage photos'}
            className={`min-h-[38px] px-3 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap ${
              manageMode
                ? 'bg-[#A81C3B] text-white'
                : isTwilightTheme
                ? 'bg-white/12 border border-[#F5CFA2]/30 text-[#FFE5C0]'
                : 'bg-[#F6E2DF] text-[#7E1228]'
            }`}
          >
            {manageMode ? <Check className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
            <span>{manageMode ? 'Done' : 'Manage'}</span>
          </button>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      <main
        className={`relative z-10 px-4 pt-4 space-y-5 ${
          isTripsStoryStep || typeof navPayload.returnToBeat === 'number' ? 'pb-36' : 'pb-24'
        }`}
      >
        {/* TOP ROMANTIC POETIC BANNER ("upar bdhya kuchh likha tha") */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className={`rounded-[26px] p-5 text-center space-y-2.5 ${
            isTwilightTheme
              ? 'bg-[#28101C]/78 border border-[#F5CFA2]/32 backdrop-blur-md shadow-[0_14px_36px_rgba(0,0,0,0.38)]'
              : 'scrapbook-velvet text-[#FFF8F0]'
          }`}
        >
          <p className="font-script text-[30px] leading-tight text-[#FFE7C4]">
            {mode === 'trips'
              ? 'Temples, long drives & quiet mornings…'
              : activeAlbum
              ? 'A treasured chapter of us…'
              : 'Every frame holds a piece of my heart…'}
          </p>
          <h2 className="font-display text-[32px] leading-tight font-semibold text-[#FFFDF9] text-balance">
            {activeAlbum
              ? activeAlbum.name
              : mode === 'trips'
              ? 'Our Journeys Together 🛕🏔️'
              : 'Every Memory Together ♡'}
          </h2>
          <div className="flex items-center justify-center gap-3 py-0.5" aria-hidden="true">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#F5CFA2]/65" />
            <span className="text-[11px] text-[#F5B0B8]">♡</span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#F5CFA2]/65" />
          </div>
          <p className="font-display italic text-[19px] leading-snug text-[#FFF5E9]/92 max-w-[330px] mx-auto">
            “{heroPoem}”
          </p>

          {/* Subtle Action Bar Inside Banner */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[42px] px-4 rounded-full bg-[#FCE8D8] text-[#6C1023] text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              <span>{uploading ? 'Saving…' : 'Add Photos'}</span>
            </button>

            {filteredPhotos.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setLightbox({ photos: filteredPhotos, index: 0, slideshow: true })
                }
                className="min-h-[42px] px-4 rounded-full bg-white/14 border border-[#F5CFA2]/40 text-[#FFF8F0] text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <Play className="w-3.5 h-3.5 text-[#F6CFA0] fill-current" />
                <span>Slideshow</span>
              </button>
            )}

            {mode !== 'trips' && (
              <button
                type="button"
                onClick={() =>
                  navigate('collage', {
                    collagePhotoIds: filteredPhotos.slice(0, 12).map((p) => p.id),
                    returnToBeat: navPayload.returnToBeat,
                    nextBeatLabel: navPayload.nextBeatLabel,
                  })
                }
                className="min-h-[42px] px-3.5 rounded-full bg-white/12 border border-white/25 text-[#FFF8F0] text-xs font-semibold flex items-center gap-1.5"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#F6CFA0]" />
                <span>Collage</span>
              </button>
            )}
          </div>
        </motion.section>

        {/* Album Filter & Polaroid/Grid View Switcher */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {mode === 'all' ? (
              <button
                type="button"
                onClick={() => setSelectedAlbumId('all')}
                className={`min-h-[38px] px-3.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  selectedAlbumId === 'all'
                    ? 'bg-[#8B132C] text-[#FFF9F2] shadow-sm'
                    : 'bg-[#F3E4DB] text-[#6A2837]'
                }`}
              >
                All ({state.photos.length})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedAlbumId('trips_combined')}
                className={`min-h-[38px] px-3.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  selectedAlbumId === 'trips_combined'
                    ? 'bg-[#FFE5C0] text-[#4A0F1E] shadow-sm'
                    : 'bg-white/12 border border-[#F5CFA2]/25 text-[#FFF3E6]/88'
                }`}
              >
                All Trips (
                {state.photos.filter((p) => p.albumId === 'temples' || p.albumId === 'mountains').length}
                )
              </button>
            )}

            {visibleAlbums.map((alb) => {
              const count = state.photos.filter((p) => p.albumId === alb.id).length;
              const active = selectedAlbumId === alb.id;
              return (
                <button
                  key={alb.id}
                  type="button"
                  onClick={() => setSelectedAlbumId(alb.id)}
                  className={`min-h-[38px] px-3.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? isTwilightTheme
                        ? 'bg-[#FFE5C0] text-[#4A0F1E] shadow-sm'
                        : 'bg-[#8B132C] text-white shadow-sm'
                      : isTwilightTheme
                      ? 'bg-white/12 border border-[#F5CFA2]/25 text-[#FFF3E6]/88'
                      : 'bg-[#F3E4DB] text-[#6A2837]'
                  }`}
                >
                  {alb.name} ({count})
                </button>
              );
            })}

            {mode === 'all' && (
              <button
                type="button"
                onClick={() => setCreatingAlbum(true)}
                className="min-h-[38px] px-3.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border border-dashed border-[#8B132C]/40 text-[#8B132C] flex items-center gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New Album</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-1">
            <span
              className={`text-xs font-medium tabular-nums ${
                isTwilightTheme ? 'text-[#F5CFA2]/82' : 'text-[#7E4350]'
              }`}
            >
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'memory' : 'memories'}
              {manageMode ? ' · Manage mode active' : ' · Tap any photo to read or caption'}
            </span>

            {/* Toggle Romantic Polaroids with Quotes vs Compact Grid */}
            <div
              className={`inline-flex rounded-full p-0.5 ${
                isTwilightTheme
                  ? 'bg-white/10 border border-[#F5CFA2]/25'
                  : 'bg-[#F4E3DA] border border-[#D8A86C]/35'
              }`}
            >
              <button
                type="button"
                onClick={() => setViewMode('polaroid')}
                aria-label="Romantic Polaroids with quotes"
                className={`min-h-[32px] px-2.5 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'polaroid'
                    ? isTwilightTheme
                      ? 'bg-[#FFE5C0] text-[#4A0F1E]'
                      : 'bg-[#8B132C] text-white'
                    : isTwilightTheme
                    ? 'text-[#FFE8CC]/75'
                    : 'text-[#7A3544]'
                }`}
              >
                <Grid2x2 className="w-3 h-3" />
                <span>Quotes</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Compact photo grid"
                className={`min-h-[32px] px-2.5 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'grid'
                    ? isTwilightTheme
                      ? 'bg-[#FFE5C0] text-[#4A0F1E]'
                      : 'bg-[#8B132C] text-white'
                    : isTwilightTheme
                    ? 'text-[#FFE8CC]/75'
                    : 'text-[#7A3544]'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Grid</span>
              </button>
            </div>
          </div>

          {activeAlbum && !activeAlbum.isSystem && manageMode && (
            <button
              type="button"
              onClick={() => {
                deleteAlbum(activeAlbum.id);
                setSelectedAlbumId('all');
              }}
              className="min-h-[38px] px-3 rounded-xl bg-[#FCE8E8] text-[#A8323B] text-xs font-medium"
            >
              Delete Custom Album
            </button>
          )}
        </section>

        {/* Album Cover Shelf when viewing All in Vault */}
        {mode === 'all' && selectedAlbumId === 'all' && (
          <section className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#8A3B4C] px-1">Memory Albums</h3>
            <div className="grid grid-cols-2 gap-3">
              {state.albums.map((alb, i) => {
                const albPhotos = state.photos.filter((p) => p.albumId === alb.id);
                const coverId = alb.coverPhotoId || albPhotos[0]?.id;
                return (
                  <button
                    key={alb.id}
                    type="button"
                    onClick={() => setSelectedAlbumId(alb.id)}
                    style={{ transform: `rotate(${i % 2 === 0 ? '-0.8deg' : '0.8deg'})` }}
                    className="polaroid-frame p-2 pb-3.5 rounded-[4px] text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="h-24 bg-[#EFE3DA] relative overflow-hidden rounded-[2px]">
                      {coverId ? (
                        <PhotoImage photoId={coverId} variant="thumb" alt={alb.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[11px] text-[#9C7C72]">
                          Tap to add photos
                        </div>
                      )}
                    </div>
                    <div className="pt-2 px-0.5">
                      <p className="font-display text-[17px] leading-tight font-semibold text-[#4A1220] truncate">
                        {alb.name}
                      </p>
                      <p className="text-[10.5px] text-[#8E4958] tabular-nums">
                        {albPhotos.length} {albPhotos.length === 1 ? 'photo' : 'photos'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* PHOTOS SECTION: ROMANTIC POLAROIDS WITH QUOTES (DEFAULT) OR COMPACT GRID */}
        {filteredPhotos.length === 0 ? (
          <div
            className={`rounded-[26px] border-2 border-dashed p-8 text-center space-y-3 ${
              isTwilightTheme
                ? 'bg-[#26101B]/65 border-[#F5CFA2]/35 text-[#FFF6EC]'
                : 'bg-[#FFFBF7] border-[#D8A86C]/55 text-[#4A1220]'
            }`}
          >
            <ImagePlus
              className={`w-8 h-8 mx-auto ${
                isTwilightTheme ? 'text-[#F5CFA2]' : 'text-[#8B132C]/80'
              }`}
            />
            <h3 className="font-display text-2xl font-semibold">
              Ready for Your Real Photos ♡
            </h3>
            <p
              className={`text-xs leading-relaxed max-w-[280px] mx-auto ${
                isTwilightTheme ? 'text-[#F5D6B2]/80' : 'text-[#7E4350]'
              }`}
            >
              Select as many photos as you like at once. Every photo turns into a romantic Polaroid with a heartfelt quote.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-wine-glow mt-2 min-h-[46px] px-6 rounded-full text-white text-sm font-semibold"
            >
              Upload Photos Now
            </button>
          </div>
        ) : viewMode === 'polaroid' ? (
          /* ROMANTIC POLAROID STORY FEED WITH QUOTES UNDERNEATH EVERY PHOTO */
          <div className="space-y-6 pt-1">
            {filteredPhotos.map((photo, idx) => {
              const isCover = activeAlbum?.coverPhotoId === photo.id;
              const tilt = idx % 2 === 0 ? '-1.1deg' : '1.1deg';
              const quote = getPhotoQuote(quoteCategory, idx, photo.caption);
              return (
                <article
                  key={photo.id}
                  style={{ transform: `rotate(${tilt})` }}
                  className="polaroid-frame p-2.5 pb-5 rounded-[4px] max-w-[365px] mx-auto relative shadow-[0_16px_36px_rgba(24,8,14,0.34)]"
                >
                  <div className="relative w-full overflow-hidden rounded-[2px] bg-[#2C1620]">
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox({ photos: filteredPhotos, index: idx, slideshow: false })
                      }
                      className="w-full block"
                    >
                      <PhotoImage
                        photoId={photo.id}
                        variant="full"
                        alt={photo.caption || `Memory ${idx + 1}`}
                        className="w-full h-auto max-h-[500px] object-cover object-top block"
                      />
                    </button>

                    {manageMode && (
                      <div className="absolute inset-0 bg-black/55 flex flex-col justify-between p-2.5">
                        <div className="flex justify-between">
                          <button
                            type="button"
                            onClick={() => setAlbumCover(photo.albumId, photo.id)}
                            aria-label="Set as album cover"
                            className={`w-9 h-9 rounded-full flex items-center justify-center ${
                              isCover ? 'bg-[#E9AE71] text-[#1C1014]' : 'bg-black/60 text-white'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${isCover ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePhoto(photo.id)}
                            aria-label="Delete photo"
                            className="w-9 h-9 rounded-full bg-[#B84A52] text-white flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex justify-between">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderPhoto(photo.id, 'up', subsetIds)}
                            aria-label="Move earlier"
                            className="w-9 h-9 rounded-full bg-black/65 text-white flex items-center justify-center disabled:opacity-30"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === filteredPhotos.length - 1}
                            onClick={() => reorderPhoto(photo.id, 'down', subsetIds)}
                            aria-label="Move later"
                            className="w-9 h-9 rounded-full bg-black/65 text-white flex items-center justify-center disabled:opacity-30"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Handwritten Romantic Quote Underneath Each Photo */}
                  <div className="mt-3.5 px-2 text-center space-y-1.5">
                    <p className="font-display italic text-[19px] leading-snug text-[#4E1524]">
                      “{quote}”
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10.5px] text-[#9A4254]">
                      <span className="font-script text-[18px] leading-none text-[#8B132C]">
                        Kishu &amp; Arpit ♡
                      </span>
                      <span className="tabular-nums opacity-70">#{idx + 1}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* COMPACT 3-COLUMN GRID (OPTIONAL QUICK BROWSE) */
          <div className="grid grid-cols-3 gap-2">
            {filteredPhotos.map((photo, idx) => {
              const isCover = activeAlbum?.coverPhotoId === photo.id;
              return (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-[#2C1620]/20 border border-[#D8A86C]/30"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox({ photos: filteredPhotos, index: idx, slideshow: false })
                    }
                    className="w-full h-full block"
                  >
                    <PhotoImage
                      photoId={photo.id}
                      variant="thumb"
                      alt={photo.caption || 'Memory photo'}
                    />
                  </button>

                  {photo.caption && !manageMode && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 py-1.5 pointer-events-none">
                      <p className="text-[10px] text-white truncate">{photo.caption}</p>
                    </div>
                  )}

                  {manageMode && (
                    <div className="absolute inset-0 bg-black/52 flex flex-col justify-between p-1.5">
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => setAlbumCover(photo.albumId, photo.id)}
                          aria-label="Set as album cover"
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCover ? 'bg-[#E9AE71] text-[#1C1014]' : 'bg-black/55 text-white'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isCover ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePhoto(photo.id)}
                          aria-label="Delete photo"
                          className="w-8 h-8 rounded-full bg-[#B84A52] text-white flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => reorderPhoto(photo.id, 'up', subsetIds)}
                          aria-label="Move earlier"
                          className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filteredPhotos.length - 1}
                          onClick={() => reorderPhoto(photo.id, 'down', subsetIds)}
                          aria-label="Move later"
                          className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create New Album Sheet */}
      {creatingAlbum && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <form
            onSubmit={handleCreateAlbum}
            className="w-full max-w-[460px] rounded-t-3xl bg-[#FDF8F4] text-[#4A1220] p-5 pb-safe space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">Create New Album</h3>
              <button
                type="button"
                onClick={() => setCreatingAlbum(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-[#7A5C54]">Album Name</span>
              <input
                type="text"
                required
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="e.g. Ujjain Trip 🛕"
                className="mt-1 w-full min-h-[46px] rounded-xl border border-[#8A4F40]/20 bg-white px-3.5 text-sm focus:outline-none focus:border-[#B84A52]"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-[#7A5C54]">Short Subtitle</span>
              <input
                type="text"
                value={newAlbumSubtitle}
                onChange={(e) => setNewAlbumSubtitle(e.target.value)}
                placeholder="A short note about this album"
                className="mt-1 w-full min-h-[46px] rounded-xl border border-[#8A4F40]/20 bg-white px-3.5 text-sm focus:outline-none focus:border-[#B84A52]"
              />
            </label>

            <button
              type="submit"
              className="btn-wine-glow w-full min-h-[50px] rounded-full text-white text-sm font-semibold"
            >
              Create Album
            </button>
          </form>
        </div>
      )}

      {/* STICKY NEXT BUTTON IN STORY SEQUENCE (MOUNTAINS & TRIPS -> MOVIE MEMORIES) */}
      {(isTripsStoryStep || typeof navPayload.returnToBeat === 'number') &&
        !lightbox &&
        !creatingAlbum && (
          <div className="fixed bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none">
            <div
              className={`w-full max-w-[460px] px-5 pt-6 pb-safe pb-5 pointer-events-auto ${
                isTwilightTheme
                  ? 'bg-gradient-to-t from-[#160A11] via-[#160A11]/95 to-transparent'
                  : 'bg-gradient-to-t from-[#FDF3EC] via-[#FDF3EC]/95 to-transparent'
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  isTripsStoryStep
                    ? advanceLinearChapter(2)
                    : navigate('journey', { returnToBeat: navPayload.returnToBeat })
                }
                className="btn-wine-glow w-full min-h-[54px] rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <span>
                  {isTripsStoryStep
                    ? 'Next Memory: Movie Nights 🎬'
                    : navPayload.nextBeatLabel || 'Continue Our Story'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#FFE2BD]" />
              </button>
            </div>
          </div>
        )}

      {lightbox && (
        <PhotoLightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          startSlideshow={lightbox.slideshow}
          albumIdForCover={activeAlbum?.id}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
};
