import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Edit3, Gift, ImagePlus, MapPin, Play, Sparkles, X } from 'lucide-react';
import { SCENIC_ASSETS } from '../data/defaults';
import { getPhotoQuote } from '../data/romanticQuotes';
import { useApp } from '../context/AppContext';
import { PhotoImage, ScenicImage } from './PhotoImage';
import { PhotoLightbox } from './PhotoLightbox';
import { TopBar } from './TopBar';

const CONFETTI_BITS = Array.from({ length: 24 }).map((_, i) => ({
  left: `${4 + ((i * 19) % 92)}%`,
  delay: `${(i % 7) * 0.14}s`,
  color: i % 3 === 0 ? '#E8A86B' : i % 3 === 1 ? '#D46A71' : '#F6DFC2',
  size: i % 2 === 0 ? 7 : 5,
}));

export const BirthdaySurpriseScreen: React.FC = () => {
  const {
    state,
    isInStorySequence,
    advanceLinearChapter,
    goToLinearStep,
    uploadPhotos,
    updateContent,
    triggerSceneMusic,
    showToast,
    navigate,
  } = useApp();

  const [opened, setOpened] = useState(state.content.storyProgress.hasOpenedGift);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editing, setEditing] = useState(false);
  const [letterDraft, setLetterDraft] = useState(state.content.birthdayLetter);
  const [ujjainEnabledDraft, setUjjainEnabledDraft] = useState(state.content.ujjainEnabled);
  const [ujjainNoteDraft, setUjjainNoteDraft] = useState(state.content.ujjainNote);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [slideshow, setSlideshow] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const birthdayPhotos = state.photos
    .filter((p) => p.albumId === 'birthday')
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    triggerSceneMusic('birthday');
  }, []);

  const handleOpenGift = () => {
    setOpened(true);
    setShowConfetti(true);
    updateContent((prev) => ({
      ...prev,
      storyProgress: {
        ...prev.storyProgress,
        hasOpenedGift: true,
      },
    }));
    window.setTimeout(() => setShowConfetti(false), 4500);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await uploadPhotos(e.target.files, 'birthday');
      e.target.value = '';
    }
  };

  const openEditor = () => {
    setLetterDraft(state.content.birthdayLetter);
    setUjjainEnabledDraft(state.content.ujjainEnabled);
    setUjjainNoteDraft(state.content.ujjainNote);
    setEditing(true);
  };

  const saveEditor = () => {
    updateContent((prev) => ({
      ...prev,
      birthdayLetter: letterDraft.trim() || prev.birthdayLetter,
      ujjainEnabled: ujjainEnabledDraft,
      ujjainNote: ujjainNoteDraft.trim(),
    }));
    setEditing(false);
    showToast('Birthday letter saved ❤️');
  };

  return (
    <div className="min-h-dvh bg-blush-silk text-[#4A1220] pb-safe relative overflow-x-hidden">
      <TopBar
        title="Birthday Surprise 🎁"
        onBack={isInStorySequence ? () => goToLinearStep(7) : undefined}
        rightAction={
          <button
            type="button"
            onClick={openEditor}
            aria-label="Edit birthday message"
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

      {/* Subtle warm golden-rose confetti on Gift Open */}
      {showConfetti && (
        <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden" aria-hidden="true">
          {CONFETTI_BITS.map((c, idx) => (
            <span
              key={idx}
              className="absolute top-0 rounded-full animate-confetti-fall"
              style={{
                left: c.left,
                width: `${c.size}px`,
                height: `${c.size * 1.4}px`,
                backgroundColor: c.color,
                animationDelay: c.delay,
              }}
            />
          ))}
        </div>
      )}

      <main className="px-4 pt-5 pb-16 space-y-6">
        {/* Floral Cake Hero Banner with gentle flickering SVG candle */}
        <section className="relative rounded-[28px] overflow-hidden border-2 border-[#D9AE6C]/65 shadow-[0_16px_36px_rgba(92,16,34,0.18)]">
          <div className="aspect-[4/3] relative">
            <ScenicImage
              src={SCENIC_ASSETS.birthdayFlowers}
              alt="Minimalist birthday cake with flowers and glowing candlelight"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#360916]/90 via-[#360916]/28 to-transparent" />

            {/* Subtle Animated Candle Flame Overlay Emblem */}
            <div className="absolute top-4 right-4 w-11 h-11 rounded-full bg-[#2B0A14]/50 backdrop-blur-md border border-[#F5D6B2]/35 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-6 h-6">
                <path
                  d="M16 4 C19 9 20 12 16 15 C12 12 13 9 16 4 Z"
                  fill="#FFD584"
                  className="animate-candle-flicker"
                />
                <rect x="14" y="15" width="4" height="12" rx="1.5" fill="#FFF4E6" />
              </svg>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5 text-[#FFF9F2] text-center">
              <h2 className="font-script text-[44px] leading-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]">
                {state.content.birthdayHeading}
              </h2>
              <p className="mt-1 text-xs text-[#F7D7AD]">
                Made with all my heart, for my favourite person ♡
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Gift Box OR Personal Letter */}
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.section
              key="closed-gift"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="rounded-[28px] bg-[#FFFBF7] border-2 border-[#D9AE6C]/50 p-7 text-center space-y-5 shadow-[0_14px_32px_rgba(92,16,34,0.1)]"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FBE3E5] to-[#F7DEC2] mx-auto flex items-center justify-center shadow-inner border border-[#D9AE6C]/40">
                <Gift className="w-10 h-10 text-[#8B132C]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-script text-[36px] leading-tight text-[#6E1226]">
                  A Birthday Letter for You ♡
                </h3>
                <p className="text-xs leading-relaxed text-[#7E4350] max-w-[270px] mx-auto">
                  Everything I want to say to you on this birthday — wrapped gently inside.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenGift}
                className="btn-wine-glow w-full min-h-[54px] rounded-full text-white text-base font-semibold active:scale-[0.98] transition-transform"
              >
                Open Your Gift 🎁
              </button>
            </motion.section>
          ) : (
            <motion.section
              key="opened-letter"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="space-y-5"
            >
              {/* Arpit's Personal Birthday Letter */}
              <article className="parchment-note rounded-[28px] border-2 border-[#D9AE6C]/55 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#8B132C]/14 pb-3">
                  <span className="font-script text-[28px] leading-none text-[#8B132C]">
                    From Arpit to Kishu ♡
                  </span>
                  <button
                    type="button"
                    onClick={openEditor}
                    className="text-xs font-semibold text-[#7E3443] hover:text-[#4A1220] flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="text-[15px] leading-[1.82] text-[#431923] whitespace-pre-line">
                  {state.content.birthdayLetter}
                </div>

                {/* Optional Ujjain Together Birthday Note */}
                {state.content.ujjainEnabled && state.content.ujjainNote && (
                  <div className="mt-4 rounded-2xl bg-[#FAF1E6] border border-[#C98B42]/24 p-4 space-y-1.5">
                    <p className="text-xs font-semibold text-[#9A5E25] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Together in Ujjain 🛕</span>
                    </p>
                    <p className="text-sm leading-relaxed text-[#52392B]">
                      {state.content.ujjainNote}
                    </p>
                  </div>
                )}
              </article>

              {/* Birthday Photos & Slideshow */}
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-display text-2xl font-semibold text-[#2B1B18]">
                    Birthday Photos 🎂
                  </h3>
                  <div className="flex items-center gap-2">
                    {birthdayPhotos.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSlideshow(true);
                          setLightboxIdx(0);
                        }}
                        className="min-h-[38px] px-3 rounded-xl bg-[#F4E7DD] text-xs font-semibold text-[#2B1B18] flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 text-[#B84A52]" />
                        <span>Slideshow</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[38px] px-3 rounded-xl bg-[#B84A52] text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {birthdayPhotos.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-2xl bg-white border border-dashed border-[#8A4F40]/25 p-5 text-center text-xs text-[#7A5C54]"
                  >
                    Tap to add birthday celebration & Ujjain photos
                  </button>
                ) : (
                  <div className="space-y-5">
                    {birthdayPhotos.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSlideshow(false);
                          setLightboxIdx(idx);
                        }}
                        style={{ transform: `rotate(${idx % 2 === 0 ? '-1deg' : '1deg'})` }}
                        className="polaroid-frame w-full max-w-[350px] mx-auto p-2.5 pb-4 rounded-[4px] block text-center active:scale-[0.98] transition-transform"
                      >
                        <div className="w-full overflow-hidden rounded-[2px] bg-[#2C1620]">
                          <PhotoImage
                            photoId={p.id}
                            variant="full"
                            alt={p.caption || 'Birthday'}
                            className="w-full h-auto max-h-[500px] object-cover object-top block"
                          />
                        </div>
                        <p className="mt-3 font-display italic text-[18px] leading-snug text-[#4E1524] px-1">
                          “{getPhotoQuote('birthday', idx, p.caption)}”
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Bridge to Next Linear Chapter (Step 9) OR Final Reveal after completion */}
              {isInStorySequence ? (
                <button
                  type="button"
                  onClick={() => advanceLinearChapter(8)}
                  className="btn-wine-glow w-full min-h-[54px] rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <span>Next Surprise: Why I Love You ❤️</span>
                  <ArrowRight className="w-4 h-4 text-[#FFE2BD]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('final_reveal')}
                  className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-[#2A151D] via-[#6B2D3A] to-[#B56549] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
                >
                  <Sparkles className="w-4 h-4 text-[#F6CFA0]" />
                  <span>Open the Final Reveal 💍</span>
                </button>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Edit Birthday Letter Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[460px] rounded-t-3xl bg-[#FDF8F4] p-5 pb-safe space-y-4 max-h-[86dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">Edit Birthday Letter</h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-[#7A5C54]">Personal Birthday Message</span>
              <textarea
                rows={9}
                value={letterDraft}
                onChange={(e) => setLetterDraft(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#8A4F40]/20 bg-white px-3.5 py-2.5 text-sm leading-relaxed"
              />
            </label>

            <div className="rounded-2xl bg-white border border-[#8A4F40]/14 p-3.5 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-[#2B1B18]">
                  Include Ujjain Birthday Trip Note 🛕
                </span>
                <input
                  type="checkbox"
                  checked={ujjainEnabledDraft}
                  onChange={(e) => setUjjainEnabledDraft(e.target.checked)}
                  className="w-5 h-5 accent-[#B84A52]"
                />
              </label>
              {ujjainEnabledDraft && (
                <textarea
                  rows={3}
                  value={ujjainNoteDraft}
                  onChange={(e) => setUjjainNoteDraft(e.target.value)}
                  className="w-full rounded-xl border border-[#8A4F40]/18 bg-[#FDF8F4] px-3 py-2 text-xs leading-relaxed"
                />
              )}
            </div>

            <button
              type="button"
              onClick={saveEditor}
              className="w-full min-h-[50px] rounded-2xl bg-[#B84A52] text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Birthday Message</span>
            </button>
          </div>
        </div>
      )}

      {lightboxIdx !== null && birthdayPhotos.length > 0 && (
        <PhotoLightbox
          photos={birthdayPhotos}
          initialIndex={lightboxIdx}
          startSlideshow={slideshow}
          albumIdForCover="birthday"
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  );
};
