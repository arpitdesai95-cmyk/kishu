import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Edit3,
  Heart,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TopBar } from './TopBar';

export const WhyILoveYouScreen: React.FC = () => {
  const {
    state,
    isInStorySequence,
    advanceLinearChapter,
    goToLinearStep,
    addReason,
    updateReason,
    deleteReason,
    reorderReason,
  } = useApp();

  const sortedReasons = useMemo(
    () => [...state.reasons].sort((a, b) => a.order - b.order),
    [state.reasons]
  );

  const [index, setIndex] = useState(0);
  const [manageOpen, setManageOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const safeIndex = sortedReasons.length > 0 ? index % sortedReasons.length : 0;
  const current = sortedReasons[safeIndex];

  const handleNext = () => {
    if (sortedReasons.length <= 1) return;
    setIndex((prev) => (prev + 1) % sortedReasons.length);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addReason(newText.trim());
    setNewText('');
  };

  return (
    <div className="min-h-dvh bg-blush-silk text-[#4A1220] flex flex-col pb-safe">
      <TopBar
        title="Why I Love You ❤️"
        onBack={isInStorySequence ? () => goToLinearStep(8) : undefined}
        rightAction={
          <button
            type="button"
            onClick={() => setManageOpen((v) => !v)}
            className={`min-h-[40px] px-3 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap ${
              manageOpen ? 'bg-[#7E1228] text-white' : 'bg-[#F6E2DF] text-[#7E1228]'
            }`}
          >
            {manageOpen ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span>{manageOpen ? 'Done' : 'Manage'}</span>
          </button>
        }
      />

      {!manageOpen ? (
        <main className="flex-1 px-5 py-8 flex flex-col justify-between">
          <div className="text-center space-y-1">
            <p className="text-xs text-[#8D3C4E] tabular-nums">
              {sortedReasons.length > 0
                ? `Reason #${safeIndex + 1} of ${sortedReasons.length}`
                : 'Add your first reason'}
            </p>
            <h2 className="font-script text-[40px] leading-tight text-[#781227]">
              Little Truths About Us ♡
            </h2>
          </div>

          {/* Interactive One-by-One Card */}
          <div className="my-auto py-6">
            {current ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.98 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  className="parchment-note rounded-[28px] border-2 border-[#D9AE6C]/55 p-7 min-h-[268px] flex flex-col justify-between text-center"
                >
                  <div className="flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-[#7E1228] text-[#FFF4E8] flex items-center justify-center shadow-md border border-[#F5D6B2]/45">
                      <Heart className="w-5 h-5 fill-[#FFF4E8]/30" />
                    </span>
                  </div>

                  <div className="py-5 space-y-3">
                    <p className="text-xs font-semibold tracking-wide text-[#9A1B38] tabular-nums">
                      Reason #{safeIndex + 1}
                    </p>
                    <p className="font-display text-[26px] leading-snug text-[#4A1220] text-balance">
                      “{current.text}”
                    </p>
                  </div>

                  <p className="font-script text-2xl text-[#8B132C]">— Arpit ♡</p>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="rounded-3xl bg-white border border-dashed border-[#8B132C]/25 p-8 text-center">
                <p className="text-sm text-[#7E4350]">
                  Tap Manage above to add reasons why you love Kishu.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleNext}
              disabled={sortedReasons.length <= 1}
              className={`w-full min-h-[52px] rounded-full text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-45 ${
                isInStorySequence
                  ? 'bg-[#FFFBF7] border-2 border-[#D8A86C]/65 text-[#6C1023] shadow-sm'
                  : 'btn-wine-glow text-white text-base'
              }`}
            >
              Next Reason ❤️
            </button>

            {isInStorySequence && (
              <button
                type="button"
                onClick={() => advanceLinearChapter(9)}
                className="btn-wine-glow w-full min-h-[54px] rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <span>Next Surprise: Open When Letters 💌</span>
                <ArrowRight className="w-4 h-4 text-[#FFE2BD]" />
              </button>
            )}

            <div className="flex items-center justify-center gap-4">
              {safeIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setIndex(0)}
                  className="min-h-[44px] px-3 text-xs font-medium text-[#7A5C54] flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Over</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setManageOpen(true)}
                className="min-h-[44px] px-3 text-xs font-semibold text-[#B84A52] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add or Edit Reasons</span>
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* MANAGE REASONS VIEW */
        <main className="px-4 pt-4 pb-16 space-y-5">
          <form
            onSubmit={handleAdd}
            className="rounded-3xl bg-white border border-[#8A4F40]/14 p-4 space-y-3"
          >
            <label className="block">
              <span className="text-xs font-semibold text-[#7A5C54]">
                Add a New Reason
              </span>
              <textarea
                rows={2}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Because…"
                className="mt-1.5 w-full rounded-xl border border-[#8A4F40]/18 bg-[#FDF8F4] px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#B84A52]"
              />
            </label>
            <button
              type="submit"
              className="w-full min-h-[46px] rounded-2xl bg-[#B84A52] text-white text-sm font-semibold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reason</span>
            </button>
          </form>

          <div className="space-y-2.5">
            {sortedReasons.map((reason, idx) => (
              <div
                key={reason.id}
                className="rounded-2xl bg-white border border-[#8A4F40]/12 p-4 space-y-3"
              >
                {editingId === reason.id ? (
                  <div className="space-y-2.5">
                    <textarea
                      rows={3}
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      className="w-full rounded-xl border border-[#8A4F40]/20 bg-[#FDF8F4] px-3 py-2 text-sm focus:outline-none focus:border-[#B84A52]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (editDraft.trim()) updateReason(reason.id, editDraft.trim());
                          setEditingId(null);
                        }}
                        className="flex-1 min-h-[42px] rounded-xl bg-[#B84A52] text-white text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="min-h-[42px] px-4 rounded-xl bg-[#F3E8DF] text-xs font-semibold"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-[#B84A52] tabular-nums">
                        Reason #{idx + 1}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => reorderReason(reason.id, 'up')}
                          aria-label="Move up"
                          className="w-8 h-8 rounded-lg bg-[#F5EBE3] flex items-center justify-center disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sortedReasons.length - 1}
                          onClick={() => reorderReason(reason.id, 'down')}
                          aria-label="Move down"
                          className="w-8 h-8 rounded-lg bg-[#F5EBE3] flex items-center justify-center disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(reason.id);
                            setEditDraft(reason.text);
                          }}
                          aria-label="Edit reason"
                          className="w-8 h-8 rounded-lg bg-[#F5EBE3] flex items-center justify-center"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteReason(reason.id)}
                          aria-label="Delete reason"
                          className="w-8 h-8 rounded-lg bg-[#FCE8E8] text-[#B84A52] flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-[#3E2A25]">{reason.text}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
};
