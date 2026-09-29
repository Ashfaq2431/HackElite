import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Search,
  Plus,
  ThumbsUp,
  Tag,
  CheckCircle,
  Eye,
  ArrowRight,
  X,
  HelpCircle,
} from 'lucide-react';

export default function Discussions() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New discussion form
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General Campus',
    tags: 'Campus, Discussion',
  });

  const categories = [
    'All',
    'General Campus',
    'Academics & Courses',
    'Tech & Coding',
    'Placements & Career',
    'Clubs & Events',
    'Lost & Found',
  ];

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/discussions', {
        params: {
          category: category !== 'All' ? category : undefined,
          sort: sort !== 'latest' ? sort : undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setDiscussions(res.data.discussions);
      }
    } catch (err) {
      console.error('Failed to load discussions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [category, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDiscussions();
  };

  const handleUpvote = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to upvote');
      return;
    }
    try {
      const res = await api.post(`/discussions/${id}/upvote`);
      if (res.data.success) {
        setDiscussions((prev) =>
          prev.map((d) => {
            if (d._id === id) {
              const currentUpvotes = d.upvotes || [];
              const exists = currentUpvotes.includes(user._id);
              return {
                ...d,
                upvotes: exists
                  ? currentUpvotes.filter((uid) => uid !== user._id)
                  : [...currentUpvotes, user._id],
              };
            }
            return d;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()),
      };

      const res = await api.post('/discussions', payload);
      if (res.data.success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          content: '',
          category: 'General Campus',
          tags: 'Campus, Discussion',
        });
        fetchDiscussions();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start discussion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" /> Campus Community Forum
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Exchange ideas, ask questions, form study groups, and find coding partners
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Start Discussion
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search discussions by topic, tag, or content..."
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
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="latest">Sort: Newest</option>
            <option value="popular">Sort: Most Upvoted</option>
            <option value="replies">Sort: Most Replies</option>
          </select>
        </div>
      </div>

      {/* Discussions Feed */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading discussions...</p>
        </div>
      ) : discussions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Discussions Found</h3>
          <p className="text-xs text-slate-400 mt-1">Be the first to post a question or topic!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((d) => {
            const hasUpvoted = user && d.upvotes?.includes(user._id);
            const hasAccepted = d.replies?.some((r) => r.isAcceptedAnswer);

            return (
              <Link
                key={d._id}
                to={`/discussions/${d._id}`}
                className="block bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 hover:border-indigo-300 hover:shadow-xs transition group"
              >
                <div className="flex items-start gap-4">
                  {/* Upvote Button Pill */}
                  <button
                    onClick={(e) => handleUpvote(d._id, e)}
                    className={`flex flex-col items-center justify-center w-12 py-2 rounded-xl border text-xs font-bold transition shrink-0 ${
                      hasUpvoted
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 mb-0.5" />
                    <span>{d.upvotes?.length || 0}</span>
                  </button>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {d.category}
                      </span>
                      {hasAccepted && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Solved
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        Posted {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                      {d.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {d.content}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <img
                          src={d.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.author?.name || 'Author'}`}
                          alt={d.author?.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-medium text-slate-700">{d.author?.name}</span>
                        <span className="text-slate-400">({d.author?.department})</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> {d.views}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-indigo-600">
                          <MessageSquare className="w-3.5 h-3.5" /> {d.replies?.length || 0} replies
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Start Discussion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Start Community Discussion</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Best resources to learn React & TypeScript for campus project?"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

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
                  Detailed Discussion Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Elaborate on your question or project proposal..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="React, Frontend, WebDev"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

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
                  {isSubmitting ? 'Posting...' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
