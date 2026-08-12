import React, { useState } from 'react';
import { FolderHeart, RotateCcw, Trash2, Edit3, Lock, Eye } from 'lucide-react';
import { ImageItem } from '../types';

interface MyImagesViewProps {
  uploadedImages: ImageItem[];
  draftImages: ImageItem[];
  trashImages: ImageItem[];
  onRestoreImage: (id: string) => void;
  onSoftDeleteImage: (id: string) => void;
  onPermanentDeleteImage: (id: string) => void;
  onImageClick: (image: ImageItem) => void;
}

export const MyImagesView: React.FC<MyImagesViewProps> = ({
  uploadedImages,
  draftImages,
  trashImages,
  onRestoreImage,
  onSoftDeleteImage,
  onPermanentDeleteImage,
  onImageClick,
}) => {
  const [tab, setTab] = useState<'published' | 'drafts' | 'trash'>('published');

  const currentList =
    tab === 'published' ? uploadedImages : tab === 'drafts' ? draftImages : trashImages;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-indigo-600" />
            My Images Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage published pins, drafts, and recently deleted photos</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('published')}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-colors ${
              tab === 'published'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Published ({uploadedImages.length})
          </button>

          <button
            onClick={() => setTab('drafts')}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-colors ${
              tab === 'drafts'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Drafts ({draftImages.length})
          </button>

          <button
            onClick={() => setTab('trash')}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-colors ${
              tab === 'trash'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Trash / Deleted ({trashImages.length})
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {currentList.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="font-bold text-sm">No photos in {tab}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentList.map((img) => (
            <div
              key={img.id}
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => onImageClick(img)}>
                <img
                  src={img.thumbnail || img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-full">
                  {img.category}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                  {img.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tab === 'trash' && img.deletedAt
                    ? `Deleted ${new Date(img.deletedAt).toLocaleDateString()}`
                    : `Created ${new Date(img.createdAt).toLocaleDateString()}`}
                </p>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {tab === 'trash' ? (
                    <>
                      <button
                        onClick={() => onRestoreImage(img.id)}
                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full font-bold text-xs flex items-center gap-1 hover:bg-emerald-100"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Permanently delete this image?')) {
                            onPermanentDeleteImage(img.id);
                          }
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onImageClick(img)}
                        className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => onSoftDeleteImage(img.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-full"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
