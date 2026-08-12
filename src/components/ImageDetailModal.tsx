import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  Download,
  Eye,
  Heart,
  Maximize2,
  MessageCircle,
  Share2,
  UserPlus,
  X,
  Send,
  Trash2,
} from 'lucide-react';
import { Comment, ImageItem, User } from '../types';
import { imageService } from '../services/imageService';
import { userService } from '../services/userService';

interface ImageDetailModalProps {
  image: ImageItem | null;
  onClose: () => void;
  currentUser: User | null;
  onLikeToggle: (imageId: string) => void;
  onSaveClick: (image: ImageItem) => void;
  onShareClick: (image: ImageItem) => void;
  onDownloadClick: (image: ImageItem) => void;
  onTagClick: (tag: string) => void;
  onCategoryClick: (cat: string) => void;
  onImageClick: (img: ImageItem) => void;
  onDeleteImage?: (imgId: string) => void;
  isLiked?: boolean;
  isSaved?: boolean;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  image,
  onClose,
  currentUser,
  onLikeToggle,
  onSaveClick,
  onShareClick,
  onDownloadClick,
  onTagClick,
  onCategoryClick,
  onImageClick,
  onDeleteImage,
  isLiked = false,
  isSaved = false,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [relatedImages, setRelatedImages] = useState<ImageItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!image) return;

    // Increment view count
    imageService.incrementView(image.id);

    // Fetch comments & related images
    imageService.getComments(image.id).then(setComments);
    imageService.getRelatedImages(image, 6).then(setRelatedImages);

    // Escape listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image, onClose]);

  if (!image) return null;

  const isOwner = currentUser && currentUser.id === image.userId;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentUser) return;

    const added = await imageService.addComment(image.id, currentUser.id, newCommentText);
    setComments([added, ...comments]);
    setNewCommentText('');
  };

  const handleFollow = async () => {
    if (!currentUser) return;
    const success = await userService.toggleFollowUser(currentUser.id, image.creator.id);
    if (success) setIsFollowing(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Modal Card Container */}
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Top Header Controls */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-full">
              {image.category}
            </span>
            <span className="text-xs text-slate-400">
              Uploaded {new Date(image.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && onDeleteImage && (
              <button
                onClick={() => onDeleteImage(image.id)}
                className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Delete image"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Main Grid Body */}
        <div className="overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left / Top: High-Res Image Display */}
          <div className="lg:col-span-7 bg-slate-950 flex items-center justify-center p-4 min-h-[350px] lg:min-h-[600px] relative group">
            <img
              src={image.url}
              alt={image.title}
              className={`max-h-[75vh] w-auto object-contain transition-transform duration-300 ${
                isFullscreen ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>

          {/* Right / Bottom: Details, Actions & Comments */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div>
              {/* Creator Info & Action Row */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={image.creator.avatar}
                    alt={image.creator.displayName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {image.creator.displayName}
                    </p>
                    <p className="text-xs text-slate-400">@{image.creator.username}</p>
                  </div>
                </div>

                {!isOwner && (
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                      isFollowing
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                )}
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 leading-tight">
                {image.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                {image.description || 'No description provided.'}
              </p>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {image.tags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onTagClick(tag);
                      onClose();
                    }}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs font-medium rounded-full transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Stats Metrics Row */}
              <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6 text-center text-xs">
                <div>
                  <span className="block text-slate-400">Likes</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {image.likesCount}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400">Saves</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {image.savesCount}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400">Views</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {image.viewsCount}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400">Downloads</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {image.downloadsCount}
                  </span>
                </div>
              </div>

              {/* Interactive Action Buttons */}
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => onLikeToggle(image.id)}
                  className={`flex-1 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                    isLiked
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>

                <button
                  onClick={() => onSaveClick(image)}
                  className={`flex-1 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                    isSaved
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                      : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={() => onShareClick(image)}
                  className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDownloadClick(image)}
                  className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Section */}
              <div className="mb-6">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-indigo-500" />
                  Comments ({comments.length})
                </h4>

                {/* Comment Input */}
                {currentUser && (
                  <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-full border border-transparent focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}

                {/* Comment List */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Be the first to leave a comment!</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="flex items-start gap-2.5 text-xs">
                        <img
                          src={c.userAvatar}
                          alt={c.userName}
                          className="w-6 h-6 rounded-full object-cover mt-0.5"
                        />
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl flex-1">
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {c.userName}
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5">{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Related Images Section */}
            {relatedImages.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">
                  More Like This
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {relatedImages.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onImageClick(rel)}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <img src={rel.url} alt={rel.title} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
