import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Grid2x2,
  ImagePlus,
  LayoutGrid,
  Play,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { SCENIC_ASSETS } from '../data/defaults';
import { getPhotoQuote } from '../data/romanticQuotes';
import { useApp } from '../context/AppContext';
import type { PhotoItem } from '../types/app';
import { PhotoImage, ScenicImage } from './PhotoImage';
import { PhotoLightbox } from './PhotoLightbox';
import { TopBar } from './TopBar';

type ViewStyle = 'polaroid' | 'dense';
type ScopeMode = 'remaining' | 'everything';

const FIREFLIES = [
  { left: '16%', top: '18%', delay: '0s', size: 4 },
  { left: '84%', top: '26%', delay: '1.2s', size: 3 },
  { left: '70%', top: '54%', delay: '0.6s', size: 5 },
  { left: '24%', top: '72%', delay: '2.0s', size: 3 },
];

export const AllOverMemoriesScreen: React.FC = () => {
  const {
    state,
    isInStorySequence,
    advanceLinearChapter,
    goToLinearStep,
    uploadPhotos,
    deletePhoto,
    reorderPhoto,
  } = useApp();

  // Default to Romantic Polaroids with Quotes!
  const [viewStyle, setViewStyle] = useState<ViewStyle>('polaroid');
  const [scope, setScope] = useState<ScopeMode>('remaining');
  const [manageMode, setManageMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<{
    photos: PhotoItem[];
    index: number;
    slideshow: boolean;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const remainingPhotos = useMemo(
    () =>
      state.photos
        .filter((p) => p.albumId === 'all_over_memories' || p.albumId === 'random_us')
        .sort((a, b) => a.order - b.order),
    [state.photos]
  );

  const allPhotosSorted = useMemo(
    () => [...state.photos].sort((a, b) => a.order - b.order),
    [state.photos]
  );

  const visiblePhotos = scope === 'remaining' ? remainingPhotos : allPhotosSorted;
  const subsetIds = visiblePhotos.map((p) => p.id);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      await uploadPhotos(files, 'all_over_memories');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="relative min-h-dvh bg-[#1A0D14] text-[#FFF8F2] pb-safe overflow-x-clip">
      {/* Twilight Sunset Mountain Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none max-w-[460px] mx-auto overflow-hidden">
        <ScenicImage
          src={SCENIC_ASSETS.twilightPath}
          alt="Twilight sunset sky"
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(24,10,18,0.82) 0%, rgba(34,14,24,0.62) 45%, rgba(20,9,15,0.96) 100%)',
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

      <TopBar
        title="All Over Memories 📸"
        dark
        onBack={isInStorySequence ? () => goToLinearStep(10) : undefined}
        rightAction={
          <button
            type="button"
            onClick={() => setManageMode((m) => !m)}
            aria-label={manageMode ? 'Done managing' : 'Manage photos'}
            className={`min-h-[38px] px-3 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap ${
              manageMode
                ? 'bg-[#A81C3B] text-white'
                : 'bg-white/12 border border-[#F5CFA2]/30 text-[#FFE5C0]'
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
        onChange={handleBulkUpload}
      />

      <main className={`relative z-10 px-4 pt-4 space-y-5 ${isInStorySequence ? 'pb-36' : 'pb-16'}`}>
        {/* Romantic Velvet Header with Poetic Quote */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-[26px] bg-[#28101C]/80 border border-[#F5CFA2]/35 backdrop-blur-md p-5 text-[#FFF8F0] text-center space-y-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.4)]"
        >
          <Sparkles className="w-4 h-4 text-[#F6CFA0] mx-auto opacity-85" />
          <h2 className="font-script text-[42px] leading-tight text-[#FFE8CA]">
            All Over Memories ♡
          </h2>
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#F5CFA2]/65" />
            <span className="text-[11px] text-[#F5B0B8]">♡</span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#F5CFA2]/65" />
          </div>
          <p className="font-display italic text-[19px] leading-snug text-[#FFF4E8]/92 max-w-[330px] mx-auto">
            “Beyond every big milestone… these are all our little smiles, random days, and every unspoken memory of us from day one until today.”
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[42px] px-4 rounded-full bg-[#FCE8D8] text-[#6C1023] text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
            >
              <ImagePlus className="w-4 h-4" />
              <span>{uploading ? 'Saving Photos…' : 'Upload Photos (Many at Once)'}</span>
            </button>
            {visiblePhotos.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setLightbox({ photos: visiblePhotos, index: 0, slideshow: true })
                }
                className="min-h-[42px] px-4 rounded-full bg-white/14 border border-[#F5CFA2]/40 text-[#FFF8F0] text-xs font-semibold flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-[#F6CFA0] fill-current" />
                <span>Slideshow</span>
              </button>
            )}
          </div>
        </motion.section>

        {/* Scope & View Mode Controls */}
        <section className="flex items-center justify-between gap-2">
          <div className="inline-flex rounded-full bg-white/10 p-1 border border-[#F5CFA2]/28">
            <button
              type="button"
              onClick={() => setScope('remaining')}
              className={`min-h-[34px] px-3 rounded-full text-[11px] font-semibold transition-colors ${
                scope === 'remaining'
                  ? 'bg-[#FFE5C0] text-[#4A0F1E] shadow-xs'
                  : 'text-[#FFE8CC]/80'
              }`}
            >
              All Over ({remainingPhotos.length})
            </button>
            <button
              type="button"
              onClick={() => setScope('everything')}
              className={`min-h-[34px] px-3 rounded-full text-[11px] font-semibold transition-colors ${
                scope === 'everything'
                  ? 'bg-[#FFE5C0] text-[#4A0F1E] shadow-xs'
                  : 'text-[#FFE8CC]/80'
              }`}
            >
              Entire Journey ({allPhotosSorted.length})
            </button>
          </div>

          <div className="inline-flex rounded-full bg-white/10 p-1 border border-[#F5CFA2]/28">
            <button
              type="button"
              onClick={() => setViewStyle('polaroid')}
              aria-label="Romantic Polaroids with quotes"
              className={`min-h-[34px] min-w-[36px] rounded-full flex items-center justify-center ${
                viewStyle === 'polaroid' ? 'bg-[#FFE5C0] text-[#4A0F1E]' : 'text-[#FFE8CC]/80'
              }`}
            >
              <Grid2x2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewStyle('dense')}
              aria-label="Dense photo wall"
              className={`min-h-[34px] min-w-[36px] rounded-full flex items-center justify-center ${
                viewStyle === 'dense' ? 'bg-[#FFE5C0] text-[#4A0F1E]' : 'text-[#FFE8CC]/80'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Photo Wall */}
        {visiblePhotos.length === 0 ? (
          <div className="rounded-[28px] bg-[#26101B]/72 border-2 border-dashed border-[#F5CFA2]/35 p-8 text-center space-y-3">
            <ImagePlus className="w-9 h-9 text-[#F5CFA2] mx-auto" />
            <h3 className="font-display text-2xl font-semibold text-[#FFF7EE]">
              Drop All Your Remaining Photos Here ♡
            </h3>
            <p className="text-xs leading-relaxed text-[#F5D6B2]/82 max-w-[290px] mx-auto">
              Select 10, 50, or 100+ photos of both of you from day one until today. Every photo automatically turns into a warm Polaroid with a love quote, saved privately offline.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-wine-glow mt-2 min-h-[48px] px-6 rounded-full text-white text-xs font-semibold"
            >
              Choose Photos from Phone 📸
            </button>
          </div>
        ) : viewStyle === 'polaroid' ? (
          <div className="space-y-6 pt-1">
            {visiblePhotos.map((photo, idx) => {
              const quote = getPhotoQuote('all_over', idx, photo.caption);
              return (
                <article
                  key={photo.id}
                  style={{ transform: `rotate(${idx % 2 === 0 ? '-1.1deg' : '1.1deg'})` }}
                  className="polaroid-frame p-2.5 pb-5 rounded-[4px] max-w-[365px] mx-auto relative shadow-[0_18px_38px_rgba(0,0,0,0.45)]"
                >
                  <div className="relative w-full overflow-hidden rounded-[2px] bg-[#2C1620]">
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox({ photos: visiblePhotos, index: idx, slideshow: false })
                      }
                      className="w-full block"
                    >
                      <PhotoImage
                        photoId={photo.id}
                        variant="full"
                        alt={photo.caption || 'Memory of us'}
                        className="w-full h-auto max-h-[500px] object-cover object-top block"
                      />
                    </button>

                    {manageMode && (
                      <div className="absolute inset-0 bg-black/55 flex flex-col justify-between p-2.5">
                        <div className="flex justify-end">
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
                            disabled={idx === visiblePhotos.length - 1}
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
          <div className="grid grid-cols-3 gap-1.5">
            {visiblePhotos.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-xl overflow-hidden bg-[#2C1620] border border-[#F5CFA2]/25"
              >
                <button
                  type="button"
                  onClick={() =>
                    setLightbox({ photos: visiblePhotos, index: idx, slideshow: false })
                  }
                  className="w-full h-full block"
                >
                  <PhotoImage
                    photoId={photo.id}
                    variant="thumb"
                    alt={photo.caption || 'Memory of us'}
                  />
                </button>
                {photo.caption && !manageMode && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 py-1 pointer-events-none">
                    <p className="text-[9.5px] text-white truncate">{photo.caption}</p>
                  </div>
                )}
                {manageMode && (
                  <div className="absolute inset-0 bg-black/55 flex flex-col justify-between p-1.5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => deletePhoto(photo.id)}
                        aria-label="Delete photo"
                        className="w-7 h-7 rounded-full bg-[#B84A52] text-white flex items-center justify-center"
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
                        className="w-7 h-7 rounded-full bg-black/65 text-white flex items-center justify-center disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === visiblePhotos.length - 1}
                        onClick={() => reorderPhoto(photo.id, 'down', subsetIds)}
                        aria-label="Move later"
                        className="w-7 h-7 rounded-full bg-black/65 text-white flex items-center justify-center disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* STICKY NEXT BUTTON -> FINAL REVEAL 💍 (STEP 12) */}
      {isInStorySequence && !lightbox && (
        <div className="fixed bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none">
          <div className="w-full max-w-[460px] px-5 pt-6 pb-safe pb-5 bg-gradient-to-t from-[#160A11] via-[#160A11]/95 to-transparent pointer-events-auto">
            <button
              type="button"
              onClick={() => advanceLinearChapter(11)}
              className="btn-wine-glow w-full min-h-[54px] rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <span>One Last Thing: Watch Final Reveal 💍</span>
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
          albumIdForCover="all_over_memories"
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
};
