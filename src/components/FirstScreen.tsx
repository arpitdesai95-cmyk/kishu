import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Music, VolumeX } from 'lucide-react';
import { SCENIC_ASSETS } from '../data/defaults';
import { useApp } from '../context/AppContext';
import { ScenicImage } from './PhotoImage';

const FLOATING_MOTES = [
  { left: '22%', top: '58%', delay: '0s', size: 4 },
  { left: '42%', top: '64%', delay: '1.4s', size: 3 },
  { left: '66%', top: '50%', delay: '0.8s', size: 5 },
  { left: '80%', top: '60%', delay: '2.1s', size: 4 },
  { left: '74%', top: '38%', delay: '1.2s', size: 3 },
  { left: '34%', top: '32%', delay: '2.6s', size: 3 },
];

export const FirstScreen: React.FC = () => {
  const { state, openGiftFromCover, updateMusicSettings, pauseMusic, playTrack, triggerSceneMusic } = useApp();
  const [opening, setOpening] = useState(false);

  const handleTapToOpen = () => {
    if (opening) return;
    setOpening(true);
    if (state.musicSettings.enabled) {
      triggerSceneMusic('opening');
    }
    window.setTimeout(() => {
      openGiftFromCover();
    }, 1050);
  };

  const setMusicOn = () => {
    updateMusicSettings({ enabled: true });
    const firstId =
      state.musicSettings.sceneTracks.opening ||
      state.audioSlots.find((s) => s.hasFile)?.id;
    if (firstId && state.audioSlots.some((s) => s.id === firstId && s.hasFile)) {
      playTrack(firstId);
    }
  };

  const setMusicOff = () => {
    updateMusicSettings({ enabled: false });
    pauseMusic();
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#190B0A] flex flex-col justify-between select-none">
      {/* ONE Seamless Full-Bleed Photorealistic Sunrise Balcony Backdrop (Zero Seams, Zero Cartoon SVGs) */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.04 }}
        animate={{ scale: opening ? 1.11 : 1.0 }}
        transition={{ duration: opening ? 1.0 : 2.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <ScenicImage
          src={SCENIC_ASSETS.firstScreenBalcony}
          alt="Romantic sunrise balcony overlooking misty mountains with bougainvillea, glowing lantern, birthday cake, roses, and gift box"
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Soft Luminous Peach Halo Behind Calligraphy & Subtle Dark Wood Vignette ONLY at Bottom Footer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,232,216,0.12) 0%, rgba(255,226,204,0.22) 22%, rgba(255,214,180,0.08) 46%, rgba(0,0,0,0) 64%, rgba(26,10,9,0.52) 82%, rgba(20,8,7,0.94) 100%)',
        }}
      />

      {/* Warm Gentle Lantern & Candle Breathing Glow */}
      <div
        className="absolute left-[22%] top-[33%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none animate-sunrise-glow"
        style={{
          background:
            'radial-gradient(circle, rgba(255,222,140,0.45) 0%, rgba(255,176,84,0.14) 55%, transparent 76%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute right-[18%] top-[69%] w-32 h-32 rounded-full pointer-events-none animate-candle-flicker"
        style={{
          background:
            'radial-gradient(circle, rgba(255,228,148,0.34) 0%, rgba(255,168,82,0.12) 55%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle Floating Golden Light Motes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
        {FLOATING_MOTES.map((mote, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#FFF0CB] animate-float-mote"
            style={{
              left: mote.left,
              top: mote.top,
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              animationDelay: mote.delay,
              boxShadow: '0 0 12px 3px rgba(255, 224, 160, 0.78)',
            }}
          />
        ))}
      </div>

      {/* UPPER ROMANTIC CALLIGRAPHY LOCKUP — Positioned Cleanly in Open Sunrise Sky (Zero Spoilers) */}
      <motion.div
        className="relative z-20 pt-safe px-5 mt-[11vh] pl-8 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: opening ? 0 : 1, y: opening ? -14 : 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Soft warm glow cushion directly behind typography so calligraphy pops crisply */}
        <div
          className="inline-block rounded-full px-5 py-2.5"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255,244,234,0.58) 0%, rgba(255,236,222,0.26) 54%, transparent 80%)',
          }}
        >
          {/* Delicate burgundy heart above name */}
          <div className="text-[#6E0E23] text-2xl leading-none mb-0.5" aria-hidden="true">
            ♡
          </div>

          {/* Flowing Script "Kishu ♡" in Deep Wine-Burgundy */}
          <div className="inline-flex items-center justify-center relative">
            <h1 className="font-script text-[74px] leading-[0.88] text-[#640B1F] drop-shadow-[0_2px_14px_rgba(255,244,232,0.92)] pr-1">
              Kishu
            </h1>
            <span className="font-display text-[34px] text-[#7D1228] -ml-1 -mt-5 drop-shadow-[0_1px_8px_rgba(255,244,232,0.85)]">
              ♡
            </span>
          </div>

          {/* "Happy Birthday ♡" */}
          <p className="mt-1 font-display italic text-[28px] leading-tight font-semibold text-[#640B1F] drop-shadow-[0_1px_12px_rgba(255,244,232,0.92)]">
            Happy Birthday ♡
          </p>

          {/* Fine Burgundy Hairline Divider ──── ♥ ──── */}
          <div className="mt-2 flex items-center justify-center gap-3 text-[#6E0E23]" aria-hidden="true">
            <span className="h-[1px] w-14 bg-gradient-to-r from-transparent to-[#6E0E23]/75" />
            <span className="text-[11px]">♥</span>
            <span className="h-[1px] w-14 bg-gradient-to-l from-transparent to-[#6E0E23]/75" />
          </div>

          {/* Brushed Watercolor Burgundy Ribbon: "A New Beginning… ♡" */}
          <div className="mt-3 flex justify-center">
            <div
              className="px-6 py-1.5 rounded-full text-[#FFF8F0] font-display italic text-[17px] tracking-wide shadow-[0_6px_20px_rgba(104,14,34,0.28)]"
              style={{
                background:
                  'linear-gradient(90deg, rgba(138,24,48,0.12) 0%, rgba(136,22,46,0.9) 16%, rgba(118,16,38,0.92) 84%, rgba(138,24,48,0.12) 100%)',
              }}
            >
              A New Beginning… ♡
            </div>
          </div>
        </div>
      </motion.div>

      {/* BOTTOM CONTROLS — Floating Over the Dark Wood Edge Below Cake & Gift Box */}
      <motion.div
        className="relative z-20 mt-auto px-6 pt-4 pb-safe pb-5 flex flex-col items-center gap-3.5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: opening ? 0 : 1, y: opening ? 16 : 0 }}
        transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Glowing Golden-Rimmed Wine-Red "Tap to Open ♡ ›" Button */}
        <button
          type="button"
          onClick={handleTapToOpen}
          className="w-full max-w-[306px] min-h-[56px] rounded-full text-[#FFF8F2] font-display italic text-[24px] font-medium tracking-wide active:scale-[0.97] transition-transform flex items-center justify-center gap-2 whitespace-nowrap"
          style={{
            background:
              'linear-gradient(180deg, #9C132D 0%, #750B20 58%, #580616 100%)',
            border: '2px solid #FFCF94',
            boxShadow:
              '0 0 24px rgba(255, 184, 108, 0.65), 0 10px 28px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 240, 215, 0.45)',
          }}
        >
          <span>Tap to Open ♡</span>
          <ChevronRight className="w-5 h-5 text-[#FFE2BD]" />
        </button>

        {/* Clean Side-by-Side Music On / Music Off Buttons (Zero Duplicate Emojis) */}
        <div className="w-full max-w-[306px] grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={setMusicOn}
            className={`min-h-[44px] rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap backdrop-blur-sm ${
              state.musicSettings.enabled
                ? 'bg-[#FCE8D8] text-[#6C1023] border border-[#FFE9D4] shadow-[0_4px_16px_rgba(255,204,158,0.32)]'
                : 'bg-black/45 text-[#F5DCC8]/85 border border-[#F5CFA2]/35'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Music On</span>
          </button>

          <button
            type="button"
            onClick={setMusicOff}
            className={`min-h-[44px] rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap backdrop-blur-sm ${
              !state.musicSettings.enabled
                ? 'bg-[#FCE8D8] text-[#6C1023] border border-[#FFE9D4] shadow-[0_4px_16px_rgba(255,204,158,0.32)]'
                : 'bg-black/45 text-[#F5DCC8]/85 border border-[#F5CFA2]/35'
            }`}
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Music Off</span>
          </button>
        </div>
      </motion.div>

      {/* Cinematic Sunrise Bloom Transition on Tap to Open */}
      <AnimatePresence>
        {opening && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                'radial-gradient(circle at 50% 45%, #FFF4DC 0%, #F7C992 42%, #2B121C 100%)',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
