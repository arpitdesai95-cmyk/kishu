/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { WifiOff } from 'lucide-react';
import {
  AppProvider,
  LINEAR_STEP_SCREENS,
  TOTAL_LINEAR_STEPS,
  useApp,
} from './context/AppContext';
import { useOnlineStatus } from './hooks/usePWA';
import { FirstScreen } from './components/FirstScreen';
import { SurpriseJourney } from './components/SurpriseJourney';
import { MemoriesScreen } from './components/MemoriesScreen';
import { MovieMemoriesScreen } from './components/MovieMemoriesScreen';
import { SugarcaneScreen } from './components/SugarcaneScreen';
import { WhyILoveYouScreen } from './components/WhyILoveYouScreen';
import { OpenWhenScreen } from './components/OpenWhenScreen';
import { CollageBuilderScreen } from './components/CollageBuilderScreen';
import { BirthdaySurpriseScreen } from './components/BirthdaySurpriseScreen';
import { AllOverMemoriesScreen } from './components/AllOverMemoriesScreen';
import { OurSongScreen } from './components/OurSongScreen';
import { FinalRevealScreen } from './components/FinalRevealScreen';
import { SettingsScreen } from './components/SettingsScreen';
import type { ScreenId } from './types/app';

const GIFT_SETUP_SCREENS: ReadonlySet<ScreenId> = new Set([
  'settings',
  'memories',
  'all_over_memories',
  'song',
  'collage',
]);

const AppRouter: React.FC = () => {
  const { ready, screen, navPayload, isLinearLocked, currentLinearStep, toast } = useApp();
  const isOnline = useOnlineStatus();

  if (!ready) {
    return (
      <div className="min-h-dvh w-full bg-[#181014] text-[#FFF6EB] flex flex-col items-center justify-center p-6">
        <p className="font-display text-4xl font-semibold">Kishu ❤️</p>
      </div>
    );
  }

  // Linear Navigation Controller driven by storyProgress:
  // While the surprise journey is not yet completed, only the active linear step screen
  // (plus Screen 1 cover & Arpit's discreet Gift Setup tools) can be rendered.
  const activeStep = Math.max(1, Math.min(TOTAL_LINEAR_STEPS, currentLinearStep || 1));
  const linearScreen = LINEAR_STEP_SCREENS[activeStep] || 'journey';
  const effectiveScreen: ScreenId =
    !isLinearLocked || screen === 'first' || GIFT_SETUP_SCREENS.has(screen)
      ? screen
      : linearScreen;

  // Unique transition key so consecutive 'journey' chapters (1 -> 5 -> 6 -> 7) animate smoothly
  const journeyStepKey =
    typeof navPayload.chapterIndex === 'number' ? navPayload.chapterIndex : activeStep;
  const transitionKey =
    effectiveScreen === 'journey' && (isLinearLocked || typeof navPayload.chapterIndex === 'number')
      ? `journey-step-${journeyStepKey}`
      : effectiveScreen;

  return (
    <div className="min-h-dvh w-full bg-[#181014] flex justify-center">
      {/* Strictly Mobile-First Canvas: edge-to-edge on smartphones, centered keepsake frame on larger screens */}
      <div className="relative w-full max-w-[460px] min-h-dvh bg-[#FDF8F4] shadow-[0_0_80px_rgba(0,0,0,0.55)] overflow-x-clip">
        <AnimatePresence mode="wait">
          <motion.div
            key={transitionKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-dvh"
          >
            {effectiveScreen === 'first' && <FirstScreen />}
            {effectiveScreen === 'journey' && <SurpriseJourney />}
            {effectiveScreen === 'memories' && <MemoriesScreen mode="all" />}
            {effectiveScreen === 'trips' && <MemoriesScreen mode="trips" />}
            {effectiveScreen === 'movies' && <MovieMemoriesScreen />}
            {effectiveScreen === 'sugarcane' && <SugarcaneScreen />}
            {effectiveScreen === 'why_love' && <WhyILoveYouScreen />}
            {effectiveScreen === 'open_when' && <OpenWhenScreen />}
            {effectiveScreen === 'collage' && <CollageBuilderScreen />}
            {effectiveScreen === 'birthday' && <BirthdaySurpriseScreen />}
            {effectiveScreen === 'all_over_memories' && <AllOverMemoriesScreen />}
            {effectiveScreen === 'song' && <OurSongScreen />}
            {effectiveScreen === 'final_reveal' && <FinalRevealScreen />}
            {effectiveScreen === 'settings' && <SettingsScreen />}
          </motion.div>
        </AnimatePresence>

        {/* Discreet Offline Mode notice when disconnected */}
        {!isOnline && effectiveScreen !== 'first' && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-[#2B1B18]/90 text-[#FFF4E6] text-[11px] font-medium flex items-center gap-1.5 shadow-md backdrop-blur-md">
            <WifiOff className="w-3.5 h-3.5 text-[#F3CA9B]" />
            <span>Offline — all memories available</span>
          </div>
        )}

        {/* Toast feedback */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.22 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#23151B]/94 text-[#FFF8EF] text-xs font-medium shadow-xl border border-white/12 whitespace-nowrap max-w-[90vw] truncate"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
