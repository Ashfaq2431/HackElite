import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Megaphone, Plus, Trash2, Pin, Calendar, AlertCircle, X } from 'lucide-react';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Urgent',
    isPinned: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data.announcements || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/announcements', formData);
      setShowModal(false);
      setFormData({ title: '', content: '', category: 'Urgent', isPinned: false });
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Error publishing announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(announcements.filter((a) => a._id !== id));
    } catch {
      alert('Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Official Announcements</h1>
          <p className="text-slate-500 text-sm mt-0.5">Publish system notices, circulars, and campus-wide broadcasts.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Broadcast Notice
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann._id}
            className={`bg-white rounded-2xl border p-5 shadow-xs flex items-start justify-between gap-4 transition ${
              ann.isPinned ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {ann.category || 'General'}
                </span>
                {ann.isPinned && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{ann.title}</h3>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{ann.content}</p>
              <p className="text-xs text-slate-400 mt-3 font-medium">
                Author: {ann.author?.name || 'Administrator'} ({ann.author?.role || 'Admin'})
              </p>
            </div>
            <button
              onClick={() => handleDelete(ann._id)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Broadcast Notice</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. End Semester Exam Schedule Released"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-600"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="Academic">Academic</option>
                    <option value="Event">Event</option>
                    <option value="Notice">Notice</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-slate-600 uppercase">Pin to Top</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Content</label>
                <textarea
                  required
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Announcement details..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-600 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Broadcasting...' : 'Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
