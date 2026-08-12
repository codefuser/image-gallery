import React, { useState } from 'react';
import { Bookmark, Download, Heart, Share2 } from 'lucide-react';
import { ImageItem } from '../types';

interface ImageCardProps {
  image: ImageItem;
  onClick: (image: ImageItem) => void;
  onLikeToggle: (imageId: string, e: React.MouseEvent) => void;
  onSaveClick: (image: ImageItem, e: React.MouseEvent) => void;
  onShareClick: (image: ImageItem, e: React.MouseEvent) => void;
  onDownloadClick: (image: ImageItem, e: React.MouseEvent) => void;
  isLiked?: boolean;
  isSaved?: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onClick,
  onLikeToggle,
  onSaveClick,
  onShareClick,
  onDownloadClick,
  isLiked = false,
  isSaved = false,
}) => {
  const [hasError, setHasError] = useState(false);

  // Fallback SVG Data URL if network image fails or gets blocked
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%234f46e5"/><stop offset="50%" stop-color="%239333ea"/><stop offset="100%" stop-color="%23e11d48"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="400" cy="400" r="180" fill="none" stroke="white" stroke-width="4" opacity="0.3"/><text x="50%" y="48%" fill="white" font-family="sans-serif" font-size="32" font-weight="800" text-anchor="middle">${encodeURIComponent(
    image.title
  )}</text><text x="50%" y="54%" fill="rgba(255,255,255,0.8)" font-family="sans-serif" font-size="20" font-weight="600" text-anchor="middle">${encodeURIComponent(
    image.category
  )}</text></svg>`;

  return (
    <div
      onClick={() => onClick(image)}
      className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800/80 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500/50"
    >
      {/* Image Element */}
      <img
        src={hasError ? fallbackSvg : image.url}
        alt={image.title}
        loading="lazy"
        onError={() => setHasError(true)}
        className="w-full h-auto object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 ease-out block"
      />

      {/* Hover Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 z-10 rounded-2xl">
        {/* Top Overlay Actions */}
        <div className="flex items-center justify-between w-full gap-2">
          <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[11px] font-bold rounded-full border border-white/20 truncate max-w-[140px]">
            {image.category}
          </span>

          <button
            onClick={(e) => onSaveClick(image, e)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer flex-shrink-0 ${
              isSaved
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Bottom Overlay Info & Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-white font-bold text-sm line-clamp-1 drop-shadow-md">
            {image.title}
          </h3>

          <div className="flex items-center justify-between gap-2">
            {/* Creator Info */}
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={image.creator.avatar}
                alt={image.creator.displayName}
                className="w-6 h-6 rounded-full object-cover border border-white/60 flex-shrink-0"
              />
              <span className="text-white/90 text-xs font-semibold truncate">
                {image.creator.displayName}
              </span>
            </div>

            {/* Quick Action Icons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Like Button */}
              <button
                onClick={(e) => onLikeToggle(image.id, e)}
                className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
                  isLiked
                    ? 'bg-red-600 text-white animate-heart-pop'
                    : 'bg-white/20 text-white hover:bg-white/40'
                }`}
                title="Like image"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              {/* Share Button */}
              <button
                onClick={(e) => onShareClick(image, e)}
                className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors duration-200 cursor-pointer"
                title="Share link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {/* Download Button */}
              <button
                onClick={(e) => onDownloadClick(image, e)}
                className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors duration-200 cursor-pointer"
                title="Download high-res"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
