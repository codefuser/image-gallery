import React from 'react';
import { Bell, Bookmark, CheckCheck, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectImage: (imageId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectImage,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-current" />;
      case 'save':
        return <Bookmark className="w-4 h-4 text-indigo-400 fill-current" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950/60 flex items-center justify-center text-indigo-400 border border-indigo-800/50">
              <Bell className="w-5 h-5" />
            </div>
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Real-time local activity updates and community alerts</p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={onMarkAllAsRead}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer border border-slate-700/60 shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-indigo-400" /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Bell className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-600" />
          <p className="font-bold text-base text-slate-300">No notifications yet.</p>
          <p className="text-xs mt-1 text-slate-500">Activity on your uploaded photos and collections will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onMarkAsRead(n.id);
                if (n.imageId) onSelectImage(n.imageId);
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                !n.isRead
                  ? 'bg-indigo-950/30 border-indigo-800/60 shadow-md'
                  : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={n.actorAvatar}
                    alt={n.actorName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700"
                  />
                  <span className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-800 shadow-sm">
                    {getIcon(n.type)}
                  </span>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                    <span className="font-extrabold text-white">{n.actorName}</span> {n.text}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {n.imageThumbnail && (
                <img
                  src={n.imageThumbnail}
                  alt="Pin"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
