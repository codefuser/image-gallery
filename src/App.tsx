import React, { useEffect, useState } from 'react';
import { ActiveTab, AppSettings, Board, ImageItem, Notification, ThemeMode, User } from './types';
import { authService } from './services/authService';
import { imageService } from './services/imageService';
import { boardService } from './services/boardService';
import { searchService } from './services/searchService';
import { notificationService } from './services/notificationService';
import { storageService } from './services/storageService';
import { dbService } from './services/db';

import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { ImageDetailModal } from './components/ImageDetailModal';
import { UploadModal } from './components/UploadModal';
import { SaveToBoardModal } from './components/SaveToBoardModal';
import { EditProfileModal } from './components/EditProfileModal';
import { AuthModal } from './components/AuthModal';

import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { SearchView } from './views/SearchView';
import { ProfileView } from './views/ProfileView';
import { BoardDetailView } from './views/BoardDetailView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';
import { MyImagesView } from './views/MyImagesView';

export function App() {
  // App navigation & Theme state
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());

  // User & Data state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedImageIds, setLikedImageIds] = useState<Set<string>>(new Set());
  const [savedImageIds, setSavedImageIds] = useState<Set<string>>(new Set());

  // User Collections
  const [createdImages, setCreatedImages] = useState<ImageItem[]>([]);
  const [savedImages, setSavedImages] = useState<ImageItem[]>([]);
  const [likedImages, setLikedImages] = useState<ImageItem[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  // My Images Trash manager
  const [draftImages, setDraftImages] = useState<ImageItem[]>([]);
  const [trashImages, setTrashImages] = useState<ImageItem[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ImageItem[]>([]);
  const [searchTotalCount, setSearchTotalCount] = useState<number>(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(storageService.getRecentSearches());

  // Active Modals & Selected items
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [saveModalImage, setSaveModalImage] = useState<ImageItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [boardImages, setBoardImages] = useState<ImageItem[]>([]);

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial Load & Auth Initialization
  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      setCurrentUser(user);
    });

    // Theme initialization
    const initialSettings = storageService.getSettings();
    setSettings(initialSettings);
    applyTheme(initialSettings.theme);
  }, []);

  // Reload Feed & Collections whenever category or active user changes
  useEffect(() => {
    loadGalleryData();
  }, [selectedCategory, currentUser]);

  const applyTheme = (mode: ThemeMode) => {
    setTheme(mode);
    const root = document.documentElement;
    if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleToggleTheme = () => {
    const nextMode: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    const updated = storageService.saveSettings({ theme: nextMode });
    setSettings(updated);
    applyTheme(nextMode);
  };

  const loadGalleryData = async () => {
    const feed = await imageService.getFeedImages(selectedCategory);
    setImages(feed);

    if (currentUser) {
      // User likes
      const liked = await imageService.getLikedImages(currentUser.id);
      setLikedImages(liked);
      setLikedImageIds(new Set(liked.map((img) => img.id)));

      // User saved
      const saved = await boardService.getSavedImagesForUser(currentUser.id);
      setSavedImages(saved);
      setSavedImageIds(new Set(saved.map((img) => img.id)));

      // User created
      const uploaded = await imageService.getMyUploadedImages(currentUser.id);
      setCreatedImages(uploaded);

      // Drafts & Trash
      const drafts = await imageService.getMyDrafts(currentUser.id);
      setDraftImages(drafts);
      const trash = await imageService.getMyTrash(currentUser.id);
      setTrashImages(trash);

      // User boards
      const userBoards = await boardService.getUserBoards(currentUser.id);
      setBoards(userBoards);

      // Notifications
      const notifs = await notificationService.getNotifications();
      setNotifications(notifs);
      const count = await notificationService.getUnreadCount();
      setUnreadNotifsCount(count);
    }
  };

  // Like Toggle Handler
  const handleLikeToggle = async (imageId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const isNowLiked = await imageService.toggleLike(imageId, currentUser.id);
    const nextLikes = new Set(likedImageIds);
    if (isNowLiked) {
      nextLikes.add(imageId);
      showToast('❤️ Added to your liked photos');

      // Create notification simulation
      const targetImg = await imageService.getImageById(imageId);
      if (targetImg) {
        await notificationService.addNotification({
          type: 'like',
          actorName: currentUser.displayName,
          actorAvatar: currentUser.avatar,
          imageId: targetImg.id,
          imageThumbnail: targetImg.url,
          text: `liked image "${targetImg.title}"`,
        });
      }
    } else {
      nextLikes.delete(imageId);
      showToast('Removed from liked photos');
    }

    setLikedImageIds(nextLikes);
    loadGalleryData();
  };

  // Save Click Handler
  const handleSaveClick = (image: ImageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setSaveModalImage(image);
  };

  // Share Click Handler
  const handleShareClick = (image: ImageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(image.url);
    showToast('🔗 Image link copied to clipboard!');
  };

  // Download Click Handler
  const handleDownloadClick = async (image: ImageItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await imageService.incrementDownload(image.id);

    // Create invisible anchor to trigger browser file download
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${image.title.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('📥 Download started');
    loadGalleryData();
  };

  // Local Search Submit
  const handleSearchSubmit = async (query: string) => {
    setSearchQuery(query);
    const res = await searchService.searchImages(query);
    setSearchResults(res.results);
    setSearchTotalCount(res.totalCount);
    setRecentSearches(storageService.getRecentSearches());
    setActiveTab('search');
  };

  const handleClearRecentSearches = () => {
    storageService.clearRecentSearches();
    setRecentSearches([]);
  };

  // Board Detail View
  const handleSelectBoard = async (board: Board) => {
    setSelectedBoard(board);
    const imgs = await boardService.getBoardImages(board.id);
    setBoardImages(imgs);
    setActiveTab('board-detail');
  };

  // Trash & Soft Delete Handlers
  const handleSoftDeleteImage = async (imageId: string) => {
    await imageService.softDeleteImage(imageId);
    showToast('Moved photo to Recently Deleted Trash');
    if (selectedImage?.id === imageId) setSelectedImage(null);
    loadGalleryData();
  };

  const handleRestoreImage = async (imageId: string) => {
    await imageService.restoreImage(imageId);
    showToast('Restored photo to published gallery');
    loadGalleryData();
  };

  const handlePermanentDeleteImage = async (imageId: string) => {
    await imageService.permanentDeleteImage(imageId);
    showToast('Permanently deleted image');
    loadGalleryData();
  };

  // Storage Reset
  const handleResetData = async () => {
    await dbService.resetToSeedData();
    showToast('All local data reset to initial seed!');
    loadGalleryData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Sticky Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onOpenUpload={() => (currentUser ? setIsUploadOpen(true) : setIsAuthOpen(true))}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={async () => {
          await authService.logout();
          setCurrentUser(null);
          showToast('Signed out');
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        unreadCount={unreadNotifsCount}
      />

      {/* Main View Container */}
      <main key={activeTab} className="flex-1 w-full min-h-[calc(100vh-4rem)] pb-24 md:pb-8 animate-page-enter">
        {activeTab === 'home' && (
          <HomeView
            images={images}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onImageClick={setSelectedImage}
            onLikeToggle={handleLikeToggle}
            onSaveClick={handleSaveClick}
            onShareClick={handleShareClick}
            onDownloadClick={handleDownloadClick}
            likedImageIds={likedImageIds}
            savedImageIds={savedImageIds}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            allImages={images}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveTab('home');
            }}
            onImageClick={setSelectedImage}
            onLikeToggle={handleLikeToggle}
            onSaveClick={handleSaveClick}
            onShareClick={handleShareClick}
            onDownloadClick={handleDownloadClick}
            likedImageIds={likedImageIds}
            savedImageIds={savedImageIds}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            searchQuery={searchQuery}
            results={searchResults}
            totalCount={searchTotalCount}
            recentSearches={recentSearches}
            onSearchQueryChange={handleSearchSubmit}
            onClearRecentSearches={handleClearRecentSearches}
            onImageClick={setSelectedImage}
            onLikeToggle={handleLikeToggle}
            onSaveClick={handleSaveClick}
            onShareClick={handleShareClick}
            onDownloadClick={handleDownloadClick}
            onCategorySelect={(cat) => {
              setSelectedCategory(cat);
              setActiveTab('home');
            }}
            likedImageIds={likedImageIds}
            savedImageIds={savedImageIds}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            createdImages={createdImages}
            savedImages={savedImages}
            likedImages={likedImages}
            boards={boards}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onOpenCreateBoard={() => {
              if (images.length > 0) setSaveModalImage(images[0]);
            }}
            onSelectBoard={handleSelectBoard}
            onImageClick={setSelectedImage}
            onLikeToggle={handleLikeToggle}
            onSaveClick={handleSaveClick}
            onShareClick={handleShareClick}
            onDownloadClick={handleDownloadClick}
            likedImageIds={likedImageIds}
            savedImageIds={savedImageIds}
          />
        )}

        {activeTab === 'board-detail' && selectedBoard && (
          <BoardDetailView
            board={selectedBoard}
            boardImages={boardImages}
            onBack={() => setActiveTab('profile')}
            onBoardUpdated={loadGalleryData}
            onBoardDeleted={() => {
              setSelectedBoard(null);
              setActiveTab('profile');
              loadGalleryData();
            }}
            onImageClick={setSelectedImage}
            onLikeToggle={handleLikeToggle}
            onSaveClick={handleSaveClick}
            onShareClick={handleShareClick}
            onDownloadClick={handleDownloadClick}
            likedImageIds={likedImageIds}
            savedImageIds={savedImageIds}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            onMarkAsRead={async (id) => {
              await notificationService.markAsRead(id);
              loadGalleryData();
            }}
            onMarkAllAsRead={async () => {
              await notificationService.markAllAsRead();
              loadGalleryData();
            }}
            onSelectImage={async (imageId) => {
              const img = await imageService.getImageById(imageId);
              if (img) setSelectedImage(img);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            settings={settings}
            onUpdateSettings={(newSet) => {
              const updated = storageService.saveSettings(newSet);
              setSettings(updated);
              if (newSet.theme) applyTheme(newSet.theme);
              showToast('Settings saved');
            }}
            onResetData={handleResetData}
            onLogout={async () => {
              await authService.logout();
              setCurrentUser(null);
              showToast('Signed out');
            }}
          />
        )}

        {activeTab === 'my-images' && (
          <MyImagesView
            uploadedImages={createdImages}
            draftImages={draftImages}
            trashImages={trashImages}
            onRestoreImage={handleRestoreImage}
            onSoftDeleteImage={handleSoftDeleteImage}
            onPermanentDeleteImage={handlePermanentDeleteImage}
            onImageClick={setSelectedImage}
          />
        )}
      </main>

      {/* Mobile Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => (currentUser ? setIsUploadOpen(true) : setIsAuthOpen(true))}
        unreadCount={unreadNotifsCount}
      />

      {/* Global Modals */}
      <ImageDetailModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        currentUser={currentUser}
        onLikeToggle={(id) => handleLikeToggle(id)}
        onSaveClick={(img) => setSaveModalImage(img)}
        onShareClick={handleShareClick}
        onDownloadClick={handleDownloadClick}
        onTagClick={(tag) => handleSearchSubmit(tag)}
        onCategoryClick={(cat) => {
          setSelectedCategory(cat);
          setActiveTab('home');
        }}
        onImageClick={setSelectedImage}
        onDeleteImage={handleSoftDeleteImage}
        isLiked={selectedImage ? likedImageIds.has(selectedImage.id) : false}
        isSaved={selectedImage ? savedImageIds.has(selectedImage.id) : false}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(newImg) => {
          showToast('🎉 Image published successfully!');
          setSelectedImage(newImg);
          loadGalleryData();
        }}
      />

      <SaveToBoardModal
        image={saveModalImage}
        currentUser={currentUser}
        onClose={() => setSaveModalImage(null)}
        onSaveComplete={() => {
          showToast('Saved to Board');
          loadGalleryData();
        }}
      />

      <EditProfileModal
        currentUser={currentUser}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onProfileUpdated={(updated) => {
          setCurrentUser(updated);
          showToast('Profile updated!');
          loadGalleryData();
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.displayName}!`);
          loadGalleryData();
        }}
      />
    </div>
  );
}

export default App;
