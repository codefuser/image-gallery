import React, { useState } from 'react';
import { Flame, Sparkles, TrendingUp, Grid as GridIcon } from 'lucide-react';
import { Category, ImageItem } from '../types';
import { CATEGORIES } from '../services/sampleData';
import { MasonryGrid } from '../components/MasonryGrid';

interface ExploreViewProps {
  allImages: ImageItem[];
  onSelectCategory: (catName: string) => void;
  onImageClick: (image: ImageItem) => void;
  onLikeToggle: (imageId: string, e: React.MouseEvent) => void;
  onSaveClick: (image: ImageItem, e: React.MouseEvent) => void;
  onShareClick: (image: ImageItem, e: React.MouseEvent) => void;
  onDownloadClick: (image: ImageItem, e: React.MouseEvent) => void;
  likedImageIds: Set<string>;
  savedImageIds: Set<string>;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  allImages,
  onSelectCategory,
  onImageClick,
  onLikeToggle,
  onSaveClick,
  onShareClick,
  onDownloadClick,
  likedImageIds,
  savedImageIds,
}) => {
  const [exploreTab, setExploreTab] = useState<'trending' | 'popular' | 'latest' | 'categories'>(
    'trending'
  );

  const getFilteredExploreImages = () => {
    const list = [...allImages];
    if (exploreTab === 'popular') {
      return list.sort((a, b) => b.likesCount + b.savesCount - (a.likesCount + a.savesCount));
    }
    if (exploreTab === 'trending') {
      return list.sort((a, b) => b.viewsCount - a.viewsCount);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const imagesToShow = getFilteredExploreImages();

  return (
    <div className="w-full pb-20">
      {/* Header Banner */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
          Discover & Explore Visual Ideas
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          Browse trending aesthetics, curated photography, 3D renders, and design inspiration.
        </p>

        {/* Tab Buttons */}
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          <button
            onClick={() => setExploreTab('trending')}
            className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              exploreTab === 'trending'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            Trending Now
          </button>

          <button
            onClick={() => setExploreTab('popular')}
            className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              exploreTab === 'popular'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-red-500" />
            Most Popular
          </button>

          <button
            onClick={() => setExploreTab('latest')}
            className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              exploreTab === 'latest'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Latest Releases
          </button>

          <button
            onClick={() => setExploreTab('categories')}
            className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              exploreTab === 'categories'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <GridIcon className="w-4 h-4 text-indigo-500" />
            All Categories
          </button>
        </div>
      </div>

      {/* View Content */}
      {exploreTab === 'categories' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
            >
              <img
                src={cat.coverUrl}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3 text-white">
                <h3 className="font-extrabold text-sm group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-white/80 line-clamp-1">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <MasonryGrid
          images={imagesToShow}
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
