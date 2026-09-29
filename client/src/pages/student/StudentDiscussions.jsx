import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare, Plus, Search, ThumbsUp, Eye, Clock,
  Send, X, AlertCircle, Loader2
} from 'lucide-react';

function timeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

export default function StudentDiscussions() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'General' });
  const [submitting, setSubmitting] = useState(false);

  const categories = ['All', 'General', 'Academic', 'Events', 'Clubs', 'Help'];

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/discussions');
      setDiscussions(res.data.discussions || res.data || []);
    } catch {
      setError('Failed to load discussions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiscussions(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    try {
      setSubmitting(true);
      await api.post('/discussions', form);
      setForm({ title: '', content: '', category: 'General' });
      setShowCreate(false);
      fetchDiscussions();
    } catch {
      alert('Failed to post discussion.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = discussions.filter(d => {
    const matchSearch = d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.content?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filter === 'All' || d.category === filter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Community Forum</h1>
          <p className="text-slate-500 text-sm mt-0.5">Ask questions, share ideas, and connect with peers</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Start Discussion
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search discussions..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                filter === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-slate-900">Start a Discussion</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="What do you want to discuss?"
                  className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {['General','Academic','Events','Clubs','Help'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Content *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  required
                  rows={5}
                  placeholder="Share more details..."
                  className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />{submitting ? 'Posting...' : 'Post'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-center gap-3 text-rose-700">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No discussions found</p>
          <p className="text-sm mt-1">Be the first to start one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(d => (
            <div key={d._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <img
                  src={d.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.author?.name}`}
                  alt={d.author?.name}
                  className="w-9 h-9 rounded-full ring-2 ring-slate-100 shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {d.category && (
                      <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{d.category}</span>
                    )}
                    {d.author?._id === user?._id && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Your post</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900">{d.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{d.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(d.createdAt)}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{d.views || 0} views</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" />{d.likes?.length || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{d.comments?.length || 0} replies</span>
                    {d.author?.name && <span>by <strong className="text-slate-600">{d.author.name}</strong></span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
