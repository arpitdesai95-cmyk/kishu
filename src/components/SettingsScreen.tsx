import React, { useRef, useState } from 'react';
import {
  Check,
  Download,
  Edit3,
  Heart,
  Image as ImageIcon,
  Music,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Upload,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWA';
import { exportFullBackup, importFullBackup } from '../lib/db';
import { TopBar } from './TopBar';

export const SettingsScreen: React.FC = () => {
  const {
    state,
    navigate,
    updateContent,
    replaceAllState,
    replayOurStory,
    resetEverything,
    showToast,
  } = useApp();

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [includeAudioInBackup, setIncludeAudioInBackup] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  // Personal Message Editor drafts
  const [ch1Body, setCh1Body] = useState(state.content.chapters.ch1Body);
  const [ch4Body, setCh4Body] = useState(state.content.chapters.ch4Body);
  const [ch5Body, setCh5Body] = useState(state.content.chapters.ch5Body);
  const [movieQuote, setMovieQuote] = useState(state.content.movieQuote);
  const [sugarcaneCaption, setSugarcaneCaption] = useState(state.content.sugarcaneCaption);
  const [birthdayLetter, setBirthdayLetter] = useState(state.content.birthdayLetter);
  const [ujjainEnabled, setUjjainEnabled] = useState(state.content.ujjainEnabled);
  const [ujjainNote, setUjjainNote] = useState(state.content.ujjainNote);
  const [finalEnding, setFinalEnding] = useState(state.content.finalRevealEnding);

  const importInputRef = useRef<HTMLInputElement | null>(null);

  const audioUploadedCount = state.audioSlots.filter((s) => s.hasFile).length;

  const openMessageEditor = () => {
    setCh1Body(state.content.chapters.ch1Body);
    setCh4Body(state.content.chapters.ch4Body);
    setCh5Body(state.content.chapters.ch5Body);
    setMovieQuote(state.content.movieQuote);
    setSugarcaneCaption(state.content.sugarcaneCaption);
    setBirthdayLetter(state.content.birthdayLetter);
    setUjjainEnabled(state.content.ujjainEnabled);
    setUjjainNote(state.content.ujjainNote);
    setFinalEnding(state.content.finalRevealEnding);
    setEditorOpen(true);
  };

  const saveAllMessages = () => {
    updateContent((prev) => ({
      ...prev,
      movieQuote: movieQuote.trim() || prev.movieQuote,
      sugarcaneCaption: sugarcaneCaption.trim(),
      birthdayLetter: birthdayLetter.trim() || prev.birthdayLetter,
      ujjainEnabled,
      ujjainNote: ujjainNote.trim(),
      finalRevealEnding: finalEnding.trim() || prev.finalRevealEnding,
      chapters: {
        ...prev.chapters,
        ch1Body: ch1Body.trim() || prev.chapters.ch1Body,
        ch4Body: ch4Body.trim() || prev.chapters.ch4Body,
        ch5Body: ch5Body.trim() || prev.chapters.ch5Body,
      },
    }));
    setEditorOpen(false);
    showToast('All personal messages saved ❤️');
  };

  const handleExport = async (forApkPreload = false) => {
    setExporting(true);
    try {
      const blob = await exportFullBackup(state, includeAudioInBackup, {
        resetStoryProgressForGift: forApkPreload,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = forApkPreload
        ? 'kishu-gift-bundle.json'
        : `kishu-gift-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast(
        forApkPreload
          ? 'Saved kishu-gift-bundle.json — place in public/ before building APK ❤️'
          : 'Complete gift backup downloaded ❤️'
      );
    } catch (err) {
      console.error(err);
      showToast('Could not export backup');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const restored = await importFullBackup(file);
      replaceAllState(restored);
    } catch (err) {
      console.error(err);
      showToast('Invalid or corrupted backup file');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleReset = async () => {
    await resetEverything();
    setConfirmReset(false);
  };

  return (
    <div className="min-h-dvh bg-blush-silk text-[#4A1220] pb-safe">
      <TopBar title="Settings & Gift Setup" />

      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImport}
      />

      <main className="px-4 pt-5 pb-16 space-y-6">
        {/* Offline Storage Overview */}
        <section className="rounded-[26px] bg-[#FFFBF7] border border-[#D8A86C]/45 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-[#5E1122]">
              Saved Offline on This Device
            </h2>
            <span className="text-xs text-[#9A384D]">Private</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="rounded-2xl bg-[#FAF0E8] py-3 px-2">
              <p className="font-display text-2xl font-semibold text-[#5E1122] tabular-nums">
                {state.photos.length}
              </p>
              <p className="text-[11px] text-[#7E4350]">Photos</p>
            </div>
            <div className="rounded-2xl bg-[#FAF0E8] py-3 px-2">
              <p className="font-display text-2xl font-semibold text-[#5E1122] tabular-nums">
                {state.collages.length}
              </p>
              <p className="text-[11px] text-[#7E4350]">Collages</p>
            </div>
            <div className="rounded-2xl bg-[#FAF0E8] py-3 px-2">
              <p className="font-display text-2xl font-semibold text-[#5E1122] tabular-nums">
                {audioUploadedCount}
              </p>
              <p className="text-[11px] text-[#7E4350]">Songs</p>
            </div>
          </div>
        </section>

        {/* Replay Our Story (Safe — keeps all photos, music, letters & collages) */}
        <section className="rounded-[26px] bg-[#FFFBF7] border border-[#D8A86C]/45 p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#5E1122]">
                Replay Our Story
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#7E4350]">
                Start the birthday surprise again from the sealed sunrise screen. Does not delete any photos, captions, letters, collages, or music.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={replayOurStory}
            className="btn-wine-glow w-full min-h-[48px] rounded-full text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <RotateCcw className="w-4 h-4 text-[#FFE4BE]" />
            <span>Replay Our Story from Beginning ❤️</span>
          </button>
        </section>

        {/* Personalization & Quick Managers */}
        <section className="space-y-2.5">
          <h3 className="text-xs font-semibold text-[#8A4554] px-1">
            Personalize Gift Content
          </h3>
          <div className="rounded-[26px] bg-[#FFFBF7] border border-[#D8A86C]/45 divide-y divide-[#8B132C]/10 overflow-hidden">
            <button
              type="button"
              onClick={openMessageEditor}
              className="w-full min-h-[60px] px-4 py-3 flex items-center gap-3 text-left hover:bg-[#FDF0EB]"
            >
              <Edit3 className="w-5 h-5 text-[#8B132C] shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Personal Message Editor</p>
                <p className="text-xs text-[#7E4350]">
                  Edit birthday letter, chapters, Ujjain note & captions
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('all_over_memories')}
              className="w-full min-h-[60px] px-4 py-3 flex items-center gap-3 text-left hover:bg-[#FDF0EB]"
            >
              <ImageIcon className="w-5 h-5 text-[#9A1835] shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">All Over Memories 📸 (Bulk Upload)</p>
                <p className="text-xs text-[#7E4350]">
                  Upload all remaining photos of us from day one until today
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('memories')}
              className="w-full min-h-[60px] px-4 py-3 flex items-center gap-3 text-left hover:bg-[#FDF0EB]"
            >
              <ImageIcon className="w-5 h-5 text-[#C48238] shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Manage All Albums &amp; Chapters</p>
                <p className="text-xs text-[#7E4350]">
                  Upload, reorder, set cover photos, or delete
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('song')}
              className="w-full min-h-[60px] px-4 py-3 flex items-center gap-3 text-left hover:bg-[#FDF0EB]"
            >
              <Music className="w-5 h-5 text-[#7E1228] shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Music & Soundtrack Settings</p>
                <p className="text-xs text-[#7E4350]">
                  Attach Ishq, Parvati/Hanuman Ansh & scene tracks
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* APK Preload Bundle & Backup / Restore */}
        <section className="space-y-2.5">
          <h3 className="text-xs font-semibold text-[#8A4554] px-1">
            APK Packaging, Backup & Restore
          </h3>
          <div className="rounded-[26px] bg-[#FFFBF7] border border-[#D8A86C]/45 p-4 space-y-3.5">
            <p className="text-xs leading-relaxed text-[#6E3542]">
              Photos & songs uploaded in the app are stored privately on <strong>this device</strong>. To make sure Kishu sees all your photos, collages, letters & songs automatically when she opens the APK on her phone:
            </p>
            <ol className="text-[11.5px] leading-relaxed text-[#7E4350] list-decimal pl-4 space-y-1">
              <li>Upload all your photos, songs & personal messages here first.</li>
              <li>Tap <strong>Download APK Bundle</strong> below to save <code className="font-mono text-[#7E1228]">kishu-gift-bundle.json</code>.</li>
              <li>Place <code className="font-mono text-[#7E1228]">kishu-gift-bundle.json</code> inside the project’s <code className="font-mono text-[#7E1228]">public/</code> folder before building the APK — the app auto-loads everything offline on first launch!</li>
            </ol>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs font-medium text-[#4A1220]">
                Include uploaded audio files in bundle
              </span>
              <input
                type="checkbox"
                checked={includeAudioInBackup}
                onChange={(e) => setIncludeAudioInBackup(e.target.checked)}
                className="w-5 h-5 accent-[#8B132C]"
              />
            </label>

            <button
              type="button"
              disabled={exporting}
              onClick={() => handleExport(true)}
              className="btn-wine-glow w-full min-h-[48px] rounded-full text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-[#FFE4BE]" />
              <span>{exporting ? 'Packaging Bundle…' : 'Download APK Bundle (kishu-gift-bundle.json)'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                disabled={exporting}
                onClick={() => handleExport(false)}
                className="min-h-[46px] rounded-2xl bg-[#4A1220] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#F3CA9B]" />
                <span>Save Backup</span>
              </button>

              <button
                type="button"
                disabled={importing}
                onClick={() => importInputRef.current?.click()}
                className="min-h-[46px] rounded-2xl bg-[#F6E2DF] text-[#5E1122] text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-[#8B132C]" />
                <span>{importing ? 'Restoring…' : 'Restore Backup'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Install as Offline Mobile App (PWA) */}
        {!isInstalled && (isInstallable || isIOS) && (
          <section className="rounded-3xl bg-white border border-[#8A4F40]/12 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Smartphone className="w-5 h-5 text-[#B84A52] shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Install Kishu ❤️ App</p>
                <p className="text-xs text-[#7A5C54]">
                  Add to home screen for offline fullscreen experience
                </p>
              </div>
            </div>
            {isInstallable ? (
              <button
                type="button"
                onClick={install}
                className="min-h-[42px] px-4 rounded-xl bg-[#B84A52] text-white text-xs font-semibold whitespace-nowrap shrink-0"
              >
                Install
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowIOSGuide(true)}
                className="min-h-[42px] px-3.5 rounded-xl bg-[#F4E7DD] text-[#2B1B18] text-xs font-semibold whitespace-nowrap shrink-0"
              >
                How to Install
              </button>
            )}
          </section>
        )}

        {/* Reset App */}
        <section className="rounded-3xl bg-white border border-[#8A4F40]/12 p-4 space-y-3">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="w-full min-h-[46px] rounded-2xl bg-[#FCE8E8] text-[#A8323B] text-xs font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset App Data</span>
            </button>
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-xs text-[#7A5C54]">
                This removes all locally uploaded photos, collages, songs, and edits. Export a backup first if you want to keep them.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[44px] rounded-xl bg-[#F3E8DF] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-[44px] rounded-xl bg-[#B84A52] text-white text-xs font-semibold"
                >
                  Yes, Reset All
                </button>
              </div>
            </div>
          )}
        </section>

        {/* About */}
        <footer className="text-center pt-4 pb-6 space-y-1.5">
          <Heart className="w-4 h-4 text-[#B84A52] mx-auto fill-[#B84A52]/20" />
          <p className="font-display text-2xl font-semibold text-[#2B1B18]">Kishu ❤️</p>
          <p className="text-xs text-[#7A5C54]">
            A private birthday love-story gift · Created with love by Arpit
          </p>
        </footer>
      </main>

      {/* Full Personal Message Editor Sheet */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[460px] rounded-t-3xl bg-[#FDF8F4] p-5 pb-safe max-h-[88dvh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#8A4F40]/12">
              <h3 className="font-display text-2xl font-semibold">Personal Message Editor</h3>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-[#7A5C54]">
                  Chapter 1 — Anaval Mahadev Line
                </span>
                <textarea
                  rows={2}
                  value={ch1Body}
                  onChange={(e) => setCh1Body(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#8A4F40]/18 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[#7A5C54]">
                  Movie Memories Quote
                </span>
                <input
                  type="text"
                  value={movieQuote}
                  onChange={(e) => setMovieQuote(e.target.value)}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-[#8A4F40]/18 bg-white px-3 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[#7A5C54]">
                  Sugarcane Juice Personal Note
                </span>
                <textarea
                  rows={2}
                  value={sugarcaneCaption}
                  onChange={(e) => setSugarcaneCaption(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#8A4F40]/18 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[#7A5C54]">
                  Chapter 4 — The Hard Chapter Note
                </span>
                <textarea
                  rows={3}
                  value={ch4Body}
                  onChange={(e) => setCh4Body(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#8A4F40]/18 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[#7A5C54]">
                  Chapter 5 — Families Agreed Note
                </span>
                <textarea
                  rows={3}
                  value={ch5Body}
                  onChange={(e) => setCh5Body(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#8A4F40]/18 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[#7A5C54]">
                  Birthday Surprise Letter
                </span>
                <textarea
                  rows={7}
                  value={birthdayLetter}
                  onChange={(e) => setBirthdayLetter(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#8A4F40]/18 bg-white px-3 py-2 text-sm leading-relaxed"
                />
              </label>

              <div className="rounded-2xl bg-white border border-[#8A4F40]/14 p-3.5 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-[#2B1B18]">
                    Show Ujjain Together Note 🛕
                  </span>
                  <input
                    type="checkbox"
                    checked={ujjainEnabled}
                    onChange={(e) => setUjjainEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#B84A52]"
                  />
                </label>
                {ujjainEnabled && (
                  <textarea
                    rows={3}
                    value={ujjainNote}
                    onChange={(e) => setUjjainNote(e.target.value)}
                    className="w-full rounded-xl border border-[#8A4F40]/18 bg-[#FDF8F4] px-3 py-2 text-xs"
                  />
                )}
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-[#7A5C54]">
                  Final Reveal Closing Line
                </span>
                <input
                  type="text"
                  value={finalEnding}
                  onChange={(e) => setFinalEnding(e.target.value)}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-[#8A4F40]/18 bg-white px-3 text-sm"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={saveAllMessages}
              className="mt-3 w-full min-h-[50px] rounded-2xl bg-[#B84A52] text-white text-sm font-semibold flex items-center justify-center gap-2 shrink-0"
            >
              <Check className="w-4 h-4" />
              <span>Save All Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* iOS Add to Home Screen Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#FDF8F4] p-6 space-y-4">
            <h3 className="font-display text-2xl font-semibold">Install on iPhone</h3>
            <p className="text-sm leading-relaxed text-[#5C413B]">
              1. Tap the <strong>Share</strong> icon in Safari.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. Open <strong>Kishu ❤️</strong> directly from your home screen anytime — even offline.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full min-h-[46px] rounded-2xl bg-[#B84A52] text-white text-sm font-semibold"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
