import React, { useRef, useState } from 'react';
import {
  Check,
  Edit3,
  Music,
  Pause,
  Play,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { SceneMusicKey } from '../types/app';
import { TopBar } from './TopBar';

const SCENE_LABELS: Array<{ key: SceneMusicKey; label: string; hint: string }> = [
  { key: 'opening', label: 'Opening & Home', hint: 'Soft welcome after Tap to Open' },
  { key: 'story', label: 'Our Story Chapters', hint: 'Anaval Mahadev & Journeys' },
  { key: 'hard_chapter', label: 'The Hard Chapter', hint: 'Quiet emotional track' },
  { key: 'birthday', label: 'Birthday Reveal', hint: 'Warm turning point & surprise' },
  { key: 'final_reveal', label: 'Final Reveal 💍', hint: 'Most emotional closing music' },
];

function formatTime(sec: number): string {
  if (!sec || Number.isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const OurSongScreen: React.FC = () => {
  const {
    state,
    activeTrackId,
    isPlaying,
    audioCurrentTime,
    audioDuration,
    uploadAudioForSlot,
    removeAudioForSlot,
    updateAudioSlotMeta,
    updateMusicSettings,
    toggleMusicMaster,
    playTrack,
    pauseMusic,
    seekAudio,
  } = useApp();

  const [pendingSlotId, setPendingSlotId] = useState<string | null>(null);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [artistDraft, setArtistDraft] = useState('');

  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const handleChooseFile = (slotId: string) => {
    setPendingSlotId(slotId);
    audioInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingSlotId) {
      await uploadAudioForSlot(pendingSlotId, file);
    }
    setPendingSlotId(null);
    e.target.value = '';
  };

  const activeSlot = state.audioSlots.find((s) => s.id === activeTrackId);

  return (
    <div className="min-h-dvh bg-[#181115] text-[#FAF2EA] pb-safe">
      <TopBar title="Our Song 🎵" dark />

      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac"
        className="hidden"
        onChange={handleFileChange}
      />

      <main className="px-4 pt-5 pb-16 space-y-6">
        {/* Now Playing / Master Controls Card */}
        <section className="rounded-3xl bg-gradient-to-br from-[#2B1921] via-[#3F202B] to-[#23151B] border border-white/12 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#E9AE71]/18 text-[#F5CFA2] flex items-center justify-center shrink-0">
                <Music className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#F3CA9B]">
                  {isPlaying ? 'Now Playing' : 'Private Offline Soundtrack'}
                </p>
                <h2 className="font-display text-2xl font-semibold truncate">
                  {activeSlot ? activeSlot.title : 'Ishq — Faheem Abdullah'}
                </h2>
                <p className="text-xs text-white/65 truncate">
                  {activeSlot?.fileName || 'Attach your local MP3/M4A files below'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMusicMaster}
              className={`min-h-[42px] px-3.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${
                state.musicSettings.enabled
                  ? 'bg-[#E9AE71] text-[#1A1014]'
                  : 'bg-white/12 text-white/75'
              }`}
            >
              {state.musicSettings.enabled ? 'Music On' : 'Music Off'}
            </button>
          </div>

          {/* Scrubber when a track is loaded */}
          {activeSlot && activeSlot.hasFile && (
            <div className="space-y-1.5">
              <input
                type="range"
                min={0}
                max={audioDuration || 100}
                step={0.5}
                value={audioCurrentTime}
                onChange={(e) => seekAudio(Number(e.target.value))}
                className="w-full accent-[#E9AE71]"
              />
              <div className="flex justify-between text-[11px] text-white/60 tabular-nums">
                <span>{formatTime(audioCurrentTime)}</span>
                <span>{formatTime(audioDuration)}</span>
              </div>
            </div>
          )}

          {/* Volume & Background Toggle */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              {state.musicSettings.volume === 0 ? (
                <VolumeX className="w-4 h-4 text-white/60 shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#F3CA9B] shrink-0" />
              )}
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={state.musicSettings.volume}
                onChange={(e) => updateMusicSettings({ volume: Number(e.target.value) })}
                aria-label="Music volume"
                className="flex-1 accent-[#E9AE71]"
              />
              <span className="text-xs text-white/70 w-9 text-right tabular-nums">
                {Math.round(state.musicSettings.volume * 100)}%
              </span>
            </div>

            <label className="flex items-center justify-between min-h-[44px] cursor-pointer">
              <div>
                <p className="text-xs font-medium text-white">Cinematic Scene Transitions</p>
                <p className="text-[11px] text-white/60">
                  Softly transition music across Story, Hard Chapter, and Final Reveal
                </p>
              </div>
              <input
                type="checkbox"
                checked={state.musicSettings.backgroundPlay}
                onChange={(e) => updateMusicSettings({ backgroundPlay: e.target.checked })}
                className="w-5 h-5 accent-[#E9AE71] shrink-0 ml-3"
              />
            </label>
          </div>
        </section>

        {/* Song Slots */}
        <section className="space-y-3">
          <div className="px-1">
            <h3 className="font-display text-2xl font-semibold">Our Song Slots</h3>
            <p className="text-xs text-white/65 mt-0.5">
              Your own local audio files are saved offline inside the app — nothing copyrighted is bundled.
            </p>
          </div>

          <div className="space-y-2.5">
            {state.audioSlots.map((slot) => {
              const isThisPlaying = isPlaying && activeTrackId === slot.id;
              const isEditing = editingSlotId === slot.id;

              return (
                <div
                  key={slot.id}
                  className="rounded-2xl bg-white/6 border border-white/10 p-4 space-y-3"
                >
                  {isEditing ? (
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        placeholder="Song title"
                        className="w-full min-h-[42px] rounded-xl bg-white/10 border border-white/15 px-3 text-sm text-white"
                      />
                      <input
                        type="text"
                        value={artistDraft}
                        onChange={(e) => setArtistDraft(e.target.value)}
                        placeholder="Artist / subtitle"
                        className="w-full min-h-[42px] rounded-xl bg-white/10 border border-white/15 px-3 text-sm text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          updateAudioSlotMeta(slot.id, {
                            title: titleDraft.trim() || slot.title,
                            artist: artistDraft.trim() || slot.artist,
                          });
                          setEditingSlotId(null);
                        }}
                        className="w-full min-h-[42px] rounded-xl bg-[#B84A52] text-white text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Label</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-[15px] text-[#FFF8EF] truncate">
                            {slot.title}
                          </h4>
                          <p className="text-xs text-[#F3CA9B] truncate">{slot.artist}</p>
                          <p className="text-[11px] text-white/60 mt-0.5">
                            {slot.hasFile ? `Saved: ${slot.fileName}` : slot.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingSlotId(slot.id);
                            setTitleDraft(slot.title);
                            setArtistDraft(slot.artist);
                          }}
                          aria-label="Rename song slot"
                          className="min-h-[38px] min-w-[38px] rounded-xl bg-white/8 flex items-center justify-center text-white/75"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {slot.hasFile && (
                          <button
                            type="button"
                            onClick={() =>
                              isThisPlaying ? pauseMusic() : playTrack(slot.id)
                            }
                            className="min-h-[44px] px-4 rounded-xl bg-[#E9AE71] text-[#1A1014] text-xs font-semibold flex items-center gap-1.5"
                          >
                            {isThisPlaying ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                <span>Play</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleChooseFile(slot.id)}
                          className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#F3CA9B]" />
                          <span>{slot.hasFile ? 'Replace Audio' : 'Upload Audio File'}</span>
                        </button>

                        {slot.hasFile && (
                          <button
                            type="button"
                            onClick={() => removeAudioForSlot(slot.id)}
                            aria-label="Remove audio file"
                            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#B84A52]/25 text-[#F7A4A9] flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Scene Assignment Map */}
        <section className="space-y-3">
          <div className="px-1">
            <h3 className="font-display text-2xl font-semibold">Scene Music Map</h3>
            <p className="text-xs text-white/65 mt-0.5">
              Choose which uploaded song softly fades in for each chapter.
            </p>
          </div>

          <div className="rounded-3xl bg-white/6 border border-white/10 divide-y divide-white/10 overflow-hidden">
            {SCENE_LABELS.map((scene) => (
              <div
                key={scene.key}
                className="p-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#FFF8EF]">{scene.label}</p>
                  <p className="text-[11px] text-white/55 truncate">{scene.hint}</p>
                </div>
                <select
                  value={state.musicSettings.sceneTracks[scene.key]}
                  onChange={(e) =>
                    updateMusicSettings({
                      sceneTracks: {
                        ...state.musicSettings.sceneTracks,
                        [scene.key]: e.target.value,
                      },
                    })
                  }
                  className="min-h-[40px] max-w-[155px] rounded-xl bg-[#271B21] border border-white/15 px-2.5 text-xs text-white focus:outline-none"
                >
                  {state.audioSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.title} {slot.hasFile ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
