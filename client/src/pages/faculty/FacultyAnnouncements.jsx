import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, Plus, Search, Pin, Trash2, X, Paperclip, UploadCloud, FileText } from 'lucide-react';

export default function FacultyAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Academic',
    priority: 'Normal',
    targetAudience: 'Students', // 'Students' or 'Club Members Only'
    club: '',
    isPinned: false,
    attachment: null, // { title, url, fileType, size }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, clubsRes] = await Promise.all([
        api.get('/announcements', { params: { department: user?.department } }),
        api.get('/clubs'),
      ]);

      if (annRes.data.success) {
        setAnnouncements(annRes.data.announcements);
      }

      if (clubsRes.data.success) {
        const assigned = clubsRes.data.clubs.filter(
          (c) => c.facultyInCharge?._id === user?._id || c.facultyInCharge === user?._id
        );
        setMyClubs(assigned);
        if (assigned.length > 0) {
          setFormData((prev) => ({ ...prev, club: assigned[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 15MB
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds the 15MB limit.');
      return;
    }

    const data = new FormData();
    data.append('file', file);

    setUploadingFile(true);
    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFormData((prev) => ({
          ...prev,
          attachment: {
            title: res.data.file.originalName || file.name,
            url: res.data.file.url,
            fileType: res.data.file.mimetype,
            size: res.data.file.size,
          },
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploadingFile(false);
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
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        club: formData.targetAudience === 'Club Members Only' ? formData.club : undefined,
        department: user?.department,
        isPinned: formData.isPinned,
        attachments: formData.attachment
          ? [
              {
                title: formData.attachment.title,
                url: formData.attachment.url,
                fileType: formData.attachment.fileType,
              },
            ]
          : [],
      };

      const res = await api.post('/announcements', payload);
      if (res.data.success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          content: '',
          category: 'Academic',
          priority: 'Normal',
          targetAudience: 'Students',
          club: myClubs[0]?._id || '',
          isPinned: false,
          attachment: null,
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this circular?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchData();
    } catch {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-600" /> Faculty Notice Board & Circulars
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish academic circulars, club updates, and upload official documentation for students
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Issue Circular
        </button>
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading department notices...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-slate-700">No Circulars Published</h3>
          <p className="text-xs mt-1">Click "Issue Circular" to publish guidelines for your students or club members.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const isAuthor = ann.author?._id === user?._id;
            return (
              <div
                key={ann._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                      {ann.category}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        ann.targetAudience === 'Club Members Only'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Audience:{' '}
                      {ann.targetAudience === 'Club Members Only'
                        ? '🔒 Club Members Only'
                        : ann.targetAudience === 'Students'
                        ? '👥 All Department Students'
                        : ann.targetAudience}
                    </span>
                    {ann.club && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-800">
                        {ann.club.name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{ann.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>

                {/* File Attachments Download */}
                {ann.attachments && ann.attachments.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {ann.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-semibold transition"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{att.title || 'Attached Document'}</span>
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>Author: {ann.author?.name} ({ann.department})</span>
                  {isAuthor && (
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Delete notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">Issue Department Notice / Circular</h3>
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
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Schedule for External Practicals / Club Meetup"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* Target Audience: All Students vs Club Members Only */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Audience *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, targetAudience: 'Students' })}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                      formData.targetAudience === 'Students'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">All Students</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">Publish to all students in department</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, targetAudience: 'Club Members Only' })}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                      formData.targetAudience === 'Club Members Only'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">Club Members Only</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">Restrict notice to your club members</div>
                  </button>
                </div>
              </div>

              {/* Club Dropdown if Club Members Only */}
              {formData.targetAudience === 'Club Members Only' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Your Club *
                  </label>
                  {myClubs.length > 0 ? (
                    <select
                      value={formData.club}
                      onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 font-medium"
                    >
                      {myClubs.map((club) => (
                        <option key={club._id} value={club._id}>
                          {club.name} ({club.category})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      You are not assigned as Faculty-in-Charge to any club.
                    </p>
                  )}
                </div>
              )}

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
                    <option value="Academic">Academic</option>
                    <option value="Event">Event</option>
                    <option value="Placement & Career">Placement & Career</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notice Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Provide instructions, timelines, details, and guidelines..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* File Attachment Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Attach File / Circular Document (PDF, DOCX, Images, ZIP up to 15MB)
                </label>

                {formData.attachment ? (
                  <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-indigo-950 font-medium truncate">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="truncate">{formData.attachment.title}</span>
                      {formData.attachment.size && (
                        <span className="text-slate-400">({formData.attachment.size})</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, attachment: null })}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg ml-2"
                      title="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl cursor-pointer bg-slate-50 hover:bg-indigo-50/50 transition">
                    <UploadCloud className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-medium text-slate-600">
                      {uploadingFile ? 'Uploading document...' : 'Click to select and upload document'}
                    </span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </label>
                )}
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
                  disabled={isSubmitting || uploadingFile}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Circular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
