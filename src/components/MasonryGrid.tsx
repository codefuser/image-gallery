import React, { useEffect, useState } from 'react';
import { ImageItem } from '../types';
import { ImageCard } from './ImageCard';

interface MasonryGridProps {
  images: ImageItem[];
  viewMode?: 'grid' | 'single';
  onImageClick: (image: ImageItem) => void;
  onLikeToggle: (imageId: string, e: React.MouseEvent) => void;
  onSaveClick: (image: ImageItem, e: React.MouseEvent) => void;
  onShareClick: (image: ImageItem, e: React.MouseEvent) => void;
  onDownloadClick: (image: ImageItem, e: React.MouseEvent) => void;
  likedImageIds: Set<string>;
  savedImageIds: Set<string>;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  images,
  viewMode = 'grid',
  onImageClick,
  onLikeToggle,
  onSaveClick,
  onShareClick,
  onDownloadClick,
  likedImageIds,
  savedImageIds,
}) => {
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w < 520) setColumnCount(2);       // Mobile: 2 cols
      else if (w < 840) setColumnCount(3);  // Small Tablet: 3 cols
      else if (w < 1200) setColumnCount(4); // Tablet/Laptop: 4 cols
      else if (w < 1600) setColumnCount(5); // Desktop: 5 cols
      else setColumnCount(6);               // Large Screen: 6 cols
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // ─── SINGLE COLUMN MODE ────────────────────────────────────────────────────
  if (viewMode === 'single') {
    return (
      <div className="w-full px-3 sm:px-6 py-3 flex flex-col gap-4 animate-fadeIn">
        {images.map((img) => (
          <div
            key={img.id}
            className="w-full rounded-2xl overflow-hidden shadow-xl transition-transform duration-200 hover:scale-[1.01] cursor-pointer"
            onClick={() => onImageClick(img)}
          >
            <img
              src={img.url}
              alt={img.title}
              className="w-full object-cover"
              style={{ maxHeight: '85vh' }}
              loading="lazy"
            />
            {/* Info bar */}
            <div className="bg-slate-900/95 dark:bg-slate-950/95 px-4 py-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{img.title}</p>
                <p className="text-slate-400 text-xs truncate">{img.creator.displayName}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {/* Like */}
                <button
                  id={`like-single-${img.id}`}
                  onClick={(e) => { e.stopPropagation(); onLikeToggle(img.id, e); }}
                  className={`flex items-center gap-1 text-xs font-bold transition-colors ${likedImageIds.has(img.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                >
                  <span>{likedImageIds.has(img.id) ? '❤️' : '🤍'}</span>
                  <span>{img.likesCount}</span>
                </button>
                {/* Save */}
                <button
                  id={`save-single-${img.id}`}
                  onClick={(e) => { e.stopPropagation(); onSaveClick(img, e); }}
                  className={`flex items-center gap-1 text-xs font-bold transition-colors ${savedImageIds.has(img.id) ? 'text-indigo-400' : 'text-slate-400 hover:text-indigo-400'}`}
                >
                  <span>{savedImageIds.has(img.id) ? '🔖' : '➕'}</span>
                </button>
                {/* Download */}
                <button
                  id={`dl-single-${img.id}`}
                  onClick={(e) => { e.stopPropagation(); onDownloadClick(img, e); }}
                  className="text-slate-400 hover:text-white text-xs transition-colors"
                >
                  ⬇️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── MASONRY GRID MODE (default) ──────────────────────────────────────────
  const columns: ImageItem[][] = Array.from({ length: columnCount }, () => []);
  images.forEach((img, idx) => {
    columns[idx % columnCount].push(img);
  });

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-4 animate-fadeIn">
      <div className="flex gap-2 sm:gap-4 items-start">
        {columns.map((colImages, colIdx) => (
          <div key={colIdx} className="flex-1 flex flex-col gap-2 sm:gap-4">
            {colImages.map((img) => (
              <ImageCard
                key={img.id}
                image={img}
                onClick={onImageClick}
                onLikeToggle={onLikeToggle}
                onSaveClick={onSaveClick}
                onShareClick={onShareClick}
                onDownloadClick={onDownloadClick}
                isLiked={likedImageIds.has(img.id)}
                isSaved={savedImageIds.has(img.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
