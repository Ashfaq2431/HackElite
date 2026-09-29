import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const socket = getSocket();

      // Listen for global announcement broadcast
      const handleNewAnnouncement = (data) => {
        setToastMessage({
          title: `📢 New Announcement: ${data.title}`,
          type: data.priority === 'Urgent' ? 'urgent' : 'info',
        });
        fetchNotifications();
      };

      // Listen for new event
      const handleNewEvent = (data) => {
        setToastMessage({
          title: `🎟️ New Campus Event: ${data.title}`,
          type: 'event',
        });
        fetchNotifications();
      };

      socket.on('new_announcement', handleNewAnnouncement);
      socket.on('new_event', handleNewEvent);

      return () => {
        socket.off('new_announcement', handleNewAnnouncement);
        socket.off('new_event', handleNewEvent);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  // Clear toast automatically after 5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearAll,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
      {/* Toast Alert Popup */}
      {toastMessage && (
        <div className="fixed bottom-22 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-slide-up max-w-md">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
          <div className="flex-1 text-sm font-medium">{toastMessage.title}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
