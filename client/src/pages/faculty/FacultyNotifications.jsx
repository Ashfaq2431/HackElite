import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, Trash2, Calendar, Megaphone, Users, MessageSquare } from 'lucide-react';

function getIcon(type) {
  switch (type) {
    case 'event': return <Calendar className="w-4 h-4" />;
    case 'announcement': return <Megaphone className="w-4 h-4" />;
    case 'club': return <Users className="w-4 h-4" />;
    case 'discussion': return <MessageSquare className="w-4 h-4" />;
    default: return <Bell className="w-4 h-4" />;
  }
}

function timeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

export default function FacultyNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition">
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
          <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No notifications yet</p>
          <p className="text-xs text-slate-400 mt-1">You'll see updates about events, students, and announcements here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {notifications.map(n => (
            <div
              key={n._id}
              onClick={() => markAsRead(n._id)}
              className={`flex gap-4 p-4 cursor-pointer hover:bg-slate-50 transition ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                !n.isRead ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 self-center" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
