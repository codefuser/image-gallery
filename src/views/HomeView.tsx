import React from 'react';
import { CategoryChips } from '../components/CategoryChips';
import { MasonryGrid } from '../components/MasonryGrid';
import { CATEGORIES } from '../services/sampleData';
import { ImageItem } from '../types';

interface HomeViewProps {
  images: ImageItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onImageClick: (image: ImageItem) => void;
  onLikeToggle: (imageId: string, e: React.MouseEvent) => void;
  onSaveClick: (image: ImageItem, e: React.MouseEvent) => void;
  onShareClick: (image: ImageItem, e: React.MouseEvent) => void;
  onDownloadClick: (image: ImageItem, e: React.MouseEvent) => void;
  likedImageIds: Set<string>;
  savedImageIds: Set<string>;
}

export const HomeView: React.FC<HomeViewProps> = ({
  images,
  selectedCategory,
  onSelectCategory,
  onImageClick,
  onLikeToggle,
  onSaveClick,
  onShareClick,
  onDownloadClick,
  likedImageIds,
  savedImageIds,
}) => {
  return (
    <div className="w-full pb-16">
      {/* Category Pills Header */}
      <CategoryChips
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />

      {/* Main Masonry Image Feed */}
      {images.length === 0 ? (
        <div className="text-center py-20 px-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
            📷
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 mb-1">
            No Images Found in Category "{selectedCategory}"
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try switching to another category or upload a new photo to get started!
          </p>
        </div>
      ) : (
        <MasonryGrid
          images={images}
          onImageClick={onImageClick}
          onLikeToggle={onLikeToggle}
          onSaveClick={onSaveClick}
          onShareClick={onShareClick}
          onDownloadClick={onDownloadClick}
          likedImageIds={likedImageIds}
          savedImageIds={savedImageIds}
        />
      )}
    </div>
  );
};
