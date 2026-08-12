import React, { useRef, useState } from 'react';
import {
  Download,
  Eye,
  Globe,
  Moon,
  RotateCcw,
  Settings,
  Shield,
  Sun,
  Trash2,
  Upload,
  UserCheck,
} from 'lucide-react';
import { AppSettings, ThemeMode, User } from '../types';
import { storageService } from '../services/storageService';
import { dbService } from '../services/db';

interface SettingsViewProps {
  currentUser: User | null;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  settings,
  onUpdateSettings,
  onResetData,
  onLogout,
}) => {
  const [activeSection, setActiveSection] = useState<'account' | 'appearance' | 'privacy' | 'storage'>('appearance');
  const [importStatus, setImportStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = async () => {
    const jsonStr = await storageService.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinscape_local_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const success = await storageService.importDataJSON(content);
      if (success) {
        setImportStatus('✅ Local backup restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setImportStatus('❌ Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Application Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure appearance, local data backup & preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveSection('appearance')}
            className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'appearance'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Sun className="w-4 h-4" /> Appearance & Theme
          </button>

          <button
            onClick={() => setActiveSection('account')}
            className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'account'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Account & Profile
          </button>

          <button
            onClick={() => setActiveSection('privacy')}
            className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'privacy'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" /> Privacy & Controls
          </button>

          <button
            onClick={() => setActiveSection('storage')}
            className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'storage'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Download className="w-4 h-4" /> Local Storage & Backup
          </button>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1">
                  Color Mode Theme
                </h3>
                <p className="text-xs text-slate-400 mb-4">Choose how Pinscape looks on your screen</p>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`p-4 rounded-2xl border text-center font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                      settings.theme === 'light'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sun className="w-6 h-6 text-amber-500" />
                    Light Mode
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`p-4 rounded-2xl border text-center font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                      settings.theme === 'dark'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Moon className="w-6 h-6 text-indigo-400" />
                    Dark Mode
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ theme: 'system' })}
                    className={`p-4 rounded-2xl border text-center font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                      settings.theme === 'system'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Globe className="w-6 h-6 text-emerald-500" />
                    System Preference
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'account' && currentUser && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1">
                  Active User Credentials
                </h3>
                <p className="text-xs text-slate-400 mb-4">Currently signed in locally as:</p>

                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {currentUser.displayName}
                    </p>
                    <p className="text-xs text-slate-400">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="px-5 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-full font-bold text-xs hover:bg-red-100 transition-colors"
                >
                  Sign Out Session
                </button>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1">
                Privacy Controls
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">Allow Image Downloads</p>
                    <p className="text-xs text-slate-400">Let other curators download high-res files of your public pins</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.downloadPermission}
                    onChange={(e) => onUpdateSettings({ downloadPermission: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">Enable Activity Notifications</p>
                    <p className="text-xs text-slate-400">Generate local notifications on likes, saves, comments</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={(e) => onUpdateSettings({ notificationsEnabled: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'storage' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1">
                  Local Data Backup & Restoration
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Export all your local IndexedDB images, boards, likes, and profiles into a JSON backup file, or restore from a previous backup.
                </p>

                {importStatus && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 font-bold text-xs rounded-xl mb-4">
                    {importStatus}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportJSON}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-xs shadow-md flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Export All Data (.JSON)
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-full font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-indigo-500" /> Import JSON Backup
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-base text-red-600 mb-1">
                  Danger Zone
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Reset IndexedDB data back to factory seed dataset.
                </p>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all local data? This will clear custom uploads and restore initial seed images.')) {
                      onResetData();
                    }
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs shadow-md flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Reset All Local Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
