import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, Trash2, Calendar, Megaphone, Users, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-rose-600" />;
      case 'club':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'discussion':
        return <MessageSquare className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" /> Notifications & Activity Stream
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated with event pass issuances, circulars, and discussion replies
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <h3 className="font-bold text-slate-700">No Notifications</h3>
            <p className="text-xs mt-1">You're all caught up with your campus activities.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => markAsRead(n._id)}
              className={`p-4 sm:p-5 rounded-2xl border transition flex items-start gap-4 cursor-pointer ${
                !n.isRead ? 'bg-indigo-50/50 border-indigo-200 shadow-2xs' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm font-bold ${!n.isRead ? 'text-indigo-950' : 'text-slate-900'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                {n.link && (
                  <Link
                    to={n.link}
                    className="inline-block mt-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View details →
                  </Link>
                )}
              </div>

              {!n.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 self-center" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
