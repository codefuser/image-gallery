import React, { useState } from 'react';
import {
  Compass,
  FolderHeart,
  Grid,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  User as UserIcon,
  X,
  Bell,
} from 'lucide-react';
import { ActiveTab, User, ThemeMode } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onOpenUpload,
  onOpenAuth,
  onLogout,
  theme,
  onToggleTheme,
  unreadCount,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(localQuery);
      setActiveTab('search');
    }
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800 transition-colors duration-200">
      <div className="w-full px-2 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer focus:outline-none"
            aria-label="Pinscape Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-200">
              <Grid className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight hidden sm:inline-block bg-gradient-to-r from-red-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Pinscape
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 font-semibold text-sm">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === 'explore'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              Explore
            </button>
          </nav>
        </div>

        {/* Middle: Local Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center w-full">
            <Search className="w-4.5 h-4.5 absolute left-3.5 text-slate-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search high-res images, tags, creators..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-9 py-2 h-10 bg-slate-800/80 text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-full border border-slate-700/60 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none transition-all shadow-inner"
            />
            {localQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Dark Mode & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Create / Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 h-9 sm:h-10 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white rounded-full text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            title="Upload Image"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title={`Switch theme (Current: ${theme})`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-300" />}
          </button>

          {/* Notifications Icon */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`p-2 rounded-full relative transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer focus:outline-none"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-700"
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-3 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <div className="px-4 pb-3 mb-2 border-b border-slate-800">
                    <p className="font-bold text-sm text-slate-100 truncate">
                      {currentUser.displayName}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      @{currentUser.username}
                    </p>
                  </div>

                  <div className="space-y-1 text-sm font-medium text-slate-300">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-800 transition-colors text-left"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('my-images');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-800 transition-colors text-left"
                    >
                      <FolderHeart className="w-4 h-4 text-indigo-400" />
                      My Images & Trash
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-800 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-indigo-400" />
                      Settings
                    </button>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-red-400 hover:bg-red-950/40 transition-colors text-left font-bold text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
