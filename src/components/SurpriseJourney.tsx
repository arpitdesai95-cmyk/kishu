import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clapperboard,
  Gift,
  Heart,
  ImagePlus,
  Layers,
  Mail,
  Music,
  Play,
  Settings,
  Sparkles,
  VolumeX,
  X,
} from 'lucide-react';
import { SCENIC_ASSETS } from '../data/defaults';
import { getPhotoQuote, type QuoteCategory } from '../data/romanticQuotes';
import { TOTAL_LINEAR_STEPS, useApp } from '../context/AppContext';
import type { PhotoItem } from '../types/app';
import { PhotoImage, ScenicImage } from './PhotoImage';
import { PhotoLightbox } from './PhotoLightbox';

type JourneyTab = 'path' | 'keepsakes' | 'scrapbook';

interface PathStop {
  id: number;
  title: string;
  subtitle: string;
  teaser: string;
  albumIds: string[];
  fallbackImg: string;
  tiltDeg: number;
  linearStep: number;
}

const FIREFLIES = [
  { left: '14%', top: '18%', delay: '0s', size: 4 },
  { left: '84%', top: '22%', delay: '1.3s', size: 3 },
  { left: '72%', top: '42%', delay: '0.6s', size: 5 },
  { left: '24%', top: '56%', delay: '2.1s', size: 3 },
  { left: '82%', top: '68%', delay: '1.7s', size: 4 },
  { left: '36%', top: '82%', delay: '2.6s', size: 4 },
];

export const SurpriseJourney: React.FC = () => {
  const {
    state,
    navPayload,
    navigate,
    isLinearLocked,
    isInStorySequence,
    currentLinearStep,
    startStoryFromStep,
    advanceLinearChapter,
    goToLinearStep,
    uploadPhotos,
    triggerSceneMusic,
    toggleMusicMaster,
    isPlaying,
  } = useApp();

  // Active linear step when in strict linear mode OR when walking through from the Twilight Heart-Path
  const activeStep =
    typeof navPayload.chapterIndex === 'number'
      ? navPayload.chapterIndex
      : Math.max(1, currentLinearStep || 1);

  // Post-completion realms (ONLY visible when viewing the unlocked Twilight Heart-Path)
  const [activeTab, setActiveTab] = useState<JourneyTab>('path');

  // Step-by-step poetic line reveal inside emotional chapters (Steps 5, 6, 7)
  const [revealStep, setRevealStep] = useState(0);

  // Interactive Keepsake Chest states (unlocked post-completion)
  const [whyIndex, setWhyIndex] = useState(0);
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);

  // Fullscreen photo lightbox
  const [lightbox, setLightbox] = useState<{
    photos: PhotoItem[];
    index: number;
    slideshow: boolean;
    albumId?: string;
  } | null>(null);

  // Hidden multi-photo uploader
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTargetRef = useRef<string>('first_memories');

  // Reset line-by-line reveal & trigger romantic scene soundtrack whenever chapter step changes
  useEffect(() => {
    setRevealStep(0);
    if (!isInStorySequence) return;
    if (activeStep === 1 || activeStep === 6) {
      triggerSceneMusic('story');
    } else if (activeStep === 5) {
      triggerSceneMusic('hard_chapter');
    } else if (activeStep === 7) {
      triggerSceneMusic('final_reveal');
    }
  }, [activeStep, isInStorySequence]);

  const getPhotosByAlbums = (albumIds: string[]) =>
    state.photos
      .filter((p) => albumIds.includes(p.albumId))
      .sort((a, b) => a.order - b.order);

  const triggerUploadFor = (albumId: string) => {
    uploadTargetRef.current = albumId;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await uploadPhotos(e.target.files, uploadTargetRef.current);
      e.target.value = '';
    }
  };

  const birthdayBigRevealLines = useMemo(
    () => [
      ...state.content.chapters.ch6Steps,
      'Your last birthday as my girlfriend… ❤️',
      'Because next time… I’ll be wishing you as my wife. 💍',
    ],
    [state.content.chapters.ch6Steps]
  );

  // =========================================================================
  // MODE A: ROMANTIC SINGLE-CHAPTER TWILIGHT STORY VIEW
  // Active during first-time linear surprise (isLinearLocked) AND whenever
  // Kishu taps Anaval Mahadev / any chapter on the unlocked Twilight Heart-Path!
  // =========================================================================
  if (isInStorySequence) {
    const step = [1, 5, 6, 7].includes(activeStep) ? activeStep : 1;

    const chapterMeta: {
      scriptIntro: string;
      title: string;
      subtitle: string;
      poeticSubnote: string;
      albumId: string;
      quoteCategory: QuoteCategory;
      fallbackImg: string;
      prevStep: number;
      nextLabel: string;
    } =
      step === 1
        ? {
            scriptIntro: 'Every beautiful story has a beginning…',
            title: 'Anaval Mahadev 🛕',
            subtitle: 'Where destiny quietly brought you into my life',
            poeticSubnote:
              'I didn’t know back then that one peaceful visit, one shy smile, and one blessing would become my forever.',
            albumId: 'first_memories',
            quoteCategory: 'anaval',
            fallbackImg: SCENIC_ASSETS.anavalTemple,
            prevStep: 0,
            nextLabel: 'Next Memory: Mountains & Trips 🏔️',
          }
        : step === 5
        ? {
            scriptIntro: 'Not every sky was golden…',
            title: 'The Hardest Chapter ❤️🩹',
            subtitle: 'When the world tested us, and you still chose us',
            poeticSubnote:
              'Through tears, silence, and heavy days — your hand never once slipped away from mine.',
            albumId: 'hard_chapter',
            quoteCategory: 'hard_chapter',
            fallbackImg: SCENIC_ASSETS.hardChapterDawn,
            prevStep: 4,
            nextLabel: 'Next Chapter: When Families Agreed ❤️',
          }
        : step === 6
        ? {
            scriptIntro: 'After every prayer & every patient night…',
            title: 'When Families Agreed ❤️',
            subtitle: 'The sunrise we waited and prayed for',
            poeticSubnote:
              'When love is true and patience is pure, even the hardest doors open into light.',
            albumId: 'families_agreed',
            quoteCategory: 'families_agreed',
            fallbackImg: SCENIC_ASSETS.sunriseCover,
            prevStep: 5,
            nextLabel: 'Next: The Birthday Promise 💍',
          }
        : {
            scriptIntro: 'Do you remember that birthday…?',
            title: 'From “NO” to Forever 💍',
            subtitle: 'The promise that changed everything',
            poeticSubnote:
              'Every step of our journey was leading us right here — to this birthday, and to our whole life ahead.',
            albumId: 'birthday',
            quoteCategory: 'birthday',
            fallbackImg: SCENIC_ASSETS.birthdayFlowers,
            prevStep: 6,
            nextLabel: 'Open Your Birthday Surprise 🎁',
          };

    const stepPhotos = getPhotosByAlbums([chapterMeta.albumId]);
    const hasMoreLines =
      (step === 5 && revealStep < state.content.chapters.ch4Lines.length - 1) ||
      (step === 6 && revealStep < state.content.chapters.ch5Lines.length - 1) ||
      (step === 7 && revealStep < birthdayBigRevealLines.length - 1);

    const handleChapterBack = () => {
      if (!isLinearLocked && step === 1) {
        // Unlocked mode: return cleanly to Twilight Heart-Path
        navigate('journey');
        return;
      }
      if (chapterMeta.prevStep === 0) {
        navigate('first');
      } else {
        goToLinearStep(chapterMeta.prevStep);
      }
    };

    return (
      <div className="relative min-h-dvh w-full overflow-x-clip bg-[#1A0D14] text-[#FFF8F2] flex flex-col">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Atmospheric Twilight Mountain Backdrop + Golden Fireflies */}
        <div className="fixed inset-0 z-0 pointer-events-none max-w-[460px] mx-auto overflow-hidden">
          <ScenicImage
            src={SCENIC_ASSETS.twilightPath}
            alt="Twilight mountain sunset sky"
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

        {/* Clean Romantic Header */}
        <header className="sticky top-0 z-20 pt-safe px-3.5 py-2.5 flex items-center justify-between bg-gradient-to-b from-[#1A0D14]/92 via-[#1A0D14]/70 to-transparent backdrop-blur-[3px]">
          <button
            type="button"
            onClick={handleChapterBack}
            aria-label="Previous chapter"
            className="min-h-[40px] min-w-[40px] rounded-full bg-white/12 border border-[#F5D6B2]/30 text-[#FFF6EE] flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Subtle Glowing Journey Dots (zero spoilers!) */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: TOTAL_LINEAR_STEPS }).map((_, idx) => {
                const dotStep = idx + 1;
                const isCurrent = dotStep === step;
                const isUnlocked = dotStep < step;
                return (
                  <span
                    key={dotStep}
                    className={`rounded-full transition-all duration-300 ${
                      isCurrent
                        ? 'w-4 h-1.5 bg-[#FFE4B5] shadow-[0_0_10px_rgba(255,214,148,0.85)]'
                        : isUnlocked
                        ? 'w-1.5 h-1.5 bg-[#D96B7D]'
                        : 'w-1.5 h-1.5 bg-white/20'
                    }`}
                  />
                );
              })}
            </div>
            {!isLinearLocked && (
              <button
                type="button"
                onClick={() => navigate('journey')}
                className="text-[10.5px] font-medium text-[#F5CFA2]/85 hover:text-[#FFF4E6] underline-offset-2 hover:underline"
              >
                All Chapters ♡
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMusicMaster}
              aria-label={state.musicSettings.enabled ? 'Turn music off' : 'Turn music on'}
              className="min-h-[40px] min-w-[40px] rounded-full bg-white/12 border border-[#F5D6B2]/30 text-[#FFE1BA] flex items-center justify-center"
            >
              {state.musicSettings.enabled ? (
                <Music className={`w-4 h-4 ${isPlaying ? 'opacity-100' : 'opacity-80'}`} />
              ) : (
                <VolumeX className="w-4 h-4 opacity-70" />
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('settings')}
              aria-label="Gift Setup & Settings"
              className="min-h-[40px] min-w-[40px] rounded-full bg-white/8 border border-white/15 text-[#FFE1BA]/75 flex items-center justify-center"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Romantic Story & Polaroid Keepsakes Stage */}
        <main className="relative z-10 flex-1 px-4 pt-3 pb-36 space-y-6">
          {/* TOP SECTION: Poetic Heading + Heartfelt Story Card */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-2 px-1"
          >
            <p className="font-script text-[30px] leading-tight text-[#FFE7C4] drop-shadow-[0_2px_14px_rgba(255,190,120,0.4)]">
              {chapterMeta.scriptIntro}
            </p>
            <h1 className="font-display text-[38px] leading-[1.08] font-semibold text-[#FFFDF9] drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] text-balance">
              {chapterMeta.title}
            </h1>
            <p className="text-xs text-[#F5D6B2]/88 max-w-[300px] mx-auto">
              {chapterMeta.subtitle}
            </p>
            {/* Delicate Golden Hairline Heart Divider */}
            <div className="pt-1.5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-[1px] w-14 bg-gradient-to-r from-transparent to-[#F5CFA2]/65" />
              <span className="text-xs text-[#F5B0B8]">♡</span>
              <span className="h-[1px] w-14 bg-gradient-to-l from-transparent to-[#F5CFA2]/65" />
            </div>
          </motion.section>

          {/* Luminous Poetic Story Quote Card */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="rounded-[26px] bg-[#28101C]/78 border border-[#F5CFA2]/32 backdrop-blur-md p-5 shadow-[0_14px_36px_rgba(0,0,0,0.38)] space-y-3.5"
          >
            {step === 1 && (
              <>
                <p className="font-display italic text-[24px] leading-snug text-[#FFF7EE] text-center">
                  “{state.content.chapters.ch1Body}”
                </p>
                <p className="text-[13px] leading-relaxed text-[#F5D9BE]/88 text-center">
                  {chapterMeta.poeticSubnote}
                </p>
                <p className="font-script text-[24px] text-center text-[#FFE2BD] pt-0.5">
                  — Always yours, Arpit ♡
                </p>
              </>
            )}

            {step === 5 && (
              <div className="space-y-3.5">
                {state.content.chapters.ch4Lines.slice(0, revealStep + 1).map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`font-display leading-snug text-center ${
                      i === revealStep
                        ? 'text-[24px] text-[#FFF8F0]'
                        : 'text-[18px] italic text-[#F5D6B2]/75'
                    }`}
                  >
                    “{line}”
                  </motion.p>
                ))}
                {!hasMoreLines && (
                  <p className="text-[13px] leading-relaxed text-[#F5D9BC]/88 pt-2.5 border-t border-white/12 text-center">
                    {state.content.chapters.ch4Body}
                  </p>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-3.5">
                {state.content.chapters.ch5Lines.slice(0, revealStep + 1).map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`font-display leading-snug text-center ${
                      i === revealStep
                        ? 'text-[24px] text-[#FFF8F0]'
                        : 'text-[18px] italic text-[#F5D6B2]/80'
                    }`}
                  >
                    “{line}”
                  </motion.p>
                ))}
              </div>
            )}

            {step === 7 && (
              <div className="space-y-3.5">
                {birthdayBigRevealLines.slice(0, revealStep + 1).map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`font-display leading-snug text-center ${
                      i >= state.content.chapters.ch6Steps.length
                        ? 'text-[26px] font-semibold text-[#FFE5BE] drop-shadow-[0_2px_14px_rgba(255,204,132,0.45)]'
                        : 'text-[20px] italic text-[#FFF4E8]/90'
                    }`}
                  >
                    “{line}”
                  </motion.p>
                ))}
              </div>
            )}
          </motion.section>

          {/* BELOW THE STORY: ROMANTIC POLAROID PHOTOS WITH HEARTFELT QUOTES */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-[#FFF4E6]">
                  Captured Moments ♡
                </h2>
                <p className="text-[11px] text-[#F5CFA2]/78">
                  {stepPhotos.length > 0
                    ? `${stepPhotos.length} ${stepPhotos.length === 1 ? 'memory' : 'memories'} · Tap any Polaroid to view`
                    : 'Add your real photos for this chapter'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {stepPhotos.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox({
                        photos: stepPhotos,
                        index: 0,
                        slideshow: true,
                        albumId: chapterMeta.albumId,
                      })
                    }
                    className="min-h-[36px] px-3 rounded-full bg-white/12 border border-[#F5CFA2]/30 text-[#FFE5C0] text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => triggerUploadFor(chapterMeta.albumId)}
                  className="min-h-[36px] px-3 rounded-full bg-white/10 border border-white/20 text-[#FFF4E8] text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <ImagePlus className="w-3.5 h-3.5 text-[#F5CFA2]" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {stepPhotos.length > 0 ? (
              <div className="space-y-6">
                {stepPhotos.map((photo, idx) => {
                  const tilt = idx % 2 === 0 ? '-1.2deg' : '1.2deg';
                  const quote = getPhotoQuote(chapterMeta.quoteCategory, idx, photo.caption);
                  return (
                    <motion.article
                      key={photo.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: Math.min(idx * 0.06, 0.3) }}
                      style={{ transform: `rotate(${tilt})` }}
                      className="polaroid-frame p-2.5 pb-5 rounded-[4px] max-w-[360px] mx-auto shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setLightbox({
                            photos: stepPhotos,
                            index: idx,
                            slideshow: false,
                            albumId: chapterMeta.albumId,
                          })
                        }
                        className="w-full overflow-hidden rounded-[2px] bg-[#2C1620] block"
                      >
                        <PhotoImage
                          photoId={photo.id}
                          variant="full"
                          alt={photo.caption || `${chapterMeta.title} memory ${idx + 1}`}
                          className="w-full h-auto max-h-[500px] object-cover object-top block"
                        />
                      </button>

                      {/* Heartfelt Quote Underneath Each Photo */}
                      <div className="mt-3.5 px-2 text-center space-y-1.5">
                        <p className="font-display italic text-[19px] leading-snug text-[#4E1524]">
                          “{quote}”
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[10.5px] text-[#9A4254]">
                          <span className="font-script text-[18px] leading-none text-[#8B132C]">
                            Kishu &amp; Arpit ♡
                          </span>
                          <span className="tabular-nums opacity-70">
                            Memory #{idx + 1}
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              /* Fallback Atmospheric Polaroid when no photos uploaded yet for this chapter */
              <div className="polaroid-frame p-2.5 pb-5 rounded-[4px] -rotate-1 max-w-[350px] mx-auto shadow-2xl">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-[#2C1620]">
                  <ScenicImage
                    src={chapterMeta.fallbackImg}
                    alt={chapterMeta.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3.5 px-2 text-center space-y-2">
                  <p className="font-display italic text-[19px] leading-snug text-[#4E1524]">
                    “{getPhotoQuote(chapterMeta.quoteCategory, 0)}”
                  </p>
                  <button
                    type="button"
                    onClick={() => triggerUploadFor(chapterMeta.albumId)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B132C] pt-1"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>Add your photos for this memory</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* STICKY GLOWING WINE-GOLD NEXT BUTTON (ALWAYS AVAILABLE IN THUMB ZONE) */}
        {!lightbox && (
          <div className="fixed bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none">
            <div className="w-full max-w-[460px] px-5 pt-6 pb-safe pb-5 bg-gradient-to-t from-[#160A11] via-[#160A11]/95 to-transparent pointer-events-auto">
              {hasMoreLines ? (
                <button
                  type="button"
                  onClick={() => setRevealStep((s) => s + 1)}
                  className="btn-wine-glow w-full min-h-[54px] rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <span>
                    {step === 5 && revealStep === 0
                      ? 'Read This Chapter ♡'
                      : 'Tap to Continue Reading ♡'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#FFE2BD]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => advanceLinearChapter(step)}
                  className="btn-wine-glow w-full min-h-[54px] rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <span>{chapterMeta.nextLabel}</span>
                  <ArrowRight className="w-4 h-4 text-[#FFE2BD]" />
                </button>
              )}
            </div>
          </div>
        )}

        {lightbox && (
          <PhotoLightbox
            photos={lightbox.photos}
            initialIndex={lightbox.index}
            startSlideshow={lightbox.slideshow}
            albumIdForCover={lightbox.albumId}
            onClose={() => setLightbox(null)}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // MODE B: FULL UNLOCKED KEEPSAKE WORLD (storyProgress.completed === true)
  // Clicking Anaval Mahadev (or ANY chapter) starts a continuous story walkthrough
  // all the way to the Final Reveal 💍 with Next buttons active on every step!
  // =========================================================================
  const pathStops: PathStop[] = [
    {
      id: 1,
      title: 'Anaval Mahadev',
      subtitle: 'Our First Meeting…',
      teaser: state.content.chapters.ch1Body,
      albumIds: ['first_memories'],
      fallbackImg: SCENIC_ASSETS.anavalTemple,
      tiltDeg: -3,
      linearStep: 1,
    },
    {
      id: 2,
      title: 'Mountains & Trips',
      subtitle: 'Temples, long drives & quiet mornings',
      teaser: state.content.chapters.ch2Body,
      albumIds: ['temples', 'mountains'],
      fallbackImg: SCENIC_ASSETS.sunriseCover,
      tiltDeg: 2.4,
      linearStep: 2,
    },
    {
      id: 3,
      title: 'Movie Memories',
      subtitle: 'Every screen, every moment beside you',
      teaser: state.content.movieQuote,
      albumIds: ['movies'],
      fallbackImg: SCENIC_ASSETS.twilightPath,
      tiltDeg: -2.4,
      linearStep: 3,
    },
    {
      id: 4,
      title: 'The Ganne ka Juice',
      subtitle: 'A simple glass, a forever memory',
      teaser: state.content.sugarcaneCaption,
      albumIds: ['sugarcane'],
      fallbackImg: SCENIC_ASSETS.sugarcaneJuice,
      tiltDeg: 2.6,
      linearStep: 4,
    },
    {
      id: 5,
      title: 'The Hardest Chapter',
      subtitle: 'You never gave up on us…',
      teaser: state.content.chapters.ch4Body,
      albumIds: ['hard_chapter'],
      fallbackImg: SCENIC_ASSETS.hardChapterDawn,
      tiltDeg: -2.4,
      linearStep: 5,
    },
    {
      id: 6,
      title: 'When Families Agreed',
      subtitle: 'The sunrise after the storm…',
      teaser: state.content.chapters.ch5Lines[state.content.chapters.ch5Lines.length - 1] || '',
      albumIds: ['families_agreed'],
      fallbackImg: SCENIC_ASSETS.sunriseCover,
      tiltDeg: 2.2,
      linearStep: 6,
    },
    {
      id: 7,
      title: 'The Birthday Promise',
      subtitle: 'From “NO” to Forever 💍',
      teaser: 'Your last birthday as my girlfriend… next time as my wife.',
      albumIds: ['birthday'],
      fallbackImg: SCENIC_ASSETS.birthdayFlowers,
      tiltDeg: -2.2,
      linearStep: 7,
    },
    {
      id: 8,
      title: 'Birthday Surprise',
      subtitle: 'Cake, flowers & Arpit’s letter',
      teaser: 'Open your birthday letter, candlelit cake & Ujjain wish anytime.',
      albumIds: ['birthday'],
      fallbackImg: SCENIC_ASSETS.birthdayFlowers,
      tiltDeg: 2.4,
      linearStep: 8,
    },
    {
      id: 9,
      title: 'All Over Memories 📸',
      subtitle: 'Every remaining photo till today',
      teaser: 'All our random smiles, trips & everyday moments from day one.',
      albumIds: ['all_over_memories', 'random_us'],
      fallbackImg: SCENIC_ASSETS.sunriseCover,
      tiltDeg: -2.4,
      linearStep: 11,
    },
    {
      id: 10,
      title: 'The Final Reveal 💍',
      subtitle: 'Girlfriend ❤️ → Wife 💍',
      teaser: 'Watch our sunrise finale again anytime.',
      albumIds: ['birthday'],
      fallbackImg: SCENIC_ASSETS.firstScreenBalcony,
      tiltDeg: 2.2,
      linearStep: 12,
    },
  ];

  const reasons = state.reasons;
  const currentReason =
    reasons[whyIndex % Math.max(1, reasons.length)]?.text ||
    'Every little moment with you feels like home.';
  const activeLetter = activeLetterId
    ? state.openWhen.find((l) => l.id === activeLetterId) || null
    : null;
  const isDarkRealm = activeTab === 'path';

  return (
    <div
      className={`relative min-h-dvh w-full overflow-x-clip flex flex-col ${
        isDarkRealm ? 'bg-[#1A0D14] text-[#FFF8F2]' : 'bg-blush-silk text-[#4A1220]'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {isDarkRealm && (
        <div className="fixed inset-0 z-0 pointer-events-none max-w-[460px] mx-auto overflow-hidden">
          <ScenicImage
            src={SCENIC_ASSETS.twilightPath}
            alt="Twilight mountain sunset sky"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(26,12,20,0.72) 0%, rgba(36,15,24,0.42) 28%, rgba(44,18,28,0.46) 62%, rgba(22,10,16,0.92) 100%)',
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

      {/* Unlocked Header */}
      <header
        className={`sticky top-0 z-30 pt-safe px-3.5 py-2.5 flex items-center justify-between transition-colors ${
          isDarkRealm
            ? 'bg-gradient-to-b from-[#1C0D15]/88 via-[#1C0D15]/58 to-transparent backdrop-blur-[2px]'
            : 'bg-[#FDF3EC]/92 border-b border-[#D8A86C]/30 backdrop-blur-md'
        }`}
      >
        <button
          type="button"
          onClick={() => navigate('first')}
          aria-label="Back to birthday cover"
          className={`min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center active:scale-95 transition-transform ${
            isDarkRealm
              ? 'bg-white/12 border border-[#F5D6B2]/30 text-[#FFF6EE]'
              : 'bg-[#7A1228] text-[#FFF6EE] shadow-sm'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center leading-none">
          <div className="inline-flex items-center justify-center">
            <span
              className={`font-script text-[38px] leading-[0.9] ${
                isDarkRealm
                  ? 'text-[#FFF4E8] drop-shadow-[0_2px_12px_rgba(255,190,140,0.45)]'
                  : 'text-[#781227]'
              }`}
            >
              Kishu
            </span>
            <span
              className={`ml-1 text-lg ${
                isDarkRealm ? 'text-[#F5B0B8]' : 'text-[#A81C3B]'
              }`}
            >
              ♡
            </span>
          </div>
          <p
            className={`mt-0.5 text-[10.5px] font-medium tracking-wide ${
              isDarkRealm ? 'text-[#F5D5B4]/88' : 'text-[#843848]'
            }`}
          >
            {activeTab === 'path'
              ? 'A Story of Us…'
              : activeTab === 'keepsakes'
              ? 'Your Birthday Keepsakes'
              : 'Our Velvet Scrapbook'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate('song')}
            aria-label="Our Song & Music"
            className={`min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center active:scale-95 transition-transform ${
              isDarkRealm
                ? 'bg-white/12 border border-[#F5D6B2]/30 text-[#FFE1BA]'
                : 'bg-[#7A1228] text-[#FFF4E8] shadow-sm'
            }`}
          >
            {state.musicSettings.enabled ? (
              <Music className={`w-4 h-4 ${isPlaying ? 'opacity-100' : 'opacity-80'}`} />
            ) : (
              <VolumeX className="w-4 h-4 opacity-70" />
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('settings')}
            aria-label="Gift Setup & Settings"
            className={`min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center active:scale-95 transition-transform ${
              isDarkRealm
                ? 'bg-white/12 border border-[#F5D6B2]/30 text-[#FFE1BA]'
                : 'bg-[#7A1228] text-[#FFF4E8] shadow-sm'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* REALM 1: UNLOCKED TWILIGHT GLOWING HEART-PATH */}
      {activeTab === 'path' && (
        <main className="relative z-10 flex-1 px-3.5 pt-3 pb-32">
          <div className="text-center mb-6 px-2">
            <p className="font-script text-[32px] leading-tight text-[#FFE9CE] drop-shadow-[0_2px_14px_rgba(255,190,120,0.4)]">
              Every beautiful story has a beginning…
            </p>
            <p className="mt-1 text-[11.5px] text-[#F5D7BC]/88">
              Tap Anaval Mahadev to walk through our entire journey to the end ♡
            </p>
          </div>

          <div className="relative">
            <svg
              className="absolute left-[100px] sm:left-[108px] top-6 bottom-8 w-14 h-[calc(100%-3rem)] pointer-events-none z-0"
              viewBox="0 0 64 900"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="goldenPathFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFE8B6" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#F4B97A" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#E68B92" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <path
                d="M 32 0 C 56 80, 10 160, 32 240 C 54 320, 10 400, 32 480 C 54 560, 10 640, 32 720 C 54 800, 14 850, 32 900"
                fill="none"
                stroke="url(#goldenPathFull)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>

            <div className="relative z-10 space-y-5">
              {pathStops.map((stop, idx) => {
                const photos = getPhotosByAlbums(stop.albumIds);
                const leadPhoto = photos[0];
                return (
                  <motion.div
                    key={stop.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.45 }}
                    className="relative flex items-center gap-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => startStoryFromStep(stop.linearStep)}
                      style={{ transform: `rotate(${stop.tiltDeg}deg)` }}
                      className="polaroid-frame p-1.5 pb-4 rounded-[3px] relative w-[98px] sm:w-[106px] shrink-0 active:scale-95 transition-transform text-left"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-[#2C1620]">
                        {leadPhoto ? (
                          <PhotoImage photoId={leadPhoto.id} variant="thumb" alt={stop.title} />
                        ) : (
                          <ScenicImage
                            src={stop.fallbackImg}
                            alt={stop.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="absolute bottom-1 left-2 text-[10px] text-[#9A1B38] leading-none">
                        ♡
                      </span>
                    </button>

                    <div className="relative z-20 w-7 h-7 rounded-full shrink-0 bg-[#8F1732] text-[#FFE8D0] border border-[#F6CFA0]/80 shadow-[0_0_12px_rgba(246,207,160,0.45)] flex items-center justify-center">
                      <Heart className="w-3 h-3 fill-current" />
                    </div>

                    <button
                      type="button"
                      onClick={() => startStoryFromStep(stop.linearStep)}
                      className="flex-1 min-w-0 overflow-hidden text-left rounded-2xl px-3 py-2.5 bg-[#23101A]/70 border border-[#F5CFA2]/28 backdrop-blur-sm active:scale-[0.98] transition-transform"
                    >
                      <h2 className="font-display text-[20px] leading-tight font-semibold text-[#FFF7EE] break-words">
                        {stop.title}
                      </h2>
                      <p className="mt-0.5 text-[10.5px] font-medium text-[#F5CFA2] truncate">
                        {stop.subtitle}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#FFF3E8]/80 line-clamp-2">
                        {stop.teaser}
                      </p>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#FFE0B5]">
                        <span>{stop.id === 1 ? 'Start Story Here' : 'Open Chapter'}</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* REALM 2: KEEPSAKE CHEST */}
      {activeTab === 'keepsakes' && (
        <main className="relative z-10 flex-1 px-4 pt-5 pb-32 space-y-6">
          <section className="relative rounded-[28px] overflow-hidden border-2 border-[#D8A86C]/60 shadow-[0_14px_36px_rgba(92,16,34,0.16)] bg-[#FFF8F2]">
            <div className="relative h-52 overflow-hidden">
              <ScenicImage
                src={SCENIC_ASSETS.birthdayFlowers}
                alt="Birthday surprise gift box and candlelit cake"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(46,12,22,0.12) 0%, rgba(56,12,24,0.78) 100%)',
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-5 text-[#FFF8F0]">
                <p className="font-script text-[32px] leading-none text-[#FFE6C4]">
                  For My Kishu ♡
                </p>
                <h2 className="mt-1 font-display text-[28px] leading-tight font-semibold">
                  Your Birthday Surprise
                </h2>
              </div>
            </div>
            <div className="p-4 bg-[#FFF9F4]">
              <button
                type="button"
                onClick={() => startStoryFromStep(8)}
                className="btn-wine-glow w-full min-h-[50px] rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4 text-[#FFE4BE]" />
                <span>Open Birthday Gift &amp; Letter 🎁</span>
              </button>
            </div>
          </section>

          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-display text-[26px] font-semibold text-[#5E1122]">
                Why I Love You ♡
              </h3>
              <button
                type="button"
                onClick={() => navigate('why_love')}
                className="text-xs font-semibold text-[#8B132C] flex items-center gap-0.5"
              >
                <span>Edit Deck</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setWhyIndex((i) => (i + 1) % Math.max(1, reasons.length))}
              className="w-full text-center scrapbook-velvet rounded-[26px] p-6 text-[#FFF8F0] active:scale-[0.98] transition-transform"
            >
              <Sparkles className="w-4 h-4 text-[#F5CFA2] mx-auto mb-3 opacity-85" />
              <p className="font-display italic text-[24px] leading-snug text-[#FFF6EB] min-h-[76px] flex items-center justify-center px-2">
                “{currentReason}”
              </p>
              <p className="mt-4 text-[11px] font-medium text-[#F5CFA2]/90">
                Tap card for the next reason ♡
              </p>
            </button>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-display text-[26px] font-semibold text-[#5E1122]">
                Open When… 💌
              </h3>
              <button
                type="button"
                onClick={() => navigate('open_when')}
                className="text-xs font-semibold text-[#8B132C] flex items-center gap-0.5"
              >
                <span>Add / Edit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {state.openWhen.map((letter) => (
                <button
                  key={letter.id}
                  type="button"
                  onClick={() => setActiveLetterId(letter.id)}
                  className="parchment-note rounded-2xl p-4 border border-[#C99B68]/45 text-left active:scale-[0.97] transition-transform flex flex-col justify-between min-h-[120px]"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A61B39] to-[#6E0E23] text-[#FFE8CC] flex items-center justify-center shadow-md">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-[18px] leading-tight font-semibold text-[#5E1122]">
                      {letter.title}
                    </p>
                    <p className="mt-1 text-[10.5px] font-medium text-[#8B3A4B]">
                      Tap to open ♡
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* REALM 3: SCRAPBOOK & ALL OVER MEMORIES VAULT */}
      {activeTab === 'scrapbook' && (
        <main className="relative z-10 flex-1 px-4 pt-5 pb-32 space-y-5">
          <div className="relative pt-3">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
              aria-hidden="true"
            >
              <div className="w-6 h-5 rounded-t-full border-[3px] border-[#C99642] bg-[#FFF4DC]/30" />
              <div className="w-11 h-3.5 -mt-1 rounded-sm bg-gradient-to-b from-[#F4D28A] via-[#C89340] to-[#986B24] shadow-md" />
            </div>

            <button
              type="button"
              onClick={() => navigate('collage')}
              className="w-full block text-left scrapbook-velvet rounded-[24px] p-3 active:scale-[0.99] transition-transform"
            >
              <div className="bg-[#F7E7DA] rounded-[16px] p-3 space-y-2.5">
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((idx) => {
                    const photo = state.photos[idx];
                    const fallback =
                      idx === 0
                        ? SCENIC_ASSETS.anavalTemple
                        : idx === 1
                        ? SCENIC_ASSETS.sunriseCover
                        : SCENIC_ASSETS.sugarcaneJuice;
                    return (
                      <div
                        key={idx}
                        style={{
                          transform: `rotate(${idx === 0 ? '-2.5deg' : idx === 2 ? '2.5deg' : '0.8deg'})`,
                        }}
                        className="polaroid-frame p-1 pb-3 rounded-[2px]"
                      >
                        <div className="aspect-square overflow-hidden">
                          {photo ? (
                            <PhotoImage photoId={photo.id} variant="thumb" />
                          ) : (
                            <ScenicImage
                              src={fallback}
                              alt="Scrapbook preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="parchment-note rounded-xl py-2.5 px-4 text-center border border-[#C99B68]/40">
                  <p className="font-script text-[26px] leading-tight text-[#7A1228]">
                    Our Beautiful Memories ♡
                  </p>
                  <p className="text-[11px] text-[#7D3A48]">
                    Tap to open the 11-Layout Scrapbook Collage Studio
                  </p>
                </div>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('all_over_memories')}
            className="btn-wine-glow w-full min-h-[54px] rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <ImagePlus className="w-4 h-4 text-[#FFE4BE]" />
            <span>Open All Over Memories 📸 ({state.photos.length} total)</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => navigate('memories')}
              className="min-h-[48px] rounded-2xl bg-[#FFF9F4] border border-[#D8A86C]/55 text-[#5E1122] text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-[#8B132C]" />
              <span>All Albums</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('movies')}
              className="min-h-[48px] rounded-2xl bg-[#FFF9F4] border border-[#D8A86C]/55 text-[#5E1122] text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Clapperboard className="w-4 h-4 text-[#8B132C]" />
              <span>Movie Reels (7)</span>
            </button>
          </div>
        </main>
      )}

      {/* Floating 3-Realm Velvet Dock (ONLY visible after full story completion!) */}
      <nav
        aria-label="Gift realms"
        className="fixed bottom-4 inset-x-0 z-30 flex justify-center px-4 pointer-events-none pb-safe"
      >
        <div className="pointer-events-auto w-full max-w-[350px] rounded-full p-1.5 grid grid-cols-3 gap-1 bg-[#260E18]/92 border border-[#F5CFA2]/35 shadow-[0_12px_34px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('path')}
            className={`min-h-[44px] rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'path'
                ? 'bg-gradient-to-b from-[#A31937] to-[#740E24] text-[#FFF8F0] shadow-sm border border-[#F6D2A2]/45'
                : 'text-[#F5DCC8]/78 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Our Story</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keepsakes')}
            className={`min-h-[44px] rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'keepsakes'
                ? 'bg-gradient-to-b from-[#A31937] to-[#740E24] text-[#FFF8F0] shadow-sm border border-[#F6D2A2]/45'
                : 'text-[#F5DCC8]/78 hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Gift Box</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scrapbook')}
            className={`min-h-[44px] rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'scrapbook'
                ? 'bg-gradient-to-b from-[#A31937] to-[#740E24] text-[#FFF8F0] shadow-sm border border-[#F6D2A2]/45'
                : 'text-[#F5DCC8]/78 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Scrapbook</span>
          </button>
        </div>
      </nav>

      {/* Open When Parchment Modal */}
      <AnimatePresence>
        {activeLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-[390px] parchment-note rounded-[28px] p-6 border-2 border-[#D8A86C]/60 space-y-4 max-h-[82dvh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-script text-2xl text-[#8B132C]">For Kishu ♡</p>
                  <h3 className="font-display text-2xl font-semibold text-[#4A1220]">
                    {activeLetter.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLetterId(null)}
                  className="min-h-[38px] min-w-[38px] rounded-full bg-[#8B132C]/12 text-[#5E1122] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-[#4E1A26] whitespace-pre-line">
                {activeLetter.message}
              </p>
              <p className="font-script text-2xl text-right text-[#8B132C]">— Arpit ♡</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {lightbox && (
        <PhotoLightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          startSlideshow={lightbox.slideshow}
          albumIdForCover={lightbox.albumId}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
};
