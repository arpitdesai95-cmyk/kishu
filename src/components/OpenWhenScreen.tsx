import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Edit3, Mail, MailOpen, Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { OpenWhenCard } from '../types/app';
import { TopBar } from './TopBar';

const ACCENT_STYLES: Record<
  OpenWhenCard['accent'],
  { envelope: string; flap: string; seal: string; text: string }
> = {
  rose: {
    envelope: 'bg-[#FBECEB] border-[#B84A52]/22',
    flap: 'bg-[#F3D7D5]',
    seal: 'bg-[#B84A52]',
    text: 'text-[#8B333A]',
  },
  gold: {
    envelope: 'bg-[#FCF3E4] border-[#C98B42]/24',
    flap: 'bg-[#F3E1C4]',
    seal: 'bg-[#C48238]',
    text: 'text-[#7F4E18]',
  },
  plum: {
    envelope: 'bg-[#F5ECF2] border-[#7D4A68]/22',
    flap: 'bg-[#E7D4E1]',
    seal: 'bg-[#7A4464]',
    text: 'text-[#5A2D48]',
  },
  sage: {
    envelope: 'bg-[#EEF3EC] border-[#5D7B59]/22',
    flap: 'bg-[#DCE7D9]',
    seal: 'bg-[#587554]',
    text: 'text-[#395036]',
  },
  dusk: {
    envelope: 'bg-[#EFEFF6] border-[#4E567A]/22',
    flap: 'bg-[#DFDFEE]',
    seal: 'bg-[#485175]',
    text: 'text-[#313855]',
  },
  blush: {
    envelope: 'bg-[#FDF0EA] border-[#C46B55]/22',
    flap: 'bg-[#F6DDD2]',
    seal: 'bg-[#BF654E]',
    text: 'text-[#7F3D2D]',
  },
};

export const OpenWhenScreen: React.FC = () => {
  const {
    state,
    isInStorySequence,
    advanceLinearChapter,
    goToLinearStep,
    addOpenWhen,
    updateOpenWhen,
    deleteOpenWhen,
    showToast,
  } = useApp();
  const [openedCard, setOpenedCard] = useState<OpenWhenCard | null>(null);
  const [isOpeningAnim, setIsOpeningAnim] = useState(false);
  const [editingLetter, setEditingLetter] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [subtitleDraft, setSubtitleDraft] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [addingNew, setAddingNew] = useState(false);

  const handleOpenEnvelope = (card: OpenWhenCard) => {
    setIsOpeningAnim(true);
    setOpenedCard(card);
    setEditingLetter(false);
    window.setTimeout(() => setIsOpeningAnim(false), 450);
  };

  const startEdit = (card: OpenWhenCard) => {
    setTitleDraft(card.title);
    setSubtitleDraft(card.subtitle);
    setMessageDraft(card.message);
    setEditingLetter(true);
  };

  const saveEdit = () => {
    if (!openedCard) return;
    const updated = {
      title: titleDraft.trim() || openedCard.title,
      subtitle: subtitleDraft.trim() || openedCard.subtitle,
      message: messageDraft.trim() || openedCard.message,
    };
    updateOpenWhen(openedCard.id, updated);
    setOpenedCard({ ...openedCard, ...updated });
    setEditingLetter(false);
    showToast('Envelope letter saved 💌');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleDraft.trim() || !messageDraft.trim()) return;
    const accents: OpenWhenCard['accent'][] = ['rose', 'gold', 'plum', 'sage', 'dusk', 'blush'];
    const accent = accents[state.openWhen.length % accents.length];
    addOpenWhen(titleDraft, subtitleDraft, messageDraft, accent);
    setTitleDraft('');
    setSubtitleDraft('');
    setMessageDraft('');
    setAddingNew(false);
  };

  return (
    <div className="min-h-dvh bg-blush-silk text-[#4A1220] pb-safe">
      <TopBar
        title="Open When... 💌"
        onBack={isInStorySequence ? () => goToLinearStep(9) : undefined}
        rightAction={
          <button
            type="button"
            onClick={() => {
              setTitleDraft('');
              setSubtitleDraft('');
              setMessageDraft('');
              setAddingNew(true);
            }}
            aria-label="Add new envelope"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-[#F6E2DF] text-[#7E1228]"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <main className={`px-4 pt-5 space-y-5 ${isInStorySequence ? 'pb-36' : 'pb-14'}`}>
        <div className="px-1 text-center">
          <p className="text-xs text-[#9A384D]">Sealed letters from Arpit</p>
          <h2 className="mt-1 font-script text-[40px] leading-tight text-[#781227]">
            For Every Moment Ahead ♡
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#7E4350]">
            Tap any envelope to unseal it. Every note can also be personalized anytime.
          </p>
        </div>

        {/* Envelope Cards */}
        <div className="space-y-3.5">
          {state.openWhen.map((card) => {
            const style = ACCENT_STYLES[card.accent] || ACCENT_STYLES.rose;
            return (
              <motion.button
                key={card.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenEnvelope(card)}
                className={`relative w-full rounded-3xl border overflow-hidden text-left shadow-[0_6px_20px_rgba(43,27,24,0.05)] ${style.envelope}`}
              >
                {/* Decorative envelope top flap geometry */}
                <div
                  className={`h-8 w-full ${style.flap}`}
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  }}
                />
                {/* Wax Seal */}
                <div className="flex justify-center -mt-4 mb-1">
                  <span
                    className={`w-8 h-8 rounded-full ${style.seal} text-white flex items-center justify-center shadow-sm`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="px-5 pb-5 pt-1 text-center">
                  <h3 className="font-display text-2xl font-semibold text-[#2B1B18]">
                    {card.title}
                  </h3>
                  <p className={`mt-1 text-xs ${style.text}`}>{card.subtitle}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>

      {/* Opened Envelope Letter Modal */}
      <AnimatePresence>
        {openedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#171014]/75 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[420px] max-h-[84dvh] rounded-3xl bg-[#FFFDF9] border border-[#8A4F40]/18 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Unsealing Header */}
              <div className="px-5 py-4 bg-[#FAF1E8] border-b border-[#8A4F40]/12 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MailOpen
                    className={`w-5 h-5 text-[#B84A52] shrink-0 transition-transform ${
                      isOpeningAnim ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  <h3 className="font-display text-xl font-semibold text-[#2B1B18] truncate">
                    {openedCard.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenedCard(null)}
                  className="min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {editingLetter ? (
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-xs font-medium text-[#7A5C54]">Envelope Title</span>
                      <input
                        type="text"
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        className="mt-1 w-full min-h-[44px] rounded-xl border border-[#8A4F40]/20 bg-white px-3 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-[#7A5C54]">Subtitle</span>
                      <input
                        type="text"
                        value={subtitleDraft}
                        onChange={(e) => setSubtitleDraft(e.target.value)}
                        className="mt-1 w-full min-h-[44px] rounded-xl border border-[#8A4F40]/20 bg-white px-3 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-[#7A5C54]">Letter Message</span>
                      <textarea
                        rows={7}
                        value={messageDraft}
                        onChange={(e) => setMessageDraft(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#8A4F40]/20 bg-white px-3 py-2.5 text-sm leading-relaxed"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-[#9A6356]">{openedCard.subtitle}</p>
                    <div className="text-[15px] leading-[1.8] text-[#3B2621] whitespace-pre-line font-sans">
                      {openedCard.message}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-3.5 border-t border-[#8A4F40]/12 bg-[#FDF8F4] flex items-center justify-between gap-2">
                {editingLetter ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingLetter(false)}
                      className="min-h-[44px] px-4 rounded-xl bg-[#EFE4DB] text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="flex-1 min-h-[44px] rounded-xl bg-[#B84A52] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Letter</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(openedCard)}
                      className="min-h-[44px] px-3.5 rounded-xl bg-[#F3E8DF] text-xs font-semibold text-[#2B1B18] flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Note</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {state.openWhen.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteOpenWhen(openedCard.id);
                            setOpenedCard(null);
                          }}
                          aria-label="Delete envelope"
                          className="min-h-[44px] min-w-[44px] rounded-xl bg-[#FCE8E8] text-[#B84A52] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setOpenedCard(null)}
                        className="min-h-[44px] px-5 rounded-xl bg-[#2B1B18] text-white text-xs font-semibold"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New Envelope Sheet */}
      {addingNew && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end justify-center">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-[460px] rounded-t-3xl bg-[#FDF8F4] p-5 pb-safe space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">New Envelope</h3>
              <button
                type="button"
                onClick={() => setAddingNew(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              required
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              placeholder="Open when…"
              className="w-full min-h-[46px] rounded-xl border border-[#8A4F40]/20 bg-white px-3.5 text-sm"
            />
            <input
              type="text"
              value={subtitleDraft}
              onChange={(e) => setSubtitleDraft(e.target.value)}
              placeholder="Short subtitle"
              className="w-full min-h-[46px] rounded-xl border border-[#8A4F40]/20 bg-white px-3.5 text-sm"
            />
            <textarea
              rows={5}
              required
              value={messageDraft}
              onChange={(e) => setMessageDraft(e.target.value)}
              placeholder="Write your personal letter…"
              className="w-full rounded-xl border border-[#8A4F40]/20 bg-white px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="w-full min-h-[50px] rounded-2xl bg-[#B84A52] text-white text-sm font-semibold"
            >
              Seal Envelope 💌
            </button>
          </form>
        </div>
      )}

      {isInStorySequence && !openedCard && !addingNew && (
        <div className="fixed bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none">
          <div className="w-full max-w-[460px] px-5 pt-6 pb-safe pb-5 bg-gradient-to-t from-[#FDF3EC] via-[#FDF3EC]/96 to-transparent pointer-events-auto">
            <button
              type="button"
              onClick={() => advanceLinearChapter(10)}
              className="btn-wine-glow w-full min-h-[54px] rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <span>Next: All Over Memories 📸</span>
              <ArrowRight className="w-4 h-4 text-[#FFE2BD]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
