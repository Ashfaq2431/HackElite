import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FolderDown,
  Search,
  Plus,
  Download,
  FileText,
  Trash2,
  X,
  FileCheck,
  Calendar,
  Share2,
} from 'lucide-react';

export default function Resources() {
  const { user, isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New resource form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Study Materials',
    department: 'Computer Science & Engineering',
    fileUrl: '',
    fileName: '',
    fileSize: '2.5 MB',
  });

  const categories = [
    'All',
    'Study Materials',
    'Club Handbooks',
    'Campus Maps & Guides',
    'Placement Papers',
    'Event Posters',
    'Forms & Circulars',
  ];

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resources', {
        params: {
          category: category !== 'All' ? category : undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleDownload = async (resource) => {
    try {
      await api.post(`/resources/${resource._id}/download`);
      // Update download count locally
      setResources((prev) =>
        prev.map((r) => (r._id === resource._id ? { ...r, downloads: (r.downloads || 0) + 1 } : r))
      );
      window.open(resource.fileUrl, '_blank');
    } catch (err) {
      console.error(err);
      window.open(resource.fileUrl, '_blank');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shared resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/resources', formData);
      if (res.data.success) {
        setShowUploadModal(false);
        setFormData({
          title: '',
          description: '',
          category: 'Study Materials',
          department: 'Computer Science & Engineering',
          fileUrl: '',
          fileName: '',
          fileSize: '2.5 MB',
        });
        fetchResources();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to share file');
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
            <FolderDown className="w-6 h-6 text-indigo-600" /> Content & Resource Repository
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized document hub for academic syllabi, past papers, club handbooks, and campus guides
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Share Document
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search documents by title or topic..."
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
        </div>
      </div>

      {/* Resource Cards */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Resources Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try another category or upload the first document!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => {
            const isUploader = user && (res.uploadedBy?._id === user._id || res.uploadedBy === user._id);
            const canDelete = isUploader || isAdmin;

            return (
              <div
                key={res._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {res.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{res.fileSize}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-2">
                    {res.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Uploaded by {res.uploadedBy?.name || 'Faculty / Peer'}</span>
                    <span className="text-slate-400">{res.downloads} downloads</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {canDelete ? (
                    <button
                      onClick={() => handleDelete(res._id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">PDF Document</span>
                  )}

                  <button
                    onClick={() => handleDownload(res)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <FolderDown className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Share Campus Resource</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Operating Systems Lecture Notes & Cheatsheet"
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
                  Description / Topic Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Include what topics are covered, course codes, syllabus version, etc..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  File Document URL / Cloud Link *
                </label>
                <input
                  type="url"
                  required
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://.../notes.pdf"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    placeholder="OS_Unit1_Notes.pdf"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Approx Size
                  </label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    placeholder="2.4 MB"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Sharing...' : 'Share Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
