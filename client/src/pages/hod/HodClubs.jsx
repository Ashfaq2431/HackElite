import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Clock, Plus, X, ArrowRight, Shield, Award } from 'lucide-react';

export default function HodClubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Technical',
    description: '',
    meetingSchedule: 'Wednesdays 4:00 PM',
    facultyInCharge: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clubsRes, facultyRes] = await Promise.all([
        api.get('/clubs'),
        api.get('/auth/department/faculty').catch(() => ({ data: { faculty: [] } })),
      ]);

      if (clubsRes.data.success) {
        setClubs(clubsRes.data.clubs);
      }

      if (facultyRes.data?.success && facultyRes.data.faculty) {
        setFacultyList(facultyRes.data.faculty);
        if (facultyRes.data.faculty.length > 0) {
          setFormData((prev) => ({ ...prev, facultyInCharge: facultyRes.data.faculty[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load clubs or faculty', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!formData.facultyInCharge) {
      alert('Please select and assign a Faculty-in-Charge for this club.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        meetingSchedule: formData.meetingSchedule,
        facultyInCharge: formData.facultyInCharge,
        department: user?.department || 'Computer Science & Engineering',
      };

      const res = await api.post('/clubs', payload);
      if (res.data.success) {
        alert('New club successfully created and Faculty-in-Charge assigned!');
        setShowCreateModal(false);
        setFormData({
          name: '',
          category: 'Technical',
          description: '',
          meetingSchedule: 'Wednesdays 4:00 PM',
          facultyInCharge: facultyList[0]?._id || '',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create club');
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
            <Users className="w-6 h-6 text-amber-600" /> Department Student Organizations & Clubs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Charter new departmental student societies and assign designated Faculty-in-Charge coordinators
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Create New Club
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading department clubs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div
              key={club._id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-amber-300 transition flex flex-col justify-between"
            >
              <div className="h-32 w-full bg-slate-900 relative">
                <img
                  src={club.bannerImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                  alt={club.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700">
                  {club.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="-mt-12 mb-3 relative">
                    <img
                      src={club.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${club.name}`}
                      alt={club.name}
                      className="w-14 h-14 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                    />
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1">{club.name}</h3>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">{club.description}</p>

                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg font-medium">
                      <Shield className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        Faculty-in-Charge: {club.facultyInCharge?.name || 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{club.meetingSchedule || 'Weekly sessions'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">{club.members?.length || 1} Members</span>
                  <Link
                    to={`/clubs/${club._id}`}
                    className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 font-bold rounded-xl text-xs transition flex items-center gap-1"
                  >
                    Club Overview <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Club Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create New Student Club</h3>
                <p className="text-xs text-slate-500">Charter club and assign designated Faculty-in-Charge</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Club Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Artificial Intelligence & Robotics Society"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              {/* Assign Faculty In Charge Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Assign Faculty-in-Charge *
                </label>
                {facultyList.length > 0 ? (
                  <select
                    required
                    value={formData.facultyInCharge}
                    onChange={(e) => setFormData({ ...formData, facultyInCharge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-600 font-medium"
                  >
                    {facultyList.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    No faculty found in {user?.department || 'this department'}.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-600"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                    <option value="Social Service">Social Service</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Meeting Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.meetingSchedule}
                    onChange={(e) => setFormData({ ...formData, meetingSchedule: e.target.value })}
                    placeholder="e.g. Fridays 3:30 PM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Club Mission & Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline the club's objectives, focus areas, and activities..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-600 focus:bg-white"
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
                  disabled={isSubmitting || facultyList.length === 0}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Club...' : 'Charter Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
