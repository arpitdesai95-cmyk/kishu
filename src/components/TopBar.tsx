import React from 'react';
import { ArrowLeft, Music, Settings, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TopBarProps {
  title: string;
  dark?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  dark = false,
  onBack,
  rightAction,
}) => {
  const { goBack, screen, navigate, state, toggleMusicMaster, isPlaying } = useApp();

  return (
    <header
      className={`sticky top-0 z-30 pt-safe transition-colors ${
        dark
          ? 'bg-[#1D0F18]/84 text-[#FFF6EE] border-b border-[#F3C892]/16 backdrop-blur-md'
          : 'bg-[#FDF3EC]/92 text-[#5B1123] border-b border-[#8B132C]/14 backdrop-blur-md'
      }`}
    >
      <div className="h-[56px] px-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack || goBack}
          aria-label="Go back"
          className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full transition-transform active:scale-95 ${
            dark
              ? 'bg-white/10 border border-white/18 text-[#FFF6EE] hover:bg-white/16'
              : 'bg-[#7E1228] text-[#FFF6EE] shadow-sm hover:bg-[#911630]'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h1 className="font-display text-[22px] font-semibold tracking-tight truncate text-center flex-1">
          {title}
        </h1>

        <div className="flex items-center gap-1.5 shrink-0">
          {rightAction}
          <button
            type="button"
            onClick={toggleMusicMaster}
            aria-label={state.musicSettings.enabled ? 'Turn music off' : 'Turn music on'}
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full transition-transform active:scale-95 ${
              dark
                ? 'bg-white/10 border border-white/18 text-[#F5CFA2]'
                : 'bg-[#7E1228] text-[#FFF4E8] shadow-sm'
            }`}
          >
            {state.musicSettings.enabled ? (
              <Music className={`w-4 h-4 ${isPlaying ? 'opacity-100' : 'opacity-80'}`} />
            ) : (
              <VolumeX className="w-4 h-4 opacity-70" />
            )}
          </button>
          {screen !== 'settings' && (
            <button
              type="button"
              onClick={() => navigate('settings')}
              aria-label="Gift Setup & Settings"
              className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full transition-transform active:scale-95 ${
                dark
                  ? 'bg-white/8 border border-white/14 text-[#F5CFA2]/80'
                  : 'bg-[#F6E2DF] text-[#7E1228]'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
