import React from 'react';
import { History, Search, Trash2, Sparkles } from 'lucide-react';
import { ImageItem } from '../types';
import { MasonryGrid } from '../components/MasonryGrid';
import { storageService } from '../services/storageService';
import { CATEGORIES } from '../services/sampleData';

interface SearchViewProps {
  searchQuery: string;
  results: ImageItem[];
  totalCount: number;
  recentSearches: string[];
  onSearchQueryChange: (q: string) => void;
  onClearRecentSearches: () => void;
  onImageClick: (image: ImageItem) => void;
  onLikeToggle: (imageId: string, e: React.MouseEvent) => void;
  onSaveClick: (image: ImageItem, e: React.MouseEvent) => void;
  onShareClick: (image: ImageItem, e: React.MouseEvent) => void;
  onDownloadClick: (image: ImageItem, e: React.MouseEvent) => void;
  onCategorySelect: (cat: string) => void;
  likedImageIds: Set<string>;
  savedImageIds: Set<string>;
}

export const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  results,
  totalCount,
  recentSearches,
  onSearchQueryChange,
  onClearRecentSearches,
  onImageClick,
  onLikeToggle,
  onSaveClick,
  onShareClick,
  onDownloadClick,
  onCategorySelect,
  likedImageIds,
  savedImageIds,
}) => {
  return (
    <div className="w-full pb-20">
      {/* Search Header Info */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Search className="w-6 h-6 text-indigo-600" />
              {searchQuery ? (
                <span>
                  Results for "<span className="text-indigo-600">{searchQuery}</span>"
                </span>
              ) : (
                'Search Gallery'
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Found {totalCount} matching image{totalCount !== 1 ? 's' : ''} in local database
            </p>
          </div>

          {/* Recent Searches Pills */}
          {recentSearches.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Recent:
              </span>
              {recentSearches.slice(0, 5).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSearchQueryChange(q)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
              <button
                onClick={onClearRecentSearches}
                className="p-1 text-slate-400 hover:text-red-500"
                title="Clear Recent History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Feed or No Results Fallback */}
      {results.length > 0 ? (
        <MasonryGrid
          images={results}
          onImageClick={onImageClick}
          onLikeToggle={onLikeToggle}
          onSaveClick={onSaveClick}
          onShareClick={onShareClick}
          onDownloadClick={onDownloadClick}
          likedImageIds={likedImageIds}
          savedImageIds={savedImageIds}
        />
      ) : (
        <div className="max-w-xl mx-auto text-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mx-auto mb-4">
            🔍
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
            No Images Match "{searchQuery}"
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            We couldn't find any local photos matching your search terms. Try searching for tags like "nature", "tokyo", "3d", "minimalist", or browse popular categories below.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Popular Categories
            </h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategorySelect(cat.name)}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full shadow-sm hover:scale-105 transition-transform"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
