import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Edit3, ImagePlus, Pause, Play, X } from 'lucide-react';
import { SCENIC_ASSETS } from '../data/defaults';
import { getPhotoQuote } from '../data/romanticQuotes';
import { useApp } from '../context/AppContext';
import { PhotoImage, ScenicImage } from './PhotoImage';
import { PhotoLightbox } from './PhotoLightbox';
import { TopBar } from './TopBar';

export const SugarcaneScreen: React.FC = () => {
  const {
    state,
    isInStorySequence,
    advanceLinearChapter,
    goToLinearStep,
    uploadPhotos,
    updateContent,
    showToast,
  } = useApp();
  const [editing, setEditing] = useState(false);
  const [line1, setLine1] = useState(state.content.sugarcaneLines[0] || '');
  const [line2, setLine2] = useState(state.content.sugarcaneLines[1] || '');
  const [caption, setCaption] = useState(state.content.sugarcaneCaption || '');
  const [slideIdx, setSlideIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const photos = state.photos
    .filter((p) => p.albumId === 'sugarcane')
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!autoPlay || photos.length <= 1) return;
    const t = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % photos.length);
    }, 3800);
    return () => window.clearInterval(t);
  }, [autoPlay, photos.length]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await uploadPhotos(e.target.files, 'sugarcane');
      e.target.value = '';
    }
  };

  const openEditor = () => {
    setLine1(state.content.sugarcaneLines[0] || '');
    setLine2(state.content.sugarcaneLines[1] || '');
    setCaption(state.content.sugarcaneCaption || '');
    setEditing(true);
  };

  const saveEditor = () => {
    updateContent((prev) => ({
      ...prev,
      sugarcaneLines: [
        line1.trim() || prev.sugarcaneLines[0],
        line2.trim() || prev.sugarcaneLines[1],
      ],
      sugarcaneCaption: caption.trim(),
    }));
    setEditing(false);
    showToast('Memory text saved 🥤');
  };

  const activePhoto = photos[slideIdx % Math.max(1, photos.length)];

  return (
    <div className="min-h-dvh bg-[#FBF6EE] text-[#2B1F19] pb-safe">
      <TopBar
        title="Sugarcane Juice 🥤"
        onBack={isInStorySequence ? () => goToLinearStep(3) : undefined}
        rightAction={
          <button
            type="button"
            onClick={openEditor}
            aria-label="Edit memory text"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-[#F6E2DF] text-[#7E1228]"
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

      <main className={`px-5 pt-6 space-y-6 ${isInStorySequence ? 'pb-36' : 'pb-14'}`}>
        {/* Main Hero Photo / Slideshow */}
        <div className="relative rounded-3xl overflow-hidden bg-[#EFE6D8] border border-[#8A6D4F]/16 shadow-[0_12px_30px_rgba(43,31,25,0.08)]">
          <div className="relative">
            {activePhoto ? (
              <button
                type="button"
                onClick={() => setLightboxIdx(slideIdx % photos.length)}
                className="w-full block"
              >
                <PhotoImage
                  photoId={activePhoto.id}
                  variant="full"
                  alt={activePhoto.caption || 'Our sugarcane juice memory'}
                  className="w-full h-auto max-h-[460px] object-cover object-top block"
                />
              </button>
            ) : (
              <div className="aspect-[4/3]">
                <ScenicImage
                  src={SCENIC_ASSETS.sugarcaneJuice}
                  alt="Two fresh glasses of sugarcane juice in warm afternoon sunlight"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => setAutoPlay((p) => !p)}
                aria-label={autoPlay ? 'Pause slideshow' : 'Play slideshow'}
                className="absolute bottom-3 right-3 min-h-[40px] px-3 rounded-full bg-black/50 backdrop-blur-md text-white text-xs flex items-center gap-1.5"
              >
                {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="tabular-nums">
                  {(slideIdx % photos.length) + 1}/{photos.length}
                </span>
              </button>
            )}
          </div>

          {activePhoto?.caption && (
            <div className="px-4 py-3 bg-white/80 text-xs text-[#6B5447]">
              {activePhoto.caption}
            </div>
          )}
        </div>

        {/* Simple, Genuine Copy */}
        <section className="px-1 space-y-3.5 text-center">
          <h2 className="font-display text-[32px] leading-tight font-semibold text-[#2B1F19] text-balance">
            “{state.content.sugarcaneLines[0]}”
          </h2>
          <p className="font-display italic text-[22px] leading-snug text-[#6E5644] text-balance">
            “{state.content.sugarcaneLines[1]}”
          </p>
          {state.content.sugarcaneCaption && (
            <p className="pt-2 text-sm leading-relaxed text-[#7A6454] max-w-[320px] mx-auto">
              {state.content.sugarcaneCaption}
            </p>
          )}
        </section>

        {/* Uploaded Photos as Romantic Polaroids with Quotes */}
        {photos.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="font-display text-xl font-semibold text-[#4A1220]">
                Our Sweet Moments ({photos.length})
              </span>
              <span className="text-[11px] text-[#8E5B4A]">Tap any photo</span>
            </div>
            <div className="space-y-5">
              {photos.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLightboxIdx(idx)}
                  style={{ transform: `rotate(${idx % 2 === 0 ? '-1deg' : '1deg'})` }}
                  className="polaroid-frame w-full max-w-[350px] mx-auto p-2.5 pb-4 rounded-[4px] block text-center active:scale-[0.98] transition-transform"
                >
                  <div className="w-full overflow-hidden rounded-[2px] bg-[#2C1620]">
                    <PhotoImage
                      photoId={p.id}
                      variant="full"
                      alt={p.caption || 'Sugarcane memory'}
                      className="w-full h-auto max-h-[500px] object-cover object-top block"
                    />
                  </div>
                  <p className="mt-3 font-display italic text-[18px] leading-snug text-[#4E1524] px-1">
                    “{getPhotoQuote('sugarcane', idx, p.caption)}”
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full min-h-[50px] rounded-2xl bg-[#2B1F19] text-[#FFF9F2] text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <ImagePlus className="w-4 h-4 text-[#D4E29E]" />
          <span>{photos.length > 0 ? 'Add More Photos' : 'Add Our Sugarcane Juice Photos'}</span>
        </button>
      </main>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[460px] rounded-t-3xl bg-[#FDF8F4] p-5 pb-safe space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">Edit Memory Text</h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-[#7A5C54]">Opening Line</span>
              <input
                type="text"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-xl border border-[#8A4F40]/20 bg-white px-3.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-[#7A5C54]">Second Line</span>
              <textarea
                rows={3}
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#8A4F40]/20 bg-white px-3.5 py-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-[#7A5C54]">Your Caption / Note</span>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#8A4F40]/20 bg-white px-3.5 py-2.5 text-sm"
              />
            </label>

            <button
              type="button"
              onClick={saveEditor}
              className="w-full min-h-[50px] rounded-2xl bg-[#B84A52] text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Memory</span>
            </button>
          </div>
        </div>
      )}

      {isInStorySequence && !editing && lightboxIdx === null && (
        <div className="fixed bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none">
          <div className="w-full max-w-[460px] px-5 pt-6 pb-safe pb-5 bg-gradient-to-t from-[#FBF6EE] via-[#FBF6EE]/95 to-transparent pointer-events-auto">
            <button
              type="button"
              onClick={() => advanceLinearChapter(4)}
              className="btn-wine-glow w-full min-h-[54px] rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <span>Next Chapter: The Hardest Chapter ❤️🩹</span>
              <ArrowRight className="w-4 h-4 text-[#FFE2BD]" />
            </button>
          </div>
        </div>
      )}

      {lightboxIdx !== null && photos.length > 0 && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIdx}
          albumIdForCover="sugarcane"
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  );
};
