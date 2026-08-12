import React, { useState } from 'react';
import { ArrowLeft, Edit2, Lock, Trash2, Unlock } from 'lucide-react';
import { Board, ImageItem } from '../types';
import { boardService } from '../services/boardService';
import { MasonryGrid } from '../components/MasonryGrid';

interface BoardDetailViewProps {
  board: Board;
  boardImages: ImageItem[];
  onBack: () => void;
  onBoardUpdated: () => void;
  onBoardDeleted: () => void;
  onImageClick: (image: ImageItem) => void;
  onLikeToggle: (imageId: string, e: React.MouseEvent) => void;
  onSaveClick: (image: ImageItem, e: React.MouseEvent) => void;
  onShareClick: (image: ImageItem, e: React.MouseEvent) => void;
  onDownloadClick: (image: ImageItem, e: React.MouseEvent) => void;
  likedImageIds: Set<string>;
  savedImageIds: Set<string>;
}

export const BoardDetailView: React.FC<BoardDetailViewProps> = ({
  board,
  boardImages,
  onBack,
  onBoardUpdated,
  onBoardDeleted,
  onImageClick,
  onLikeToggle,
  onSaveClick,
  onShareClick,
  onDownloadClick,
  likedImageIds,
  savedImageIds,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description);
  const [isPrivate, setIsPrivate] = useState(board.isPrivate);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await boardService.updateBoard(board.id, {
      name,
      description,
      isPrivate,
    });
    setIsEditing(false);
    onBoardUpdated();
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete board "${board.name}"?`)) {
      await boardService.deleteBoard(board.id);
      onBoardDeleted();
    }
  };

  return (
    <div className="w-full pb-20">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Boards
        </button>

        {!isEditing ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {board.name}
                </h1>
                {board.isPrivate ? (
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full" title="Private board">
                    <Lock className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full" title="Public board">
                    <Unlock className="w-4 h-4" />
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{board.description || 'No description provided.'}</p>
              <p className="text-xs text-slate-400 mt-2">
                {boardImages.length} pin{boardImages.length !== 1 ? 's' : ''} saved in this collection
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Board
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
                title="Delete Board"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleUpdate} className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl mb-8 space-y-4 max-w-xl">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Edit Board Settings</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Board Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
              <label htmlFor="edit-private" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Keep board private
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Board Saved Images Grid */}
      {boardImages.length === 0 ? (
        <div className="text-center py-20 px-4 text-slate-400">
          <p className="font-bold text-sm">This board is empty.</p>
          <p className="text-xs mt-1">Browse photos in Home or Explore and click Save to add pins to "{board.name}".</p>
        </div>
      ) : (
        <MasonryGrid
          images={boardImages}
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
