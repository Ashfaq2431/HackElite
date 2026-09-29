import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  Eye,
  Trash2,
  Send,
  ArrowLeft,
  Sparkles,
  Tag,
} from 'lucide-react';

export default function DiscussionDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDiscussion = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/discussions/${id}`);
      if (res.data.success) {
        setDiscussion(res.data.discussion);
      }
    } catch (err) {
      console.error('Failed to load discussion', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading conversation...</p>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <h3 className="text-lg font-bold text-slate-800">Discussion Not Found</h3>
        <Link to="/discussions" className="text-sm text-indigo-600 font-semibold mt-2 inline-block">
          ← Back to Forum
        </Link>
      </div>
    );
  }

  const isThreadAuthor = user && (discussion.author?._id === user._id || discussion.author === user._id);
  const hasUpvoted = user && discussion.upvotes?.includes(user._id);

  const handleUpvoteThread = async () => {
    if (!user) {
      alert('Please log in to upvote');
      return;
    }
    try {
      const res = await api.post(`/discussions/${id}/upvote`);
      if (res.data.success) {
        fetchDiscussion();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to reply');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post(`/discussions/${id}/replies`, { content: replyContent });
      if (res.data.success) {
        setReplyContent('');
        setDiscussion(res.data.discussion);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (replyId) => {
    try {
      await api.put(`/discussions/${id}/replies/${replyId}/accept`);
      fetchDiscussion();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark accepted solution');
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!window.confirm('Are you sure you want to delete this discussion?')) return;
    try {
      await api.delete(`/discussions/${id}`);
      window.location.href = '/discussions';
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <div>
        <Link
          to="/discussions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Discussions
        </Link>
      </div>

      {/* Main Discussion Thread Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              {discussion.category}
            </span>
            <span className="text-xs text-slate-400">
              Posted on {new Date(discussion.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {discussion.views} views
            </span>
            {(isThreadAuthor || isAdmin) && (
              <button
                onClick={handleDeleteDiscussion}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                title="Delete thread"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {discussion.title}
        </h1>

        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-1">
          {discussion.content}
        </div>

        {/* Tags */}
        {discussion.tags && discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {discussion.tags.map((tag, idx) => (
              <span key={idx} className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Thread Author and Upvote Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={discussion.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${discussion.author?.name}`}
              alt={discussion.author?.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <p className="text-xs font-bold text-slate-900">{discussion.author?.name}</p>
              <p className="text-[11px] text-slate-400">{discussion.author?.department} • {discussion.author?.role}</p>
            </div>
          </div>

          <button
            onClick={handleUpvoteThread}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${
              hasUpvoted
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{hasUpvoted ? 'Upvoted' : 'Upvote'} ({discussion.upvotes?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Replies Header */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Answers & Discussion ({discussion.replies?.length || 0})
        </h3>
      </div>

      {/* Reply Composer */}
      {user ? (
        <form onSubmit={handleReplySubmit} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Share your answer or insight
          </label>
          <textarea
            required
            rows={3}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a constructive and helpful reply..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !replyContent.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Post Reply
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center text-xs text-slate-500">
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Sign in
          </Link>{' '}
          to participate in this campus discussion.
        </div>
      )}

      {/* Replies List */}
      <div className="space-y-4">
        {discussion.replies?.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No replies yet. Be the first to share an answer!</p>
        ) : (
          discussion.replies.map((reply) => (
            <div
              key={reply._id}
              className={`p-5 rounded-3xl border transition ${
                reply.isAcceptedAnswer
                  ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Accepted badge banner */}
              {reply.isAcceptedAnswer && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-3">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Accepted Solution by Author
                </div>
              )}

              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                {reply.content}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2.5">
                  <img
                    src={reply.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author?.name || 'Reply'}`}
                    alt={reply.author?.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-bold text-slate-900">{reply.author?.name || 'Peer'}</span>
                    <span className="text-slate-400 ml-1.5">
                      • {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Mark as Accepted button for question author */}
                {(isThreadAuthor || isAdmin) && (
                  <button
                    onClick={() => handleAcceptAnswer(reply._id)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 ${
                      reply.isAcceptedAnswer
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {reply.isAcceptedAnswer ? 'Accepted' : 'Mark as Solution'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
