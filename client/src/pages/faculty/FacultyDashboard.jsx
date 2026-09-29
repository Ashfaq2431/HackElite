import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Calendar,
  Users,
  Megaphone,
  Bell,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle,
  Plus,
} from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        const [stuRes, evRes, annRes, notifRes] = await Promise.all([
          api.get('/auth/department/students'),
          api.get(`/events?department=${user?.department}`),
          api.get(`/announcements?department=${user?.department}`),
          api.get('/notifications'),
        ]);

        if (stuRes.data.success) setStudents(stuRes.data.students);
        if (evRes.data.success) setEvents(evRes.data.events);
        if (annRes.data.success) setAnnouncements(annRes.data.announcements.slice(0, 4));
        if (notifRes.data.success) setNotifications(notifRes.data.notifications.slice(0, 4));
      } catch (err) {
        console.error('Failed to load faculty dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading faculty workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Welcome & Department Summary Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-700 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/30 bg-white"
            />
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-purple-100 text-[11px] font-bold mb-1">
                <GraduationCap className="w-3.5 h-3.5" /> Faculty Academic Console
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.name}
              </h1>
              <p className="text-xs text-indigo-100 mt-1">
                Department: {user?.department} • ID: {user?.studentId || 'FAC-01'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/faculty/events"
              className="px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Host Event
            </Link>
            <Link
              to="/faculty/announcements"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" /> Publish Notice
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Activity Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{students.length}</p>
            <p className="text-xs text-slate-500 font-medium">Department Students</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{events.length}</p>
            <p className="text-xs text-slate-500 font-medium">Events in Dept</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{announcements.length}</p>
            <p className="text-xs text-slate-500 font-medium">Notices Issued</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">Active</p>
            <p className="text-xs text-slate-500 font-medium">Faculty Standing</p>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Events & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Department Events (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Upcoming Department Events
            </h2>
            <Link to="/faculty/events" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Manage Events →
            </Link>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                <p className="text-xs">No upcoming department events scheduled.</p>
              </div>
            ) : (
              events.slice(0, 3).map((ev) => (
                <div
                  key={ev._id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                      {ev.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 truncate mt-0.5">{ev.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(ev.date).toLocaleDateString()} • {ev.startTime} • {ev.venue}
                    </p>
                  </div>
                  <Link
                    to={`/events/${ev._id}`}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold transition shrink-0"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Announcements (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-600" /> Department Circulars
            </h2>
            <Link to="/faculty/announcements" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Publish Notice →
            </Link>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                <p className="text-xs">No department notices published yet.</p>
              </div>
            ) : (
              announcements.slice(0, 3).map((ann) => (
                <div key={ann._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {ann.category} • {ann.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">{ann.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{ann.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Student Roster Quick Preview */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" /> Department Students ({students.length})
          </h2>
          <Link to="/faculty/students" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
            View Full Student Roster →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {students.slice(0, 6).map((stu) => (
            <div key={stu._id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <img
                src={stu.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stu.name}`}
                alt={stu.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-slate-900 truncate">{stu.name}</h4>
                <p className="text-[11px] text-slate-500">{stu.year} • {stu.studentId || 'No ID'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
