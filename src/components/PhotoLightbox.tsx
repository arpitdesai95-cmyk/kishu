import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Pause,
  Play,
  Star,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PhotoItem } from '../types/app';
import { PhotoImage } from './PhotoImage';

interface PhotoLightboxProps {
  photos: PhotoItem[];
  initialIndex: number;
  startSlideshow?: boolean;
  albumIdForCover?: string;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  initialIndex,
  startSlideshow = false,
  albumIdForCover,
  onClose,
}) => {
  const { updatePhoto, deletePhoto, setAlbumCover, state } = useApp();
  const [index, setIndex] = useState(Math.min(initialIndex, Math.max(0, photos.length - 1)));
  const [slideshow, setSlideshow] = useState(startSlideshow);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const current = photos[index];

  useEffect(() => {
    if (photos.length === 0) {
      onClose();
      return;
    }
    if (index >= photos.length) {
      setIndex(photos.length - 1);
    }
  }, [photos.length, index, onClose]);

  useEffect(() => {
    if (!slideshow || photos.length <= 1 || editingCaption) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [slideshow, photos.length, editingCaption]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((prev) => (prev + 1) % photos.length);
      if (e.key === 'ArrowLeft') setIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photos.length, onClose]);

  if (!current) return null;

  const album = albumIdForCover ? state.albums.find((a) => a.id === albumIdForCover) : undefined;
  const isCover = album?.coverPhotoId === current.id;

  const goPrev = () => {
    setConfirmDelete(false);
    setIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goNext = () => {
    setConfirmDelete(false);
    setIndex((prev) => (prev + 1) % photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 45) {
      if (delta < 0) goNext();
      else goPrev();
    }
  };

  const startEdit = () => {
    setSlideshow(false);
    setCaptionDraft(current.caption || '');
    setEditingCaption(true);
  };

  const saveEdit = () => {
    updatePhoto(current.id, { caption: captionDraft.trim() });
    setEditingCaption(false);
  };

  const handleDelete = async () => {
    const targetId = current.id;
    setConfirmDelete(false);
    await deletePhoto(targetId);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#120B0E]/96 text-[#FAF2EA] flex flex-col justify-between backdrop-blur-md"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar */}
      <div className="pt-safe px-3 h-16 flex items-center justify-between border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close viewer"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-xs tracking-wide text-[#FAF2EA]/75 tabular-nums">
          {index + 1} / {photos.length}
        </span>

        <button
          type="button"
          onClick={() => setSlideshow((s) => !s)}
          className="min-h-[44px] px-3.5 rounded-full flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/15 whitespace-nowrap"
        >
          {slideshow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{slideshow ? 'Pause' : 'Slideshow'}</span>
        </button>
      </div>

      {/* Main Photo Stage */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden px-2 py-4">
        <div className="w-full h-full max-w-[460px] flex items-center justify-center">
          <PhotoImage
            photoId={current.id}
            variant="full"
            alt={current.caption || 'Our memory'}
            loading="eager"
            className="max-h-[70dvh] max-w-full object-contain rounded-xl transition-opacity duration-300"
          />
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] rounded-full bg-black/45 hover:bg-black/65 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] rounded-full bg-black/45 hover:bg-black/65 flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Caption & Actions */}
      <div className="pb-safe px-4 pt-3 border-t border-white/10 bg-[#171014]/90 max-w-[460px] w-full mx-auto">
        {editingCaption ? (
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              placeholder="Write a memory caption…"
              autoFocus
              className="flex-1 min-h-[44px] rounded-xl bg-white/10 border border-white/20 px-3 text-sm text-white placeholder:text-white/45 focus:outline-none focus:border-[#E5A76B]"
            />
            <button
              type="button"
              onClick={saveEdit}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-[#B84A52] text-white flex items-center justify-center"
              aria-label="Save caption"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-[#FAF2EA]/90 text-center mb-3 min-h-[20px]">
            {current.caption || 'Tap edit to add a caption to this memory'}
          </p>
        )}

        <div className="flex items-center justify-around gap-2">
          <button
            type="button"
            onClick={startEdit}
            className="min-h-[44px] px-3 rounded-xl flex items-center gap-1.5 text-xs text-[#FAF2EA]/85 hover:bg-white/10 whitespace-nowrap"
          >
            <Edit3 className="w-4 h-4" />
            <span>Caption</span>
          </button>

          {albumIdForCover && (
            <button
              type="button"
              onClick={() => setAlbumCover(albumIdForCover, current.id)}
              className={`min-h-[44px] px-3 rounded-xl flex items-center gap-1.5 text-xs whitespace-nowrap ${
                isCover ? 'text-[#F2C38E]' : 'text-[#FAF2EA]/85 hover:bg-white/10'
              }`}
            >
              <Star className={`w-4 h-4 ${isCover ? 'fill-[#F2C38E]' : ''}`} />
              <span>{isCover ? 'Album Cover' : 'Set Cover'}</span>
            </button>
          )}

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="min-h-[44px] px-3 rounded-xl flex items-center gap-1.5 text-xs text-[#F59CA0] hover:bg-white/10 whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="min-h-[44px] px-3.5 rounded-xl bg-[#B84A52] text-white text-xs font-medium whitespace-nowrap"
            >
              Confirm Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
