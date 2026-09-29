import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, Plus, Trash2, X, Pin, Paperclip, UploadCloud, FileText } from 'lucide-react';

export default function HodAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Academic',
    priority: 'Normal',
    targetAudience: 'All',
    isPinned: true,
    attachment: null,
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements', {
        params: { department: user?.department },
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
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
          targetAudience: 'All',
          isPinned: true,
          attachment: null,
        });
        fetchAnnouncements();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this circular?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
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
            <Megaphone className="w-6 h-6 text-amber-600" /> {user?.department} – Official Circulars
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative departmental circulars and official documentation issued by the Head of Department
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Issue HOD Circular
        </button>
      </div>

      {/* Notices */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading notices...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-slate-700">No Circulars Issued</h3>
          <p className="text-xs mt-1">Click "Issue HOD Circular" to publish notices for students and faculty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs space-y-3 ${
                ann.isPinned ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {ann.isPinned && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-amber-700" /> Pinned HOD Notice
                    </span>
                  )}
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {ann.category} • {ann.priority}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700">
                    Audience: {ann.targetAudience}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{ann.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>

              {/* Attachments List */}
              {ann.attachments && ann.attachments.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {ann.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-800 rounded-xl text-xs font-semibold transition"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                      <span>{att.title || 'Attached Circular Document'}</span>
                    </a>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>Issued by HOD: {ann.author?.name} ({ann.department})</span>
                <button
                  onClick={() => handleDelete(ann._id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                  title="Delete circular"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">Issue Official HOD Circular</h3>
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
                  Circular Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mandatory End-Semester Laboratory Viva Schedule"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-600"
                  >
                    <option value="All">All in Department</option>
                    <option value="Students">Department Students Only</option>
                    <option value="Faculty">Department Faculty Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-600"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Circular Directives & Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed instructions, deadlines, regulations..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              {/* Upload File Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Upload Attachment (PDF, DOCX, ZIP, Images up to 15MB)
                </label>

                {formData.attachment ? (
                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-amber-950 font-medium truncate">
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
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
                  <label className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl cursor-pointer bg-slate-50 hover:bg-amber-50/50 transition">
                    <UploadCloud className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-slate-600">
                      {uploadingFile ? 'Uploading file...' : 'Click to select and attach document'}
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
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Issuing...' : 'Publish Circular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
