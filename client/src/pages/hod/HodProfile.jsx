import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Mail, Building2, Phone, Save, Edit3, CheckCircle, AlertCircle } from 'lucide-react';

export default function HodProfile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await api.put('/auth/profile', form);
      if (setUser) setUser(res.data.user || { ...user, ...form });
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4" /> Profile updated successfully.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Avatar & Name */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-5">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
          alt={user?.name}
          className="w-20 h-20 rounded-full ring-4 ring-indigo-100 object-cover"
        />
        <div>
          <p className="text-xl font-bold text-slate-900">{user?.name}</p>
          <span className="inline-block mt-1 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">HOD</span>
          <p className="text-sm text-slate-500 mt-1">{user?.department}</p>
        </div>
      </div>

      {/* Info Fields */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Profile Information</h2>

        {/* Name */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <User className="w-3.5 h-3.5" /> Full Name
          </label>
          {editing ? (
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <p className="text-slate-800 font-medium">{user?.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <Mail className="w-3.5 h-3.5" /> Email
          </label>
          <p className="text-slate-800 font-medium">{user?.email}</p>
          <p className="text-xs text-slate-400">Email cannot be changed.</p>
        </div>

        {/* Department */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <Building2 className="w-3.5 h-3.5" /> Department
          </label>
          <p className="text-slate-800 font-medium">{user?.department || '—'}</p>
          <p className="text-xs text-slate-400">Department is assigned by the system.</p>
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <Phone className="w-3.5 h-3.5" /> Phone
          </label>
          {editing ? (
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <p className="text-slate-800 font-medium">{user?.phone || '—'}</p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bio</label>
          {editing ? (
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description about yourself..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          ) : (
            <p className="text-slate-800">{user?.bio || '—'}</p>
          )}
        </div>

        {editing && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => { setEditing(false); setError(null); }}
              className="px-5 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
        <p className="text-sm font-semibold text-violet-900">Role & Permissions</p>
        <p className="text-xs text-violet-700 mt-1">You are the Head of Department for <strong>{user?.department}</strong>. You have department-level oversight including student records, faculty management, event approvals, and announcements.</p>
        <p className="text-xs text-violet-500 mt-2">Role cannot be changed through this interface.</p>
      </div>
    </div>
  );
}
