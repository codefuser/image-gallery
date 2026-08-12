import React, { useEffect, useState } from 'react';
import { Bookmark, Lock, Plus, Unlock, X, Check } from 'lucide-react';
import { Board, ImageItem, User } from '../types';
import { boardService } from '../services/boardService';

interface SaveToBoardModalProps {
  image: ImageItem | null;
  currentUser: User | null;
  onClose: () => void;
  onSaveComplete: () => void;
}

export const SaveToBoardModal: React.FC<SaveToBoardModalProps> = ({
  image,
  currentUser,
  onClose,
  onSaveComplete,
}) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [savedBoardIds, setSavedBoardIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser || !image) return;

    boardService.getUserBoards(currentUser.id).then((userBoards) => {
      setBoards(userBoards);
      const savedIn = new Set<string>();
      userBoards.forEach((b) => {
        if (b.imageIds.includes(image.id)) {
          savedIn.add(b.id);
        }
      });
      setSavedBoardIds(savedIn);
    });
  }, [currentUser, image]);

  if (!image || !currentUser) return null;

  const handleToggleBoardSave = async (board: Board) => {
    if (savedBoardIds.has(board.id)) {
      // Unsave
      await boardService.unsaveImage(currentUser.id, image.id, board.id);
      const next = new Set(savedBoardIds);
      next.delete(board.id);
      setSavedBoardIds(next);
    } else {
      // Save
      await boardService.saveImageToBoard(currentUser.id, image.id, board.id);
      const next = new Set(savedBoardIds);
      next.add(board.id);
      setSavedBoardIds(next);
    }
    onSaveComplete();
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    const created = await boardService.createBoard(
      currentUser.id,
      newBoardName,
      newBoardDesc,
      isPrivate
    );
    await boardService.saveImageToBoard(currentUser.id, image.id, created.id);

    setBoards([...boards, created]);
    setSavedBoardIds(new Set([...Array.from(savedBoardIds), created.id]));
    setIsCreatingNew(false);
    setNewBoardName('');
    setNewBoardDesc('');
    onSaveComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-red-600" />
            Save to Board
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4">
          <img
            src={image.thumbnail || image.url}
            alt={image.title}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="overflow-hidden">
            <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
              {image.title}
            </p>
            <p className="text-[11px] text-slate-400">Category: {image.category}</p>
          </div>
        </div>

        {/* Board List */}
        {!isCreatingNew ? (
          <div>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4 pr-1">
              {boards.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No boards created yet.</p>
              ) : (
                boards.map((b) => {
                  const isSavedInBoard = savedBoardIds.has(b.id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleToggleBoardSave(b)}
                      className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-300 dark:bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-500">
                          {b.coverImageUrl ? (
                            <img src={b.coverImageUrl} alt={b.name} className="w-full h-full object-cover" />
                          ) : (
                            b.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            {b.name}
                            {b.isPrivate && <Lock className="w-3 h-3 text-slate-400" />}
                          </p>
                          <p className="text-xs text-slate-400">{b.imageIds.length} pins saved</p>
                        </div>
                      </div>

                      <button
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          isSavedInBoard
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {isSavedInBoard ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-sm rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Board
            </button>
          </div>
        ) : (
          /* Create New Board Inline Form */
          <form onSubmit={handleCreateBoard} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Board Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dream Interiors, Tech Setup"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="What is this collection about?"
                value={newBoardDesc}
                onChange={(e) => setNewBoardDesc(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2">
                {isPrivate ? <Lock className="w-4 h-4 text-indigo-500" /> : <Unlock className="w-4 h-4 text-slate-400" />}
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-slate-100">Keep Board Private</p>
                  <p className="text-[10px] text-slate-400">Only you can see this board</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!newBoardName.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-md transition-colors"
              >
                Create & Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
