import React from 'react';
import { Bell, Compass, Home, Plus, User } from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  unreadCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  unreadCount,
}) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home, action: () => setActiveTab('home') },
    { id: 'explore' as ActiveTab, label: 'Explore', icon: Compass, action: () => setActiveTab('explore') },
    { id: 'upload' as ActiveTab, label: 'Create', icon: Plus, action: onOpenUpload },
    { id: 'notifications' as ActiveTab, label: 'Alerts', icon: Bell, action: () => setActiveTab('notifications'), badge: unreadCount },
    { id: 'profile' as ActiveTab, label: 'Profile', icon: User, action: () => setActiveTab('profile') },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 px-1 flex items-center justify-between shadow-[0_-10px_35px_rgba(0,0,0,0.8)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={tab.action}
            className="w-1/5 h-full flex flex-col items-center justify-end pb-2 relative cursor-pointer focus:outline-none shrink-0"
          >
            {isActive ? (
              /* Active Tab: Elevated Spring Pop-Up Circle */
              <div className="flex flex-col items-center w-full animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 -mt-7 mb-1 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 border-4 border-slate-900 transition-transform duration-300 transform scale-110 ease-out">
                  <Icon className="w-5.5 h-5.5 stroke-[2.2]" />
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-slate-900">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[11px] font-extrabold text-indigo-400 tracking-tight transition-colors duration-200">
                  {tab.label}
                </span>
              </div>
            ) : (
              /* Inactive Tab: Icon + Label */
              <div className="flex flex-col items-center w-full py-1">
                <div className="relative mb-1">
                  <Icon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-all duration-200" />
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors duration-200">
                  {tab.label}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
