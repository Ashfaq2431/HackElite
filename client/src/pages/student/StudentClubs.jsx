import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  CheckCircle,
  Clock,
  ArrowRight,
  UserPlus,
} from 'lucide-react';

export default function StudentClubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'joined'

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

  const handleJoin = async (clubId) => {
    try {
      const res = await api.post(`/clubs/${clubId}/join`, { message: 'Interested in actively participating in club events.' });
      alert(res.data.message || 'Membership request submitted!');
      fetchClubs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const joinedClubs = clubs.filter((c) =>
    c.members?.some((m) => m.user?._id === user?._id || m.user === user?._id)
  );

  const displayedClubs = activeTab === 'joined' ? joinedClubs : clubs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> College Clubs & Societies
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse campus organizations, find peer networks, and join student clubs
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Clubs ({clubs.length})
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'joined' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Joined ({joinedClubs.length})
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search clubs by name or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchClubs()}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              Category: {c}
            </option>
          ))}
        </select>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading clubs...</p>
        </div>
      ) : displayedClubs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-slate-700">No Clubs Found</h3>
          <p className="text-xs mt-1">Try another category or search keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedClubs.map((club) => {
            const isMember = club.members?.some((m) => m.user?._id === user?._id || m.user === user?._id);
            const hasPending = club.joinRequests?.some(
              (r) => (r.user?._id === user?._id || r.user === user?._id) && r.status === 'pending'
            );

            return (
              <div
                key={club._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-indigo-300 transition flex flex-col justify-between group"
              >
                <div className="h-32 w-full bg-slate-900 relative overflow-hidden">
                  <img
                    src={club.bannerImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-xs">
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

                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-1">
                      {club.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {club.description}
                    </p>

                    <div className="mt-4 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{club.meetingSchedule || 'Regular weekly meetings'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{club.members?.length || 1} active members</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {isMember ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Member
                      </span>
                    ) : hasPending ? (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold rounded-xl text-xs border border-amber-200">
                        Pending Review
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoin(club._id)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Join Club
                      </button>
                    )}

                    <Link
                      to={`/clubs/${club._id}`}
                      className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                      Hub →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
