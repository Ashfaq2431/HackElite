import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Megaphone,
  Pin,
  Search,
  Filter,
  Plus,
  Paperclip,
  Download,
  Trash2,
  Eye,
  Calendar,
  AlertCircle,
  X,
  CheckCircle,
} from 'lucide-react';

export default function Announcements() {
  const { user, isAdmin, isFaculty, isClubAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New announcement form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Normal',
    targetAudience: 'All',
    department: 'All Departments',
    isPinned: false,
    attachmentUrl: '',
    attachmentTitle: '',
  });

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAnnouncements();
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        department: formData.department,
        isPinned: formData.isPinned,
        attachments: formData.attachmentUrl
          ? [{ title: formData.attachmentTitle || 'Attachment Document', url: formData.attachmentUrl, fileType: 'pdf' }]
          : [],
      };

      const res = await api.post('/announcements', payload);
      if (res.data.success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          content: '',
          category: 'General',
          priority: 'Normal',
          targetAudience: 'All',
          department: 'All Departments',
          isPinned: false,
          attachmentUrl: '',
          attachmentTitle: '',
        });
        fetchAnnouncements();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await api.put(`/announcements/${id}/pin`);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(announcements.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const canPost = isAdmin || isFaculty || isClubAdmin;

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-600" /> Campus Announcements & Circulars
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official notices, examination schedules, placement bulletins, and campus updates
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Publish Notice
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search notices by title, keywords, or circular details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600"
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600"
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
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Announcements Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search filters or check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const isAuthor = user && ann.author?._id === user._id;
            const canManage = isAuthor || isAdmin;

            return (
              <div
                key={ann._id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 transition shadow-xs space-y-4 ${
                  ann.isPinned
                    ? 'border-indigo-300 ring-1 ring-indigo-200 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {ann.isPinned && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                        <Pin className="w-3 h-3 fill-indigo-600" /> Pinned Notice
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

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {ann.views} views
                    </span>
                    <span>
                      {new Date(ann.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{ann.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>
                </div>

                {/* Attachments if any */}
                {ann.attachments && ann.attachments.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" /> Attached Official Documents:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ann.attachments.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{file.title || 'Download Document'}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer and Management Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={ann.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ann.author?.name || 'Author'}`}
                      alt={ann.author?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium text-slate-700">{ann.author?.name || 'Academic Administration'}</span>
                    <span className="text-slate-400">({ann.author?.department || 'Dean Office'})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {(isAdmin || isFaculty) && (
                      <button
                        onClick={() => handleTogglePin(ann._id)}
                        className={`p-1.5 rounded-lg transition ${
                          ann.isPinned
                            ? 'text-indigo-600 hover:bg-indigo-50'
                            : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
                        }`}
                        title={ann.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                    )}

                    {canManage && (
                      <button
                        onClick={() => handleDelete(ann._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Publish Campus Announcement</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Schedule for Final Year Project Defenses"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent Notice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Announcement Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Provide all details, deadlines, criteria, and instructions..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Attachment Title
                  </label>
                  <input
                    type="text"
                    value={formData.attachmentTitle}
                    onChange={(e) => setFormData({ ...formData, attachmentTitle: e.target.value })}
                    placeholder="e.g. Defense_Guidelines.pdf"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Attachment Link / URL
                  </label>
                  <input
                    type="url"
                    value={formData.attachmentUrl}
                    onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                    placeholder="https://.../document.pdf"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {(isAdmin || isFaculty) && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="pinNotice"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300"
                  />
                  <label htmlFor="pinNotice" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Pin this announcement to top of campus feed
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
