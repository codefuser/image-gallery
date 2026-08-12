import React, { useState } from 'react';
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
  // 'grid' = masonry gallery view | 'single' = one image per column (full width)
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');

  return (
    <div className="w-full pb-16">
      {/* Category Filter Bar + Grid Toggle */}
      <div className="w-full px-2 sm:px-4 lg:px-6 pt-4 pb-2 flex items-center gap-2">
        {/* Category Chips — scrollable, takes remaining space */}
        <div className="flex-1 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2.5 py-2">
            <button
              id="cat-all"
              onClick={() => onSelectCategory('All')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-gradient-to-r from-red-600 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              ✨ All Discoveries
            </button>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  id={`cat-${cat.slug}`}
                  onClick={() => onSelectCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid / Single Column Toggle Button */}
        <div className="shrink-0 flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 rounded-full p-1">
          {/* Gallery / Masonry Grid */}
          <button
            id="view-grid"
            title="Gallery View"
            onClick={() => setViewMode('grid')}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-red-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {/* Masonry / Grid icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="0" width="7" height="4" rx="1" />
              <rect x="9" y="0" width="7" height="6" rx="1" />
              <rect x="0" y="6" width="7" height="6" rx="1" />
              <rect x="9" y="8" width="7" height="4" rx="1" />
              <rect x="0" y="14" width="7" height="2" rx="1" />
              <rect x="9" y="14" width="7" height="2" rx="1" />
            </svg>
          </button>

          {/* Single Column */}
          <button
            id="view-single"
            title="Single Column View"
            onClick={() => setViewMode('single')}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
              viewMode === 'single'
                ? 'bg-gradient-to-r from-red-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {/* Single column icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="0" width="16" height="3" rx="1" />
              <rect x="0" y="5" width="16" height="3" rx="1" />
              <rect x="0" y="10" width="16" height="3" rx="1" />
              <rect x="0" y="15" width="16" height="1" rx="0.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Image Feed */}
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
          viewMode={viewMode}
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
