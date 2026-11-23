import React, { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PhotoImageProps {
  photoId: string;
  variant?: 'thumb' | 'full';
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallbackSrc?: string;
}

export const PhotoImage: React.FC<PhotoImageProps> = ({
  photoId,
  variant = 'thumb',
  alt = 'Our memory',
  className = 'w-full h-full object-cover object-[50%_18%]',
  loading = 'lazy',
  fallbackSrc,
}) => {
  const { getPhotoUrl } = useApp();
  const [failed, setFailed] = useState(false);
  const url = getPhotoUrl(photoId, variant);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!url || failed) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
        />
      );
    }
    return (
      <div className="w-full h-full min-h-[72px] flex items-center justify-center bg-[#EFE3DA] text-[#9A786E]">
        <ImageIcon className="w-5 h-5 opacity-55" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

interface ScenicImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackGradient?: string;
}

export const ScenicImage: React.FC<ScenicImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackGradient = 'from-[#2A171E] via-[#6E3540] to-[#D6965E]',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`w-full h-full bg-gradient-to-br ${fallbackGradient}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
