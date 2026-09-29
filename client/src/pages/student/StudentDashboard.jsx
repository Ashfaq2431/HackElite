import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Calendar,
  Users,
  Megaphone,
  Bell,
  Award,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  Ticket,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const [evRes, annRes, clubRes, notifRes] = await Promise.all([
          api.get('/events?filter=upcoming'),
          api.get('/announcements'),
          api.get('/clubs'),
          api.get('/notifications'),
        ]);

        if (evRes.data.success) {
          const allEv = evRes.data.events;
          // Events where user is registered
          const myEv = allEv.filter((e) =>
            e.registeredUsers?.some((r) => (r.user?._id === user?._id || r.user === user?._id) && r.status !== 'cancelled')
          );
          // Recommended: upcoming events not yet registered for
          const recEv = allEv.filter(
            (e) => !e.registeredUsers?.some((r) => (r.user?._id === user?._id || r.user === user?._id) && r.status !== 'cancelled')
          );
          setUpcomingEvents(myEv);
          setRecommendedEvents(recEv.slice(0, 3));
        }

        if (annRes.data.success) {
          setAnnouncements(annRes.data.announcements.slice(0, 4));
        }

        if (clubRes.data.success) {
          const userClubs = clubRes.data.clubs.filter((c) =>
            c.members?.some((m) => m.user?._id === user?._id || m.user === user?._id)
          );
          setMyClubs(userClubs);
        }

        if (notifRes.data.success) {
          setNotifications(notifRes.data.notifications.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading student dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Welcome / Profile Summary Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/30 bg-white"
            />
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-indigo-100 text-[11px] font-bold mb-1">
                <Sparkles className="w-3 h-3" /> Student Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-indigo-100 mt-1">
                {user?.department} • {user?.year} • Roll: {user?.studentId || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/profile"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition"
            >
              Edit Profile
            </Link>
            <Link
              to="/student/events"
              className="px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-md transition"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Participation Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{upcomingEvents.length}</p>
            <p className="text-xs text-slate-500 font-medium">My Event Passes</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{myClubs.length}</p>
            <p className="text-xs text-slate-500 font-medium">Joined Clubs</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{user?.achievements?.length || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Honors Recorded</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{user?.skills?.length || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Profile Skills</p>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Registered Events & Recommended Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upcoming Registered Events (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> My Upcoming Event Passes
            </h2>
            <Link to="/student/events" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold text-slate-600">You haven't registered for any upcoming events.</p>
                <Link to="/student/events" className="text-xs text-indigo-600 font-bold mt-2 inline-block">
                  Discover Events & Get Passes
                </Link>
              </div>
            ) : (
              upcomingEvents.map((ev) => {
                const reg = ev.registeredUsers?.find(
                  (r) => (r.user?._id === user?._id || r.user === user?._id) && r.status !== 'cancelled'
                );
                return (
                  <div
                    key={ev._id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 transition shadow-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] uppercase font-black text-indigo-600">
                          {new Date(ev.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-base font-black text-slate-900 leading-none">
                          {new Date(ev.date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{ev.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{ev.startTime}</span> • <span className="truncate">{ev.venue}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md block mb-1">
                        {reg?.ticketId || 'PASS'}
                      </span>
                      <Link
                        to={`/events/${ev._id}`}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        Pass →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Recommended Events for You (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Recommended For You
            </h2>
            <Link to="/student/events" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Explore →
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                <p className="text-xs">No new event recommendations right now.</p>
              </div>
            ) : (
              recommendedEvents.map((ev) => (
                <div
                  key={ev._id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 transition shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {ev.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 truncate mt-0.5">{ev.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{ev.venue} • {ev.startTime}</p>
                  </div>
                  <Link
                    to={`/events/${ev._id}`}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold transition shrink-0"
                  >
                    RSVP
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
