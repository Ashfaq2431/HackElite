import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Megaphone,
  Pin,
  Search,
  Paperclip,
  Download,
  Eye,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function StudentAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');

  const categories = ['All', 'Academic', 'Event', 'Urgent Notice', 'Placement & Career', 'Sports', 'General'];
  const priorities = ['All', 'Normal', 'High', 'Urgent'];

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements', {
        params: {
          search: search || undefined,
          category: category !== 'All' ? category : undefined,
          priority: priority !== 'All' ? priority : undefined,
          department: user?.department || undefined,
        },
      });
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [category, priority]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-indigo-600" /> Campus Announcements & Circulars
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Official academic timetables, exam guidelines, placement notices, and university alerts
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search circulars by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAnnouncements()}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                Priority: {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading notices...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-slate-700">No Announcements Found</h3>
          <p className="text-xs mt-1">Try adjusting the category or search keyword.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 transition shadow-xs space-y-4 ${
                ann.isPinned
                  ? 'border-indigo-300 ring-1 ring-indigo-200 bg-indigo-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                      <Pin className="w-3 h-3 fill-indigo-600" /> Pinned
                    </span>
                  )}
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      ann.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : ann.priority === 'High'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ann.priority} Priority
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    {ann.category}
                  </span>
                </div>

                <span className="text-xs text-slate-400">
                  {new Date(ann.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{ann.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>
              </div>

              {ann.attachments && ann.attachments.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" /> Official Attachments:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ann.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{file.title || 'Download File'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Issued by: {ann.author?.name || 'Administration'}</span>
                <span>{ann.department || 'All Departments'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
