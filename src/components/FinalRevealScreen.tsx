import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { SCENIC_ASSETS } from '../data/defaults';
import { useApp } from '../context/AppContext';
import { ScenicImage } from './PhotoImage';

/**
 * Phases:
 * 0..5 -> 6 memory lines ("From Anaval Mahadev…" -> "and that one special sugarcane juice…")
 * 6    -> "We made it here. ❤️"
 * 7    -> "GIRLFRIEND ❤️" + animated LOADING... bar (0 -> 100%)
 * 8    -> "WIFE 💍" + "Happy Birthday, Kishu ❤️" + "The next chapter begins soon…" + "— Arpit"
 */
export const FinalRevealScreen: React.FC = () => {
  const {
    state,
    goBack,
    navigate,
    isInStorySequence,
    goToLinearStep,
    completeLinearJourney,
    replayOurStory,
    toggleMusicMaster,
    triggerSceneMusic,
    isPlaying,
  } = useApp();
  const lines = state.content.finalRevealLines;
  const [phase, setPhase] = useState(0);
  const [loadPercent, setLoadPercent] = useState(0);

  useEffect(() => {
    triggerSceneMusic('final_reveal');
  }, []);

  // Gentle cinematic auto-pacing through the lines
  useEffect(() => {
    if (phase < lines.length) {
      const t = window.setTimeout(() => setPhase((p) => p + 1), 2100);
      return () => window.clearTimeout(t);
    }
    if (phase === lines.length) {
      // Hold on "We made it here. ❤️"
      const t = window.setTimeout(() => setPhase((p) => p + 1), 2800);
      return () => window.clearTimeout(t);
    }
    if (phase === lines.length + 1) {
      // GIRLFRIEND ❤️ -> LOADING... -> WIFE 💍
      setLoadPercent(0);
      const start = Date.now();
      const duration = 2600;
      const interval = window.setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min(100, Math.round((elapsed / duration) * 100));
        setLoadPercent(pct);
        if (pct >= 100) {
          window.clearInterval(interval);
          window.setTimeout(() => setPhase(lines.length + 2), 450);
        }
      }, 45);
      return () => window.clearInterval(interval);
    }
  }, [phase, lines.length]);

  const handleTapAdvance = () => {
    if (phase < lines.length + 1) {
      setPhase((p) => p + 1);
    }
  };

  const replay = () => {
    setLoadPercent(0);
    setPhase(0);
  };

  const isWifePhase = phase >= lines.length + 2;
  const isLoadingPhase = phase === lines.length + 1;
  const isMilestonePhase = phase === lines.length;

  useEffect(() => {
    if (isWifePhase && !state.content.storyProgress.completed) {
      completeLinearJourney();
    }
  }, [isWifePhase, state.content.storyProgress.completed, completeLinearJourney]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#170F13] text-[#FFF9F2] flex flex-col justify-between select-none">
      {/* Sunrise mountain backdrop warming gradually as reveal reaches WIFE 💍 */}
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: isWifePhase ? 1.07 : 1.02,
          opacity: isWifePhase ? 0.92 : isLoadingPhase ? 0.6 : 0.45,
        }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <ScenicImage
          src={SCENIC_ASSETS.sunriseCover}
          alt="Golden sunrise over mountains"
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: isWifePhase
            ? 'linear-gradient(180deg, rgba(28,14,20,0.62) 0%, rgba(44,20,26,0.42) 45%, rgba(22,11,16,0.88) 100%)'
            : 'linear-gradient(180deg, rgba(18,10,14,0.86) 0%, rgba(28,14,20,0.72) 55%, rgba(16,9,13,0.92) 100%)',
        }}
      />

      {/* Minimal Top Bar */}
      <header className="relative z-20 pt-safe px-3 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={isInStorySequence ? () => goToLinearStep(11) : goBack}
          aria-label="Go back"
          className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={toggleMusicMaster}
          aria-label={state.musicSettings.enabled ? 'Turn music off' : 'Turn music on'}
          className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center hover:bg-white/10 text-[#F5CFA2]"
        >
          {state.musicSettings.enabled ? (
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'opacity-100' : 'opacity-70'}`} />
          ) : (
            <VolumeX className="w-5 h-5 opacity-55" />
          )}
        </button>
      </header>

      {/* Main Cinematic Center Stage */}
      <main
        onClick={handleTapAdvance}
        className="relative z-10 flex-1 px-6 flex flex-col items-center justify-center text-center"
      >
        <AnimatePresence mode="wait">
          {/* Sequence of Journey Lines */}
          {phase < lines.length && (
            <motion.div
              key="journey-lines"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 max-w-[330px]"
            >
              {lines.slice(0, phase + 1).map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: i === phase ? 1 : 0.55, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className={`font-display leading-snug ${
                    i === phase
                      ? 'text-[30px] font-medium text-[#FFF8EF]'
                      : 'text-[22px] italic text-[#F5D6B2]'
                  }`}
                >
                  “{line}”
                </motion.p>
              ))}
            </motion.div>
          )}

          {/* We made it here. ❤️ */}
          {isMilestonePhase && (
            <motion.div
              key="milestone"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <h1 className="font-display text-[44px] leading-tight font-semibold text-[#FFFDF9] drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
                {state.content.finalRevealMilestone}
              </h1>
            </motion.div>
          )}

          {/* GIRLFRIEND ❤️ -> LOADING... */}
          {isLoadingPhase && (
            <motion.div
              key="loading-transition"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-[290px] space-y-6"
            >
              <h2 className="font-display text-[38px] font-semibold tracking-wide text-[#FFF4E6]">
                GIRLFRIEND ❤️
              </h2>

              <div className="space-y-2.5">
                <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#D46A71] via-[#E9AE71] to-[#FFF1CE] transition-all duration-75"
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
                <p className="text-xs font-semibold tracking-[0.26em] text-[#F5CFA2] tabular-nums">
                  LOADING… {loadPercent}%
                </p>
              </div>
            </motion.div>
          )}

          {/* WIFE 💍 FINALE */}
          {isWifePhase && (
            <motion.div
              key="wife-finale"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 max-w-[340px]"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.8 }}
              >
                <p className="text-xs tracking-[0.22em] text-[#F6D3A6]">FOREVER BEGINS</p>
                <h1 className="mt-2 font-display text-[58px] leading-none font-semibold text-[#FFFDF9] drop-shadow-[0_6px_30px_rgba(24,10,14,0.5)]">
                  WIFE 💍
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.85 }}
                className="space-y-3 pt-2"
              >
                <h2 className="font-script text-[48px] leading-tight text-[#FFEAD0] drop-shadow-[0_4px_20px_rgba(255,190,140,0.45)]">
                  Happy Birthday, Kishu ❤️
                </h2>
                <p className="font-display italic text-2xl text-[#FFF8EF]/92">
                  “{state.content.finalRevealEnding}”
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.8 }}
                className="pt-4 font-script text-[36px] text-[#F5CFA2]"
              >
                — Arpit ♡
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Controls */}
      <footer className="relative z-20 pb-safe px-6 mb-4 flex flex-col items-center gap-3">
        {!isWifePhase ? (
          <p className="text-[11px] text-white/55">Tap anywhere to gently continue</p>
        ) : (
          <div className="w-full max-w-[330px] space-y-2.5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={replayOurStory}
                className="min-h-[48px] px-4 rounded-full bg-white/14 border border-white/25 text-xs font-semibold text-white flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Story</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('journey')}
                className="btn-wine-glow flex-1 min-h-[48px] rounded-full text-white text-sm font-semibold whitespace-nowrap px-4"
              >
                Explore Full Story ♡
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate('all_over_memories')}
              className="w-full min-h-[40px] rounded-full bg-white/10 border border-[#F5CFA2]/30 text-xs font-semibold text-[#FFE5BE]"
            >
              Open All Over Memories 📸
            </button>
            <button
              type="button"
              onClick={replay}
              className="w-full min-h-[34px] text-[11px] font-medium text-[#F5CFA2]/80 hover:text-[#FFF4E6]"
            >
              Watch final reveal again
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
