import React, { useRef, useState } from 'react';
import { ArrowRight, Check, Clapperboard, Edit3, ImagePlus, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPhotoQuote } from '../data/romanticQuotes';
import type { MovieLayoutMode } from '../types/app';
import { PhotoImage } from './PhotoImage';
import { PhotoLightbox } from './PhotoLightbox';
import { TopBar } from './TopBar';

const MOVIE_LAYOUTS: Array<{ id: MovieLayoutMode; label: string }> = [
  { id: 'poster', label: 'Movie Poster' },
  { id: 'film-strip', label: 'Film Strip' },
  { id: 'polaroid', label: 'Polaroid' },
  { id: 'dense-grid', label: 'Dense Grid' },
  { id: 'scrapbook', label: 'Scrapbook' },
  { id: 'cinematic-collage', label: 'Cinematic' },
  { id: 'slideshow', label: 'Slideshow' },
];

export const MovieMemoriesScreen: React.FC = () => {
  const {
    state,
    navPayload,
    navigate,
    isInStorySequence,
    advanceLinearChapter,
    goToLinearStep,
    uploadPhotos,
    updateContent,
    showToast,
  } = useApp();
  const [layout, setLayout] = useState<MovieLayoutMode>(state.content.movieLayout || 'polaroid');
  const [editingQuote, setEditingQuote] = useState(false);
  const [quoteDraft, setQuoteDraft] = useState(state.content.movieQuote);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [startSlide, setStartSlide] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const moviePhotos = state.photos
    .filter((p) => p.albumId === 'movies')
    .sort((a, b) => a.order - b.order);

  const handleLayoutChange = (next: MovieLayoutMode) => {
    setLayout(next);
    updateContent((prev) => ({ ...prev, movieLayout: next }));
    if (next === 'slideshow' && moviePhotos.length > 0) {
      setStartSlide(true);
      setLightboxIdx(0);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await uploadPhotos(e.target.files, 'movies');
      e.target.value = '';
    }
  };

  const saveQuote = () => {
    updateContent((prev) => ({
      ...prev,
      movieQuote: quoteDraft.trim() || prev.movieQuote,
    }));
    setEditingQuote(false);
    showToast('Movie note saved 🎬');
  };

  const openPhoto = (idx: number, slide = false) => {
    setStartSlide(slide);
    setLightboxIdx(idx);
  };

  return (
    <div className="min-h-dvh bg-[#171115] text-[#FAF2EA] pb-safe">
      <TopBar
        title="Movie Memories 🎬"
        dark
        onBack={isInStorySequence ? () => goToLinearStep(2) : undefined}
        rightAction={
          <button
            type="button"
            onClick={() => {
              setQuoteDraft(state.content.movieQuote);
              setEditingQuote((v) => !v);
            }}
            aria-label="Edit movie quote"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/16"
          >
            <Edit3 className="w-4 h-4" />
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

      <main className={`px-4 pt-5 space-y-5 ${isInStorySequence || typeof navPayload.returnToBeat === 'number' ? 'pb-36' : 'pb-14'}`}>
        {/* Quote Header */}
        <section className="space-y-3 text-center px-2">
          {editingQuote ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quoteDraft}
                onChange={(e) => setQuoteDraft(e.target.value)}
                className="flex-1 min-h-[44px] rounded-xl bg-white/10 border border-white/20 px-3 text-sm text-white focus:outline-none focus:border-[#E5A76B]"
              />
              <button
                type="button"
                onClick={saveQuote}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-[#B84A52] text-white flex items-center justify-center"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="font-display italic text-[24px] leading-snug text-[#F6D6AF] text-balance">
              “{state.content.movieQuote}”
            </p>
          )}

          <div className="flex items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] px-4 rounded-full bg-[#B84A52] text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <ImagePlus className="w-4 h-4" />
              <span>Add Movie Photos</span>
            </button>
            {moviePhotos.length > 0 && (
              <button
                type="button"
                onClick={() => openPhoto(0, true)}
                className="min-h-[44px] px-4 rounded-full bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-[#F6CFA0]" />
                <span>Play Slideshow</span>
              </button>
            )}
          </div>
        </section>

        {/* 7 Selectable Layouts Switcher */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs text-[#FAF2EA]/65">Choose Layout</span>
            <span className="text-xs text-[#F3CA9B] tabular-nums">
              {moviePhotos.length} {moviePhotos.length === 1 ? 'photo' : 'photos'}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {MOVIE_LAYOUTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLayoutChange(item.id)}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  layout === item.id
                    ? 'bg-[#E9AE71] text-[#191014]'
                    : 'bg-white/10 text-[#FAF2EA]/85 hover:bg-white/15'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {moviePhotos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/20 bg-white/4 p-8 text-center space-y-3">
            <Clapperboard className="w-8 h-8 text-[#E9AE71] mx-auto" />
            <h3 className="font-display text-2xl font-semibold">
              Add Our Movie Stubs & Selfies
            </h3>
            <p className="text-xs leading-relaxed text-[#FAF2EA]/70 max-w-[270px] mx-auto">
              Upload 5, 20, or 50+ movie photos — switch between Movie Poster, Film Strip, Polaroid, Scrapbook, and Cinematic layouts anytime.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 min-h-[46px] px-6 rounded-full bg-[#B84A52] text-white text-sm font-semibold"
            >
              Upload Movie Photos
            </button>
          </div>
        ) : (
          <>
            {/* 1. MOVIE POSTER */}
            {layout === 'poster' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => openPhoto(0)}
                  className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden border border-[#F3CA9B]/25 shadow-2xl block text-left"
                >
                  <PhotoImage
                    photoId={moviePhotos[0].id}
                    variant="full"
                    alt={moviePhotos[0].caption || 'Featured movie memory'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120A0E] via-[#120A0E]/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                    <p className="text-[11px] tracking-[0.22em] text-[#F3CA9B]">
                      ARPIT & KISHU PRESENT
                    </p>
                    <h3 className="mt-1 font-display text-4xl font-semibold text-white">
                      Our Cinema Nights
                    </h3>
                    <p className="mt-1.5 text-xs text-white/80">
                      {moviePhotos[0].caption || `${moviePhotos.length} unforgettable reels together`}
                    </p>
                  </div>
                </button>

                {moviePhotos.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {moviePhotos.slice(1).map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => openPhoto(idx + 1)}
                        className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10"
                      >
                        <PhotoImage photoId={p.id} variant="thumb" alt={p.caption || 'Movie'} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. FILM STRIP */}
            {layout === 'film-strip' && (
              <div className="rounded-2xl bg-[#0C080A] border-y-4 border-dashed border-[#E9AE71]/45 py-4 px-3 space-y-4">
                {moviePhotos.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openPhoto(idx)}
                    className="w-full block text-left"
                  >
                    <div className="aspect-[16/10] rounded-lg overflow-hidden border border-white/15">
                      <PhotoImage photoId={p.id} variant="full" alt={p.caption || 'Film frame'} />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#E9AE71]/80 px-0.5">
                      <span className="tabular-nums">FRAME {String(idx + 1).padStart(2, '0')}</span>
                      <span className="truncate max-w-[70%] text-white/75">{p.caption}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 3. POLAROID WITH ROMANTIC QUOTES */}
            {layout === 'polaroid' && (
              <div className="space-y-6 pt-1">
                {moviePhotos.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openPhoto(idx)}
                    style={{ transform: `rotate(${idx % 2 === 0 ? '-1.2deg' : '1.2deg'})` }}
                    className="polaroid-frame w-full max-w-[360px] mx-auto text-[#4E1524] p-2.5 pb-5 rounded-[4px] shadow-2xl text-center block transition-transform active:scale-[0.98]"
                  >
                    <div className="w-full overflow-hidden rounded-[2px] bg-[#2C1620]">
                      <PhotoImage
                        photoId={p.id}
                        variant="full"
                        alt={p.caption || 'Movie memory'}
                        className="w-full h-auto max-h-[500px] object-cover object-top block"
                      />
                    </div>
                    <p className="mt-3 font-display italic text-[19px] leading-snug px-2">
                      “{getPhotoQuote('movies', idx, p.caption)}”
                    </p>
                    <p className="mt-1 font-script text-[18px] text-[#8B132C]">
                      Cinema Night #{idx + 1} ♡
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* 4. DENSE PHOTO GRID */}
            {layout === 'dense-grid' && (
              <div className="grid grid-cols-4 gap-1 rounded-2xl overflow-hidden">
                {moviePhotos.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openPhoto(idx)}
                    className="aspect-square overflow-hidden bg-white/5"
                  >
                    <PhotoImage photoId={p.id} variant="thumb" alt={p.caption || 'Movie memory'} />
                  </button>
                ))}
              </div>
            )}

            {/* 5. SCRAPBOOK */}
            {layout === 'scrapbook' && (
              <div className="space-y-5 px-1">
                {moviePhotos.map((p, idx) => {
                  const tilt = idx % 3 === 0 ? '-1.8deg' : idx % 3 === 1 ? '1.6deg' : '-0.8deg';
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => openPhoto(idx)}
                      style={{ transform: `rotate(${tilt})` }}
                      className="w-full rounded-2xl bg-[#F8EFE5] text-[#2B1B18] p-3 shadow-xl text-left block"
                    >
                      <div className="w-full rounded-xl overflow-hidden bg-[#2C1620]">
                        <PhotoImage
                          photoId={p.id}
                          variant="full"
                          alt={p.caption || 'Scrapbook'}
                          className="w-full h-auto max-h-[480px] object-cover object-top block"
                        />
                      </div>
                      <div className="mt-2.5 flex items-baseline justify-between gap-2 px-1">
                        <p className="font-display italic text-lg text-[#2B1B18]">
                          {p.caption || 'Another evening beside you'}
                        </p>
                        <span className="text-[11px] text-[#8E6A60] tabular-nums shrink-0">
                          #{idx + 1}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 6. CINEMATIC COLLAGE */}
            {(layout === 'cinematic-collage' || layout === 'slideshow') && (
              <div className="grid grid-cols-6 gap-1.5">
                {moviePhotos.map((p, idx) => {
                  const pattern = idx % 5;
                  const spanClass =
                    pattern === 0
                      ? 'col-span-6 aspect-[16/9]'
                      : pattern === 1 || pattern === 2
                      ? 'col-span-3 aspect-[4/3]'
                      : 'col-span-3 aspect-square';
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => openPhoto(idx)}
                      className={`${spanClass} rounded-xl overflow-hidden bg-white/10`}
                    >
                      <PhotoImage photoId={p.id} variant="full" alt={p.caption || 'Cinematic frame'} />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {(isInStorySequence || typeof navPayload.returnToBeat === 'number') && lightboxIdx === null && (
        <div className="fixed bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none">
          <div className="w-full max-w-[460px] px-5 pt-6 pb-safe pb-5 bg-gradient-to-t from-[#171115] via-[#171115]/95 to-transparent pointer-events-auto">
            <button
              type="button"
              onClick={() =>
                isInStorySequence
                  ? advanceLinearChapter(3)
                  : navigate('journey', { returnToBeat: navPayload.returnToBeat })
              }
              className="btn-wine-glow w-full min-h-[54px] rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <span>
                {isInStorySequence
                  ? 'Next Memory: Sugarcane Juice 🥤'
                  : navPayload.nextBeatLabel || 'Next Memory'}
              </span>
              <ArrowRight className="w-4 h-4 text-[#FFE2BD]" />
            </button>
          </div>
        </div>
      )}

      {lightboxIdx !== null && moviePhotos.length > 0 && (
        <PhotoLightbox
          photos={moviePhotos}
          initialIndex={lightboxIdx}
          startSlideshow={startSlide}
          albumIdForCover="movies"
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  );
};
