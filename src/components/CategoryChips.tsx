import React from 'react';
import { Category } from '../types';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 pt-4 pb-2">
      <div className="flex items-center gap-2.5 overflow-x-auto hide-scrollbar py-2">
        <button
          onClick={() => onSelectCategory('All')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
            selectedCategory === 'All'
              ? 'bg-gradient-to-r from-red-600 to-indigo-600 text-white shadow-lg scale-105'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
          }`}
        >
          ✨ All Discoveries
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.id}
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
  );
};
