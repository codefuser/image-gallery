import React, { useEffect, useState } from 'react';
import { ImageItem } from '../types';
import { ImageCard } from './ImageCard';

interface MasonryGridProps {
  images: ImageItem[];
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
      if (w < 520) setColumnCount(2); // Mobile: 2 cols
      else if (w < 840) setColumnCount(3); // Small Tablet: 3 cols
      else if (w < 1200) setColumnCount(4); // Tablet/Laptop: 4 cols
      else if (w < 1600) setColumnCount(5); // Desktop: 5 cols
      else setColumnCount(6); // Large Screen: 6 cols
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Distribute images into columns
  const columns: ImageItem[][] = Array.from({ length: columnCount }, () => []);
  images.forEach((img, idx) => {
    columns[idx % columnCount].push(img);
  });

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
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
