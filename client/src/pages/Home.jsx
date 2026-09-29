import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Calendar,
  Megaphone,
  Users,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Tag,
  Download,
  Award,
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [annRes, evRes, clubRes, discRes, statRes] = await Promise.all([
          api.get('/announcements'),
          api.get('/events?filter=upcoming'),
          api.get('/clubs'),
          api.get('/discussions'),
          api.get('/analytics'),
        ]);

        if (annRes.data.success) setAnnouncements(annRes.data.announcements.slice(0, 3));
        if (evRes.data.success) setEvents(evRes.data.events.slice(0, 3));
        if (clubRes.data.success) setClubs(clubRes.data.clubs.slice(0, 4));
        if (discRes.data.success) setDiscussions(discRes.data.discussions.slice(0, 4));
        if (statRes.data.success) setStats(statRes.data.stats);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Connecting to campus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-indigo-100 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> University Digital Campus Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Welcome back, {user ? user.name.split(' ')[0] : 'Scholar'}!
          </h1>
          <p className="mt-3 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Stay in sync with all college happenings, discover exciting student clubs, register for hackathons and workshops, and participate in peer discussions.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/events"
              className="px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold rounded-xl text-sm shadow-md transition flex items-center gap-2"
            >
              Explore Events <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/clubs"
              className="px-5 py-2.5 bg-indigo-900/40 hover:bg-indigo-900/60 border border-white/20 text-white font-semibold rounded-xl text-sm backdrop-blur-sm transition flex items-center gap-2"
            >
              Browse Clubs
            </Link>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-purple-500/30 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalStudents || 0}</p>
              <p className="text-xs text-slate-500 font-medium">Students Enrolled</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalClubs || 0}</p>
              <p className="text-xs text-slate-500 font-medium">Active Clubs</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalEvents || 0}</p>
              <p className="text-xs text-slate-500 font-medium">Campus Events</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalRegistrations || 0}</p>
              <p className="text-xs text-slate-500 font-medium">Event RSVPs</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Pinned Announcements & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Announcements (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Latest Campus Notices</h2>
            </div>
            <Link to="/announcements" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-400">No active announcements at the moment.</p>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 transition shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        ann.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : ann.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {ann.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">{ann.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span className="font-medium">By {ann.author?.name || 'Academic Admin'}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-slate-600">{ann.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Events (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Upcoming Events</h2>
            </div>
            <Link to="/events" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              All Events <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-sm text-slate-400">No upcoming events found.</p>
            ) : (
              events.map((ev) => (
                <Link
                  key={ev._id}
                  to={`/events/${ev._id}`}
                  className="block bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-indigo-300 transition group"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs uppercase font-extrabold text-indigo-600">
                        {new Date(ev.date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {new Date(ev.date).getDate()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
                        {ev.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition truncate">
                        {ev.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {ev.startTime}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3" /> {ev.venue}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Featured Clubs Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Discover College Clubs & Societies</h2>
          </div>
          <Link to="/clubs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            Browse All ({clubs.length}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clubs.map((club) => (
            <Link
              key={club._id}
              to={`/clubs/${club._id}`}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={club.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${club.name}`}
                    alt={club.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition truncate">
                      {club.name}
                    </h3>
                    <span className="text-xs font-medium text-slate-500">{club.category}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {club.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>{club.members?.length || 1} Members</span>
                <span className="font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Community Discussions Preview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Trending Discussions</h2>
          </div>
          <Link to="/discussions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            Join Forum <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {discussions.map((d) => (
            <Link
              key={d._id}
              to={`/discussions/${d._id}`}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 transition shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    {d.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    by {d.author?.name}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition line-clamp-2 mb-2">
                  {d.title}
                </h4>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>▲ {d.upvotes?.length || 0} Upvotes</span>
                <span>💬 {d.replies?.length || 0} Replies</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
