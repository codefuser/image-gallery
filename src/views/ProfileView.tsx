import React, { useState } from 'react';
import {
  Edit3,
  Globe,
  Grid,
  Heart,
  Lock,
  Plus,
  Share2,
  Bookmark,
  Folder,
} from 'lucide-react';
import { Board, ImageItem, User } from '../types';
import { MasonryGrid } from '../components/MasonryGrid';

interface ProfileViewProps {
  currentUser: User | null;
  createdImages: ImageItem[];
  savedImages: ImageItem[];
  likedImages: ImageItem[];
  boards: Board[];
  onOpenEditProfile: () => void;
  onOpenCreateBoard: () => void;
  onSelectBoard: (board: Board) => void;
  onImageClick: (image: ImageItem) => void;
  onLikeToggle: (imageId: string, e: React.MouseEvent) => void;
  onSaveClick: (image: ImageItem, e: React.MouseEvent) => void;
  onShareClick: (image: ImageItem, e: React.MouseEvent) => void;
  onDownloadClick: (image: ImageItem, e: React.MouseEvent) => void;
  likedImageIds: Set<string>;
  savedImageIds: Set<string>;
}

type ProfileTab = 'created' | 'saved' | 'boards' | 'liked';

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  createdImages,
  savedImages,
  likedImages,
  boards,
  onOpenEditProfile,
  onOpenCreateBoard,
  onSelectBoard,
  onImageClick,
  onLikeToggle,
  onSaveClick,
  onShareClick,
  onDownloadClick,
  likedImageIds,
  savedImageIds,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('created');

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      {/* Profile Header & Cover Banner */}
      <div className="relative">
        <div className="h-44 sm:h-64 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-900 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
        </div>

        {/* Profile Details Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 text-center">
          <div className="relative inline-block mb-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-2xl mx-auto"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {currentUser.displayName}
          </h1>
          <p className="text-sm font-semibold text-slate-400">@{currentUser.username}</p>

          {currentUser.bio && (
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
              {currentUser.bio}
            </p>
          )}

          {currentUser.website && (
            <a
              href={currentUser.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
            >
              <Globe className="w-3.5 h-3.5" />
              {currentUser.website.replace(/^https?:\/\//, '')}
            </a>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 my-5 text-center">
            <div>
              <span className="block text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {currentUser.followersCount}
              </span>
              <span className="text-xs text-slate-400">Followers</span>
            </div>
            <div>
              <span className="block text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {currentUser.followingCount}
              </span>
              <span className="text-xs text-slate-400">Following</span>
            </div>
            <div>
              <span className="block text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {createdImages.length}
              </span>
              <span className="text-xs text-slate-400">Created</span>
            </div>
            <div>
              <span className="block text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {savedImages.length}
              </span>
              <span className="text-xs text-slate-400">Saved</span>
            </div>
          </div>

          {/* Edit Profile / Share Actions */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={onOpenEditProfile}
              className="px-5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full font-bold text-xs shadow-md hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
              }}
              className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('created')}
              className={`px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'created'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Grid className="w-4 h-4" />
              Created ({createdImages.length})
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'saved'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Saved Pins ({savedImages.length})
            </button>

            <button
              onClick={() => setActiveTab('boards')}
              className={`px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'boards'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Folder className="w-4 h-4" />
              Boards ({boards.length})
            </button>

            <button
              onClick={() => setActiveTab('liked')}
              className={`px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'liked'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Heart className="w-4 h-4" />
              Liked ({likedImages.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="mt-6">
        {activeTab === 'created' && (
          createdImages.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="font-bold text-sm">No uploaded images yet.</p>
              <p className="text-xs mt-1">Click Create in top navigation to publish your first photo!</p>
            </div>
          ) : (
            <MasonryGrid
              images={createdImages}
              onImageClick={onImageClick}
              onLikeToggle={onLikeToggle}
              onSaveClick={onSaveClick}
              onShareClick={onShareClick}
              onDownloadClick={onDownloadClick}
              likedImageIds={likedImageIds}
              savedImageIds={savedImageIds}
            />
          )
        )}

        {activeTab === 'saved' && (
          savedImages.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="font-bold text-sm">No saved pins yet.</p>
              <p className="text-xs mt-1">Click Save on any photo in the feed to save it to your library.</p>
            </div>
          ) : (
            <MasonryGrid
              images={savedImages}
              onImageClick={onImageClick}
              onLikeToggle={onLikeToggle}
              onSaveClick={onSaveClick}
              onShareClick={onShareClick}
              onDownloadClick={onDownloadClick}
              likedImageIds={likedImageIds}
              savedImageIds={savedImageIds}
            />
          )
        )}

        {activeTab === 'boards' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end mb-4">
              <button
                onClick={onOpenCreateBoard}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Board
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {boards.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectBoard(b)}
                  className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    {b.coverImageUrl ? (
                      <img
                        src={b.coverImageUrl}
                        alt={b.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-extrabold text-3xl text-slate-400">
                        {b.name.charAt(0)}
                      </div>
                    )}
                    {b.isPrivate && (
                      <span className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-md text-white rounded-full">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                      {b.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {b.description || 'No description'}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>{b.imageIds.length} Pins</span>
                      <span>Updated {new Date(b.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'liked' && (
          likedImages.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="font-bold text-sm">No liked images yet.</p>
              <p className="text-xs mt-1">Tap the heart button on photos to build your favorites list.</p>
            </div>
          ) : (
            <MasonryGrid
              images={likedImages}
              onImageClick={onImageClick}
              onLikeToggle={onLikeToggle}
              onSaveClick={onSaveClick}
              onShareClick={onShareClick}
              onDownloadClick={onDownloadClick}
              likedImageIds={likedImageIds}
              savedImageIds={savedImageIds}
            />
          )
        )}
      </div>
    </div>
  );
};
