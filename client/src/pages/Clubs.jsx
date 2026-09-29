import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Compass,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';

export default function Clubs() {
  const { user, isAdmin } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New club proposal form
  const [formData, setFormData] = useState({
    name: '',
    category: 'Technology',
    description: '',
    mission: '',
    meetingSchedule: 'Every Wednesday at 5:00 PM',
    venueOrRoom: 'Student Activity Center',
    logo: '',
    bannerImage: '',
  });

  const categories = [
    'All',
    'Technology',
    'Cultural',
    'Sports',
    'Academic',
    'Arts & Media',
    'Social Welfare',
    'Entrepreneurship',
  ];

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clubs', {
        params: {
          category: category !== 'All' ? category : undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setClubs(res.data.clubs);
      }
    } catch (err) {
      console.error('Failed to load clubs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClubs();
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/clubs', formData);
      if (res.data.success) {
        alert(res.data.message || 'Club registered successfully!');
        setShowCreateModal(false);
        setFormData({
          name: '',
          category: 'Technology',
          description: '',
          mission: '',
          meetingSchedule: 'Every Wednesday at 5:00 PM',
          venueOrRoom: 'Student Activity Center',
          logo: '',
          bannerImage: '',
        });
        fetchClubs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit club');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Student Clubs & Organizations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover student communities, lead initiatives, attend workshops, and collaborate
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Start New Club
          </button>
        )}
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search clubs by name, category, or interests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </form>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading clubs...</p>
        </div>
      ) : clubs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Clubs Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try selecting a different category or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => {
            const isMember = user && club.members?.some((m) => m.user?._id === user._id || m.user === user._id);
            const isLead = user && (club.lead?._id === user._id || club.lead === user._id);

            return (
              <div
                key={club._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-300 transition flex flex-col justify-between group"
              >
                {/* Banner Header */}
                <div className="h-32 w-full bg-slate-100 relative overflow-hidden">
                  <img
                    src={club.bannerImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-xs">
                    {club.category}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Club logo avatar */}
                    <div className="-mt-12 mb-3 relative">
                      <img
                        src={club.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${club.name}`}
                        alt={club.name}
                        className="w-14 h-14 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                      />
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-1">
                      {club.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {club.description}
                    </p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{club.meetingSchedule || 'Weekly sessions'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Lead: {club.lead?.name || 'Student Lead'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      {club.members?.length || 1} Members
                    </span>

                    <div className="flex items-center gap-2">
                      {isLead ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                          Lead
                        </span>
                      ) : isMember ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Joined
                        </span>
                      ) : null}

                      <Link
                        to={`/clubs/${club._id}`}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                      >
                        Enter Hub <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Start New Club Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Found a New Campus Club</h3>
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
                  Club / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Artificial Intelligence Research Club"
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
                  Club Mission & Purpose *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the club vision, activities, who should join, and upcoming plans..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Meeting Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.meetingSchedule}
                    onChange={(e) => setFormData({ ...formData, meetingSchedule: e.target.value })}
                    placeholder="e.g. Every Friday at 5:00 PM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Venue or Lab
                  </label>
                  <input
                    type="text"
                    value={formData.venueOrRoom}
                    onChange={(e) => setFormData({ ...formData, venueOrRoom: e.target.value })}
                    placeholder="Room 204, IT Block"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
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
                  {isSubmitting ? 'Registering...' : 'Register Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
