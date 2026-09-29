import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  GraduationCap,
  Hash,
  Edit3,
  Award,
  Sparkles,
  Code2,
  Briefcase,
  Globe,
  Plus,
  Trash2,
  X,
  Check,
  Shield,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    name: '',
    department: '',
    year: '',
    studentId: '',
    bio: '',
    skills: '',
    interests: '',
    phone: '',
    github: '',
    linkedin: '',
    portfolio: '',
  });

  // New achievement state
  const [newAchievement, setNewAchievement] = useState({ title: '', date: '', description: '' });
  const [showAddAchievement, setShowAddAchievement] = useState(false);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setProfile(res.data.user);
          setEditData({
            name: res.data.user.name || '',
            department: res.data.user.department || '',
            year: res.data.user.year || '',
            studentId: res.data.user.studentId || '',
            bio: res.data.user.bio || '',
            skills: res.data.user.skills ? res.data.user.skills.join(', ') : '',
            interests: res.data.user.interests ? res.data.user.interests.join(', ') : '',
            phone: res.data.user.phone || '',
            github: res.data.user.socialLinks?.github || '',
            linkedin: res.data.user.socialLinks?.linkedin || '',
            portfolio: res.data.user.socialLinks?.portfolio || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };

    fetchLatestProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: editData.name,
        department: editData.department,
        year: editData.year,
        studentId: editData.studentId,
        bio: editData.bio,
        phone: editData.phone,
        skills: editData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: editData.interests.split(',').map((i) => i.trim()).filter(Boolean),
        socialLinks: {
          github: editData.github,
          linkedin: editData.linkedin,
          portfolio: editData.portfolio,
        },
      };

      const updated = await updateProfile(payload);
      setProfile(updated);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    if (!newAchievement.title) return;
    try {
      const currentAchievements = profile.achievements || [];
      const updatedAchievements = [...currentAchievements, newAchievement];
      const updated = await updateProfile({ achievements: updatedAchievements });
      setProfile(updated);
      setNewAchievement({ title: '', date: '', description: '' });
      setShowAddAchievement(false);
    } catch (err) {
      alert('Failed to add achievement');
    }
  };

  if (!profile) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
              alt={profile.name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-500/20 shadow-md"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{profile.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>{profile.department} • {profile.year}</span>
              </p>
              {profile.studentId && (
                <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                  <Hash className="w-3.5 h-3.5" /> ID: {profile.studentId}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 self-center sm:self-start"
          >
            <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About Me</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {profile.bio || 'No bio written yet. Click Edit Profile to introduce yourself to campus!'}
          </p>
        </div>

        {/* Social / Portfolio links */}
        {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
            {profile.socialLinks.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-medium text-slate-700 hover:text-indigo-600 border border-slate-200 transition"
              >
                <Code2 className="w-3.5 h-3.5" /> GitHub
              </a>
            )}
            {profile.socialLinks.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-medium text-slate-700 hover:text-indigo-600 border border-slate-200 transition"
              >
                <Briefcase className="w-3.5 h-3.5" /> LinkedIn
              </a>
            )}
            {profile.socialLinks.portfolio && (
              <a
                href={profile.socialLinks.portfolio}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-medium text-slate-700 hover:text-indigo-600 border border-slate-200 transition"
              >
                <Globe className="w-3.5 h-3.5" /> Portfolio
              </a>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Form Drawer */}
      {isEditing && (
        <form onSubmit={handleUpdate} className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-200 shadow-sm space-y-4 animate-slide-up">
          <h3 className="text-base font-bold text-slate-900 mb-2">Edit Your Profile</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Student / Roll ID</label>
              <input
                type="text"
                value={editData.studentId}
                onChange={(e) => setEditData({ ...editData, studentId: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Department</label>
              <input
                type="text"
                value={editData.department}
                onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Year</label>
              <input
                type="text"
                value={editData.year}
                onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Bio</label>
            <textarea
              rows={3}
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Skills (comma separated)</label>
              <input
                type="text"
                value={editData.skills}
                onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                placeholder="React, Python, Figma"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Interests (comma separated)</label>
              <input
                type="text"
                value={editData.interests}
                onChange={(e) => setEditData({ ...editData, interests: e.target.value })}
                placeholder="Robotics, AI, Music"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">GitHub URL</label>
              <input
                type="url"
                value={editData.github}
                onChange={(e) => setEditData({ ...editData, github: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={editData.linkedin}
                onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Portfolio / Website</label>
              <input
                type="url"
                value={editData.portfolio}
                onChange={(e) => setEditData({ ...editData, portfolio: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}

      {/* Skills & Interests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
            Technical & Soft Skills
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100/80"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400">No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
            Interests & Extracurriculars
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {profile.interests && profile.interests.length > 0 ? (
              profile.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100/80"
                >
                  {interest}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400">No interests added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Achievements Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Student Honors & Achievements</h3>
          </div>
          <button
            onClick={() => setShowAddAchievement(!showAddAchievement)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Honor
          </button>
        </div>

        {showAddAchievement && (
          <form onSubmit={handleAddAchievement} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Achievement Title (e.g. 1st Place Hackathon)"
                value={newAchievement.title}
                onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
              <input
                type="text"
                placeholder="Date (e.g. Nov 2025)"
                value={newAchievement.date}
                onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Brief description of the accomplishment..."
              value={newAchievement.description}
              onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-600"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddAchievement(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {profile.achievements && profile.achievements.length > 0 ? (
            profile.achievements.map((ach, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{ach.title}</h4>
                    {ach.date && <span className="text-xs text-slate-400">({ach.date})</span>}
                  </div>
                  {ach.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ach.description}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No achievements recorded yet. Showcase your campus victories!</p>
          )}
        </div>
      </div>

      {/* Joined Clubs */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Enrolled Student Clubs ({profile.joinedClubs?.length || 0})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {profile.joinedClubs && profile.joinedClubs.length > 0 ? (
            profile.joinedClubs.map((club) => (
              <Link
                key={club._id || club}
                to={`/clubs/${club._id || club}`}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition group"
              >
                <img
                  src={club.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${club.name || 'Club'}`}
                  alt={club.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                    {club.name || 'Campus Club'}
                  </p>
                  <p className="text-[11px] text-slate-500">{club.category || 'Society'}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-400">Not a member of any clubs yet. Explore and join clubs!</p>
          )}
        </div>
      </div>
    </div>
  );
}
