import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  ImagePlus,
  Layers,
  LayoutGrid,
  Music,
  Plus,
  Settings,
  Trash2,
  Type,
  Upload,
  VolumeX,
  X,
} from 'lucide-react';
import { SCENIC_ASSETS } from '../data/defaults';
import { useApp } from '../context/AppContext';
import type { CollageLayoutMode, SavedCollage } from '../types/app';
import { PhotoImage, ScenicImage } from './PhotoImage';

const COLLAGE_LAYOUTS: Array<{ id: CollageLayoutMode; label: string }> = [
  { id: 'scrapbook', label: 'Romantic Scrapbook' },
  { id: 'heart', label: 'Heart Layout' },
  { id: 'polaroid', label: 'Polaroid' },
  { id: 'film-strip', label: 'Film Strip' },
  { id: '2-photo', label: '2-Photo' },
  { id: '4-photo', label: '4-Photo' },
  { id: '6-photo', label: '6-Photo' },
  { id: '9-photo', label: '9-Photo' },
  { id: '12-photo', label: '12-Photo' },
  { id: 'dense', label: 'Dense Collage' },
  { id: 'cinematic', label: 'Cinematic Grid' },
];

const HEART_CELLS: Array<[number, number]> = [
  [0, 1], [0, 3],
  [1, 0], [1, 1], [1, 2], [1, 3], [1, 4],
  [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
  [3, 1], [3, 2], [3, 3],
  [4, 2],
];

const PREVIEW_SCENIC = [
  SCENIC_ASSETS.sunriseCover,
  SCENIC_ASSETS.anavalTemple,
  SCENIC_ASSETS.sugarcaneJuice,
  SCENIC_ASSETS.hardChapterDawn,
  SCENIC_ASSETS.birthdayFlowers,
];

const CollageTile: React.FC<{ photoId?: string; fallbackIdx: number; className?: string }> = ({
  photoId,
  fallbackIdx,
  className = 'w-full h-full object-cover',
}) => {
  if (photoId) {
    return <PhotoImage photoId={photoId} variant="thumb" className={className} />;
  }
  return (
    <ScenicImage
      src={PREVIEW_SCENIC[fallbackIdx % PREVIEW_SCENIC.length]}
      alt="Memory placeholder"
      className={className}
    />
  );
};

const ScrapbookBoardCanvas: React.FC<{
  layout: CollageLayoutMode;
  photoIds: string[];
  caption: string;
  compact?: boolean;
}> = ({ layout, photoIds, caption, compact = false }) => {
  const hasReal = photoIds.length > 0;
  const pick = (i: number) => (hasReal ? photoIds[i % photoIds.length] : undefined);

  return (
    <div className={`relative ${compact ? '' : 'pt-3'}`}>
      {/* Golden Brass Binder Clip at top-center (Reference 1 signature detail) */}
      {!compact && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-6 h-5 rounded-t-full border-[3px] border-[#C99642] bg-[#FFF4DC]/30 shadow-sm" />
          <div className="w-11 h-3.5 -mt-1 rounded-sm bg-gradient-to-b from-[#F4D28A] via-[#C89340] to-[#986B24] shadow-md border border-[#FFF2CC]/50" />
        </div>
      )}

      {/* Pink Satin Bow on top-left corner */}
      {!compact && (
        <svg
          viewBox="0 0 64 52"
          className="absolute -top-1 -left-2 w-14 h-12 z-30 pointer-events-none drop-shadow-md"
          aria-hidden="true"
        >
          <path d="M28 24 C10 8, 2 22, 18 30 Z" fill="#E692A3" />
          <path d="M32 24 C50 8, 58 22, 42 30 Z" fill="#D47488" />
          <path d="M26 28 L12 48 L22 44 L29 30 Z" fill="#C9657B" />
          <path d="M34 28 L48 48 L38 44 L31 30 Z" fill="#E08599" />
          <circle cx="30" cy="26" r="6" fill="#F2AEBC" stroke="#B6556B" strokeWidth="1.2" />
        </svg>
      )}

      {/* Velvet Burgundy Frame with Gold Border */}
      <div className={`scrapbook-velvet rounded-[22px] ${compact ? 'p-2' : 'p-3'} relative overflow-hidden`}>
        {/* Soft torn cream parchment inner sheet */}
        <div className={`bg-[#F7E7DA] rounded-[14px] ${compact ? 'p-1.5' : 'p-2.5'} relative overflow-hidden`}>
          {/* Hand-drawn heart doodles in top-right */}
          {!compact && (
            <div
              className="absolute top-1.5 right-2.5 z-20 text-[#921A33] font-script text-xl leading-none pointer-events-none opacity-85"
              aria-hidden="true"
            >
              ♡ ♡
            </div>
          )}

          {/* ROMANTIC SCRAPBOOK (Default signature layout matching Reference 1) */}
          {layout === 'scrapbook' && (
            <div className="relative space-y-2 py-1">
              {/* Top Row: 3 slightly angled Polaroids */}
              <div className="grid grid-cols-3 gap-1.5 items-center">
                <div className="polaroid-frame p-1 pb-2.5 -rotate-3 rounded-[2px]">
                  <div className="aspect-[4/3] overflow-hidden">
                    <CollageTile photoId={pick(0)} fallbackIdx={0} />
                  </div>
                </div>
                <div className="polaroid-frame p-1 pb-2.5 rotate-1 rounded-[2px]">
                  <div className="aspect-[4/3] overflow-hidden">
                    <CollageTile photoId={pick(1)} fallbackIdx={1} />
                  </div>
                </div>
                <div className="polaroid-frame p-1 pb-2.5 rotate-3 rounded-[2px]">
                  <div className="aspect-[4/3] overflow-hidden">
                    <CollageTile photoId={pick(2)} fallbackIdx={2} />
                  </div>
                </div>
              </div>

              {/* Middle Row: Film Strip + Torn Paper Centerpiece Note + Heart Photo */}
              <div className="grid grid-cols-12 gap-1.5 items-center">
                {/* Mini Film Strip Frame */}
                <div className="col-span-4 bg-[#1D1014] p-1 border-y-2 border-dashed border-[#E6B373]/70 -rotate-3 rounded-[3px] shadow-md">
                  <div className="aspect-[4/3] overflow-hidden">
                    <CollageTile photoId={pick(3)} fallbackIdx={3} />
                  </div>
                </div>

                {/* Torn Kraft Centerpiece Note */}
                <div className="col-span-4 parchment-note rounded-lg px-1.5 py-2.5 text-center border border-[#C99B68]/40 z-10 -rotate-1">
                  <p className="font-script text-[19px] leading-[1.08] text-[#7D142B]">
                    {caption || 'Our Beautiful Memories'}
                  </p>
                  <p className="text-[10px] text-[#9A1B38] mt-0.5 leading-none">── ♡ ──</p>
                </div>

                {/* Heart-Cropped Photo */}
                <div className="col-span-4 flex items-center justify-center rotate-2">
                  <div
                    className="w-full aspect-square bg-white p-1 shadow-md overflow-hidden"
                    style={{
                      clipPath:
                        'path("M 52 92 C 52 92 6 62 6 32 C 6 15 19 4 33 4 C 42 4 49 10 52 17 C 55 10 62 4 71 4 C 85 4 98 15 98 32 C 98 62 52 92 52 92 Z")',
                    }}
                  >
                    <CollageTile photoId={pick(4)} fallbackIdx={0} />
                  </div>
                </div>
              </div>

              {/* Bottom Row: 4 Polaroid prints */}
              <div className="grid grid-cols-4 gap-1.5 items-center">
                {[5, 6, 7, 8].map((slotIdx) => (
                  <div
                    key={slotIdx}
                    style={{ transform: `rotate(${slotIdx % 2 === 0 ? '2.5deg' : '-2.5deg'})` }}
                    className="polaroid-frame p-1 pb-2 rounded-[2px]"
                  >
                    <div className="aspect-square overflow-hidden">
                      <CollageTile photoId={pick(slotIdx)} fallbackIdx={slotIdx} />
                    </div>
                  </div>
                ))}
              </div>

              {!hasReal && !compact && (
                <div className="text-center pt-1">
                  <span className="text-[10px] font-medium text-[#8B3246]">
                    Preview theme — tap Add Photos below to fill with our real photos ♡
                  </span>
                </div>
              )}
            </div>
          )}

          {layout === '2-photo' && (
            <div className="grid grid-cols-2 gap-2 aspect-[4/3]">
              {[0, 1].map((i) => (
                <div key={i} className="polaroid-frame p-1 pb-3 rounded-[3px]">
                  <div className="w-full h-full overflow-hidden">
                    <CollageTile photoId={pick(i)} fallbackIdx={i} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {layout === '4-photo' && (
            <div className="grid grid-cols-2 gap-2 aspect-square">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="polaroid-frame p-1 pb-2.5 rounded-[3px]">
                  <div className="w-full h-full overflow-hidden">
                    <CollageTile photoId={pick(i)} fallbackIdx={i} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {layout === '6-photo' && (
            <div className="grid grid-cols-3 grid-rows-2 gap-1.5 aspect-[4/3]">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-md overflow-hidden border border-white shadow-xs">
                  <CollageTile photoId={pick(i)} fallbackIdx={i} />
                </div>
              ))}
            </div>
          )}

          {layout === '9-photo' && (
            <div className="grid grid-cols-3 gap-1.5 aspect-square">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-md overflow-hidden border border-white shadow-xs">
                  <CollageTile photoId={pick(i)} fallbackIdx={i} />
                </div>
              ))}
            </div>
          )}

          {layout === '12-photo' && (
            <div className="grid grid-cols-3 gap-1 aspect-[3/4]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-sm overflow-hidden border border-white">
                  <CollageTile photoId={pick(i)} fallbackIdx={i} />
                </div>
              ))}
            </div>
          )}

          {layout === 'dense' && (
            <div className="grid grid-cols-4 gap-1">
              {(hasReal ? photoIds : Array.from({ length: 16 }).map((_, i) => String(i))).map(
                (item, i) => (
                  <div key={`${item}-${i}`} className="aspect-square rounded-sm overflow-hidden">
                    <CollageTile photoId={hasReal ? item : undefined} fallbackIdx={i} />
                  </div>
                )
              )}
            </div>
          )}

          {layout === 'polaroid' && (
            <div className="grid grid-cols-2 gap-2.5 p-1">
              {Array.from({ length: Math.min(8, Math.max(4, photoIds.length || 4)) }).map((_, i) => (
                <div
                  key={i}
                  style={{ transform: `rotate(${i % 2 === 0 ? '-2deg' : '2deg'})` }}
                  className="polaroid-frame p-1.5 pb-4 rounded-[2px]"
                >
                  <div className="aspect-square overflow-hidden">
                    <CollageTile photoId={pick(i)} fallbackIdx={i} />
                  </div>
                  <span className="block text-[9px] text-right text-[#A81C3B] mt-1">♡</span>
                </div>
              ))}
            </div>
          )}

          {layout === 'heart' && (
            <div className="p-2 bg-gradient-to-br from-[#FDEBE9] to-[#F7D6DA] rounded-xl">
              <div className="grid grid-cols-5 gap-1 aspect-square">
                {Array.from({ length: 25 }).map((_, cellIdx) => {
                  const r = Math.floor(cellIdx / 5);
                  const c = cellIdx % 5;
                  const heartIndex = HEART_CELLS.findIndex(([hr, hc]) => hr === r && hc === c);
                  if (heartIndex === -1) return <div key={cellIdx} />;
                  return (
                    <div
                      key={cellIdx}
                      className="rounded-md overflow-hidden border border-white shadow-xs"
                    >
                      <CollageTile photoId={pick(heartIndex)} fallbackIdx={heartIndex} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {layout === 'film-strip' && (
            <div className="bg-[#1A0D14] rounded-xl px-2.5 py-2.5 border-x-4 border-dashed border-[#E8B878]/65 space-y-2">
              {Array.from({ length: Math.min(5, Math.max(3, photoIds.length || 3)) }).map((_, i) => (
                <div key={i} className="aspect-[16/9] rounded-sm overflow-hidden">
                  <CollageTile photoId={pick(i)} fallbackIdx={i} />
                </div>
              ))}
            </div>
          )}

          {layout === 'cinematic' && (
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: Math.min(9, Math.max(6, photoIds.length || 6)) }).map((_, i) => {
                const cls =
                  i === 0
                    ? 'col-span-6 aspect-[16/9]'
                    : i === 1 || i === 2
                    ? 'col-span-3 aspect-[4/3]'
                    : 'col-span-2 aspect-square';
                return (
                  <div key={i} className={`${cls} rounded-lg overflow-hidden border border-white`}>
                    <CollageTile photoId={pick(i)} fallbackIdx={i} />
                  </div>
                );
              })}
            </div>
          )}

          {caption && layout !== 'scrapbook' && !compact && (
            <p className="mt-2.5 text-center font-script text-[24px] text-[#7D142B] leading-tight">
              {caption} ♡
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const CollageBuilderScreen: React.FC = () => {
  const {
    state,
    navPayload,
    navigate,
    goBack,
    toggleMusicMaster,
    isPlaying,
    uploadPhotos,
    saveCollage,
    deleteCollage,
    showToast,
  } = useApp();

  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [layout, setLayout] = useState<CollageLayoutMode>('scrapbook');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    navPayload.collagePhotoIds && navPayload.collagePhotoIds.length > 0
      ? navPayload.collagePhotoIds
      : state.photos.slice(0, 9).map((p) => p.id)
  );
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('Our Beautiful Memories');

  // Bottom sheets for clean Reference-1 action buttons
  const [pickerOpen, setPickerOpen] = useState(false);
  const [layoutSheetOpen, setLayoutSheetOpen] = useState(false);
  const [captionSheetOpen, setCaptionSheetOpen] = useState(false);
  const [viewingSaved, setViewingSaved] = useState<SavedCollage | null>(null);
  const [showAllSaved, setShowAllSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validSelectedIds = useMemo(
    () => selectedIds.filter((id) => state.photos.some((p) => p.id === id)),
    [selectedIds, state.photos]
  );

  const handleUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const created = await uploadPhotos(e.target.files, 'random_us');
    if (created.length > 0) {
      setSelectedIds((prev) => [...prev, ...created.map((p) => p.id)]);
    }
    e.target.value = '';
  };

  const togglePickPhoto = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const moveSelected = (idx: number, dir: -1 | 1) => {
    const swap = idx + dir;
    if (swap < 0 || swap >= validSelectedIds.length) return;
    const next = [...validSelectedIds];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setSelectedIds(next);
  };

  const handleSave = () => {
    if (validSelectedIds.length === 0) {
      showToast('Add at least 1 photo first to save your collage ♡');
      setPickerOpen(true);
      return;
    }
    saveCollage({
      id: editingId,
      title: title.trim() || caption.trim() || `Our ${layout} Collage`,
      caption: caption.trim(),
      layout,
      photoIds: validSelectedIds,
    });
    setEditingId(undefined);
  };

  const loadForEdit = (c: SavedCollage) => {
    setEditingId(c.id);
    setLayout(c.layout);
    setSelectedIds(c.photoIds);
    setTitle(c.title);
    setCaption(c.caption || 'Our Beautiful Memories');
    setViewingSaved(null);
    setShowAllSaved(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-dvh bg-blush-silk text-[#4A1220] pb-safe">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUploadDirect}
      />

      {/* Reference-1 Romantic Velvet Header */}
      <header className="relative overflow-hidden pt-safe pb-3 px-4">
        <div
          className="absolute -top-6 -left-8 w-44 h-24 -rotate-12 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #6E0E24 0%, #9E2642 70%, transparent 100%)',
            borderRadius: '0 0 60% 30%',
          }}
        />
        <div
          className="absolute -top-6 -right-8 w-44 h-24 rotate-12 pointer-events-none"
          style={{
            background: 'linear-gradient(225deg, #D98E9A 0%, #EAB5BC 65%, transparent 100%)',
            borderRadius: '0 0 30% 60%',
          }}
        />

        <div className="relative z-10 flex items-start justify-between">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="min-h-[40px] min-w-[40px] rounded-full bg-[#7A1228] text-[#FFF6EE] flex items-center justify-center shadow-md border border-[#F5D6B2]/40 mt-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center">
              <span className="font-script text-[44px] leading-none text-[#781227]">
                Kishu
              </span>
              <span className="ml-1 text-xl text-[#A81C3B]">♡</span>
            </div>
            <p className="text-[11px] font-medium text-[#7E3443]">
              Scrapbook &amp; Memory Collages ♡
            </p>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <button
              type="button"
              onClick={toggleMusicMaster}
              aria-label="Toggle music"
              className="min-h-[40px] min-w-[40px] rounded-full bg-[#7A1228] text-[#FFF4E8] flex items-center justify-center shadow-md border border-[#F5D6B2]/40"
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
              aria-label="Settings"
              className="min-h-[40px] min-w-[40px] rounded-full bg-[#7A1228] text-[#FFF4E8] flex items-center justify-center shadow-md border border-[#F5D6B2]/40"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className={`px-4 pt-1 space-y-5 ${typeof navPayload.returnToBeat === 'number' ? 'pb-32' : 'pb-14'}`}>
        {/* Scrapbook Velvet Collage Board */}
        <ScrapbookBoardCanvas
          layout={layout}
          photoIds={validSelectedIds}
          caption={caption}
        />

        {/* Reference-1 Tactile 5-Button Action Bar */}
        <section className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="min-h-[68px] rounded-2xl bg-[#FFF8F2] border border-[#D8A86C]/45 shadow-xs flex flex-col items-center justify-center gap-1 text-[#781227] active:scale-95 transition-transform px-1"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px] font-semibold text-center leading-tight">
              Add Photos
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLayoutSheetOpen(true)}
            className="min-h-[68px] rounded-2xl bg-[#FFF8F2] border border-[#D8A86C]/45 shadow-xs flex flex-col items-center justify-center gap-1 text-[#781227] active:scale-95 transition-transform px-1"
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] font-semibold text-center leading-tight">
              Choose Layout
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCaptionSheetOpen(true)}
            className="min-h-[68px] rounded-2xl bg-[#FFF8F2] border border-[#D8A86C]/45 shadow-xs flex flex-col items-center justify-center gap-1 text-[#781227] active:scale-95 transition-transform px-1"
          >
            <Type className="w-5 h-5" />
            <span className="text-[10px] font-semibold text-center leading-tight">
              Add Caption
            </span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="min-h-[68px] rounded-2xl bg-[#FFF8F2] border border-[#D8A86C]/45 shadow-xs flex flex-col items-center justify-center gap-1 text-[#781227] active:scale-95 transition-transform px-1"
          >
            <Download className="w-5 h-5" />
            <span className="text-[10px] font-semibold text-center leading-tight">
              Save Collage
            </span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[68px] rounded-2xl bg-gradient-to-b from-[#9A1835] to-[#740F25] border border-[#F5CFA2]/40 shadow-md flex flex-col items-center justify-center gap-1 text-[#FFF8F0] active:scale-95 transition-transform px-1"
          >
            <Upload className="w-5 h-5" />
            <span className="text-[10px] font-semibold text-center leading-tight">
              Upload New
            </span>
          </button>
        </section>

        {/* Quick Reorder Strip when real photos are selected */}
        {validSelectedIds.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-semibold text-[#7A2B3C] tabular-nums">
                Selected Photos ({validSelectedIds.length}) · Reorder or remove
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-[#9A1835]"
              >
                + Upload
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {validSelectedIds.map((id, idx) => (
                <div
                  key={`${id}-${idx}`}
                  className="w-20 shrink-0 rounded-xl bg-[#FFFBF7] border border-[#D8A86C]/40 p-1 space-y-1"
                >
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <PhotoImage photoId={id} variant="thumb" />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSelected(idx, -1)}
                      aria-label="Move left"
                      className="w-6 h-6 rounded bg-[#F7E5DF] flex items-center justify-center disabled:opacity-30"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedIds((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label="Remove"
                      className="w-6 h-6 rounded bg-[#FDE4E6] text-[#9A1835] flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === validSelectedIds.length - 1}
                      onClick={() => moveSelected(idx, 1)}
                      aria-label="Move right"
                      className="w-6 h-6 rounded bg-[#F7E5DF] flex items-center justify-center disabled:opacity-30"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Your Collages Strip (Reference 1 bottom showcase) */}
        <section className="rounded-[24px] bg-[#FFF8F2]/92 border border-[#D8A86C]/45 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8B132C]" />
              <h3 className="font-display text-2xl font-semibold text-[#5E1122]">
                Your Collages
              </h3>
            </div>
            {state.collages.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAllSaved((s) => !s)}
                className="text-xs font-semibold text-[#8B132C] flex items-center gap-0.5"
              >
                <span>{showAllSaved ? 'Compact' : 'View All'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {state.collages.length === 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {(['scrapbook', 'heart', 'polaroid', 'film-strip'] as CollageLayoutMode[]).map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setLayout(preset)}
                    className={`rounded-xl overflow-hidden border-2 p-1 bg-[#F9EAE3] text-center transition-transform active:scale-95 ${
                      layout === preset ? 'border-[#8B132C]' : 'border-[#D8A86C]/40'
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <ScrapbookBoardCanvas
                        layout={preset}
                        photoIds={validSelectedIds}
                        caption=""
                        compact
                      />
                    </div>
                    <span className="mt-1 block text-[10px] font-semibold text-[#661124] capitalize truncate">
                      {preset}
                    </span>
                  </button>
                )
              )}
            </div>
          ) : (
            <div className={showAllSaved ? 'space-y-3' : 'grid grid-cols-2 gap-2.5'}>
              {state.collages.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl bg-white border border-[#D8A86C]/40 p-2 space-y-2"
                >
                  <button
                    type="button"
                    onClick={() => setViewingSaved(c)}
                    className="w-full block text-left"
                  >
                    <ScrapbookBoardCanvas
                      layout={c.layout}
                      photoIds={c.photoIds}
                      caption={c.caption}
                      compact
                    />
                  </button>
                  <div className="flex items-center justify-between px-1">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#4A1220] truncate">{c.title}</p>
                      <p className="text-[10px] text-[#8A505E] tabular-nums">
                        {c.photoIds.length} photos
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCollage(c.id)}
                      aria-label="Delete collage"
                      className="w-7 h-7 rounded-lg bg-[#FCE4E7] text-[#8B132C] flex items-center justify-center shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Choose Layout Bottom Sheet (All 11 Layouts) */}
      {layoutSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[460px] rounded-t-3xl bg-[#FDF3EC] p-5 pb-safe space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-[#5E1122]">
                Choose Collage Layout (11)
              </h3>
              <button
                type="button"
                onClick={() => setLayoutSheetOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[55dvh] overflow-y-auto pb-2">
              {COLLAGE_LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setLayout(l.id);
                    setLayoutSheetOpen(false);
                  }}
                  className={`min-h-[46px] px-3.5 rounded-2xl text-xs font-semibold text-left flex items-center justify-between border ${
                    layout === l.id
                      ? 'bg-[#7E1228] text-white border-[#7E1228]'
                      : 'bg-white text-[#4A1220] border-[#D8A86C]/40'
                  }`}
                >
                  <span>{l.label}</span>
                  {layout === l.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Caption & Title Sheet */}
      {captionSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[460px] rounded-t-3xl bg-[#FDF3EC] p-5 pb-safe space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-[#5E1122]">
                Collage Caption & Title
              </h3>
              <button
                type="button"
                onClick={() => setCaptionSheetOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Our Beautiful Memories"
              className="w-full min-h-[46px] rounded-xl border border-[#8B132C]/22 bg-white px-3.5 text-sm"
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Saved collage title (optional)"
              className="w-full min-h-[46px] rounded-xl border border-[#8B132C]/22 bg-white px-3.5 text-sm"
            />
            <button
              type="button"
              onClick={() => setCaptionSheetOpen(false)}
              className="btn-wine-glow w-full min-h-[48px] rounded-full text-white text-sm font-semibold"
            >
              Apply Caption ♡
            </button>
          </div>
        </div>
      )}

      {/* Photo Picker Sheet */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-[460px] rounded-t-3xl bg-[#FDF3EC] p-5 pb-safe max-h-[82dvh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#8B132C]/14">
              <h3 className="font-display text-2xl font-semibold text-[#5E1122]">
                Add Photos ({validSelectedIds.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[40px] px-3 rounded-full bg-[#F6E2DF] text-[#7E1228] text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="min-h-[40px] px-4 rounded-full bg-[#7E1228] text-white text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              {state.photos.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <p className="text-sm text-[#7A4450]">
                    Select photos from your phone to start building your romantic scrapbook.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-wine-glow min-h-[46px] px-6 rounded-full text-white text-xs font-semibold"
                  >
                    Choose Photos from Phone
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {state.photos.map((p) => {
                    const checked = validSelectedIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePickPhoto(p.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                          checked ? 'border-[#8B132C]' : 'border-transparent'
                        }`}
                      >
                        <PhotoImage photoId={p.id} variant="thumb" />
                        {checked && (
                          <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#8B132C] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved Collage Full Preview */}
      {viewingSaved && (
        <div className="fixed inset-0 z-50 bg-[#1A0D14]/94 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="pt-safe flex items-center justify-between text-white">
            <h3 className="font-display text-2xl font-semibold truncate">{viewingSaved.title}</h3>
            <button
              type="button"
              onClick={() => setViewingSaved(null)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="my-auto py-4 max-w-[430px] w-full mx-auto">
            <ScrapbookBoardCanvas
              layout={viewingSaved.layout}
              photoIds={viewingSaved.photoIds}
              caption={viewingSaved.caption}
            />
          </div>
          <div className="pb-safe flex gap-2.5 max-w-[430px] w-full mx-auto">
            <button
              type="button"
              onClick={() => loadForEdit(viewingSaved)}
              className="flex-1 min-h-[48px] rounded-full bg-white text-[#5E1122] text-sm font-semibold"
            >
              Edit Collage
            </button>
            <button
              type="button"
              onClick={() => setViewingSaved(null)}
              className="btn-wine-glow flex-1 min-h-[48px] rounded-full text-white text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {typeof navPayload.returnToBeat === 'number' &&
        !pickerOpen &&
        !layoutSheetOpen &&
        !captionSheetOpen &&
        !viewingSaved && (
          <div className="fixed bottom-0 inset-x-0 z-30 flex justify-center pointer-events-none">
            <div className="w-full max-w-[460px] px-5 pt-4 pb-safe pb-4 bg-gradient-to-t from-[#FDF3EC] via-[#FDF3EC]/95 to-transparent pointer-events-auto">
              <button
                type="button"
                onClick={() =>
                  navigate('journey', { returnToBeat: navPayload.returnToBeat })
                }
                className="btn-wine-glow w-full min-h-[54px] rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <span>{navPayload.nextBeatLabel || 'Continue Our Story'}</span>
                <ArrowRight className="w-4 h-4 text-[#FFE2BD]" />
              </button>
            </div>
          </div>
        )}
    </div>
  );
};
