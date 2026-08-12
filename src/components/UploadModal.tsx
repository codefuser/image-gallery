import React, { useState } from 'react';
import { Image as ImageIcon, UploadCloud, X, Check } from 'lucide-react';
import { CATEGORIES } from '../services/sampleData';
import { imageService } from '../services/imageService';
import { ImageItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newImage: ImageItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['aesthetic', 'local']);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);

      const img = new Image();
      img.onload = () => {
        const w = img.width || 800;
        const h = img.height || 800;
        setDimensions({ width: w, height: h });
        setAspectRatio(w / h);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !title.trim()) return;

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(async () => {
      clearInterval(interval);
      setUploadProgress(100);

      const created = await imageService.createImage({
        title,
        description,
        url: previewUrl,
        thumbnail: previewUrl,
        aspectRatio,
        width: dimensions.width,
        height: dimensions.height,
        category,
        tags: tags.length > 0 ? tags : ['photography'],
        privacy,
        status: 'published',
      });

      setIsUploading(false);
      onUploadSuccess(created);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-800 max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 shrink-0">
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <UploadCloud className="w-6 h-6 text-indigo-400" />
            Upload New Discovery
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-5">
          {/* Drag & Drop File Upload Area */}
          {!previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-colors bg-slate-800/50 cursor-pointer"
            >
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-indigo-950/60 flex items-center justify-center text-indigo-400 border border-indigo-800/50">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-slate-100 text-sm">
                    Drag and drop your image here, or <span className="text-indigo-400 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports JPG, PNG, WEBP, GIF up to 50MB
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 max-h-72 flex items-center justify-center border border-slate-800">
              <img src={previewUrl} alt="Preview" className="max-h-72 object-contain" />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl('');
                  setFile(null);
                }}
                className="absolute top-3 right-3 p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Image Title *
              </label>
              <input
                type="text"
                required
                placeholder="Give your photo a catchy title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-xl border border-slate-700/80 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Tell the story behind this shot..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-xl border border-slate-700/80 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 text-slate-100 text-sm rounded-xl border border-slate-700/80 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Privacy Setting
                </label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as 'public' | 'private')}
                  className="w-full px-4 py-3 bg-slate-800 text-slate-100 text-sm rounded-xl border border-slate-700/80 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="public">🌐 Public (Visible to all)</option>
                  <option value="private">🔒 Private (Only me)</option>
                </select>
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Tags (Press Enter or Comma to add)
              </label>
              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800 rounded-xl border border-slate-700/80 min-h-[46px]">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700 text-slate-200 text-xs font-semibold rounded-full shadow-sm"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 bg-transparent border-none text-sm text-slate-100 placeholder-slate-400 focus:outline-none min-w-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar Simulation */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Saving locally to IndexedDB...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-red-600 to-indigo-600 h-full transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!previewUrl || !title.trim() || isUploading}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-full font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Check className="w-4 h-4" />
              <span>Publish Image</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
