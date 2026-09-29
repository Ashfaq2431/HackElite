import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  Users,
  Calendar,
  Megaphone,
  BarChart3,
  CheckCircle,
  Clock,
  Shield,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function HodDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHodData = async () => {
      try {
        setLoading(true);
        const [statRes, stuRes, facRes, evRes] = await Promise.all([
          api.get(`/analytics?department=${user?.department}`),
          api.get('/auth/department/students'),
          api.get('/auth/department/faculty'),
          api.get(`/events?department=${user?.department}`),
        ]);

        if (statRes.data.success) setAnalytics(statRes.data);
        if (stuRes.data.success) setStudents(stuRes.data.students);
        if (facRes.data.success) setFaculty(facRes.data.faculty);
        if (evRes.data.success) setEvents(evRes.data.events);
      } catch (err) {
        console.error('Failed to load HOD dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHodData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading department oversight console...</p>
      </div>
    );
  }

  const pendingEvents = events.filter((e) => e.approvalStatus === 'pending_approval');

  return (
    <div className="space-y-8">
      {/* 1. Department Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-amber-600 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/30 bg-white"
            />
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-amber-100 text-[11px] font-bold mb-1">
                <Shield className="w-3.5 h-3.5" /> Head of Department (HOD)
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.name}
              </h1>
              <p className="text-xs text-amber-100 mt-1 font-semibold">
                Department: {user?.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/hod/announcements"
              className="px-4 py-2 bg-white text-amber-800 hover:bg-amber-50 rounded-xl text-xs font-bold shadow-md transition"
            >
              Issue Notice
            </Link>
            <Link
              to="/hod/analytics"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Department Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Department Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{students.length}</p>
            <p className="text-xs text-slate-500 font-medium">Enrolled Students</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{faculty.length}</p>
            <p className="text-xs text-slate-500 font-medium">Department Faculty</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{events.length}</p>
            <p className="text-xs text-slate-500 font-medium">Department Events</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{analytics?.stats?.totalRegistrations || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Event Registrations</p>
          </div>
        </div>
      </div>

      {/* 3. Pending Event Approvals Alert (if any) */}
      {pendingEvents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
              ⚠️
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {pendingEvents.length} Event(s) Awaiting HOD Approval
              </h4>
              <p className="text-xs text-amber-700">Review scheduled department events before publication</p>
            </div>
          </div>
          <Link
            to="/hod/events"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* 4. Grid: Department Students & Department Faculty */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Department Students (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Department Scholars ({students.length})
            </h2>
            <Link to="/hod/students" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Manage Students →
            </Link>
          </div>

          <div className="space-y-3">
            {students.slice(0, 4).map((stu) => (
              <div
                key={stu._id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={stu.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stu.name}`}
                    alt={stu.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{stu.name}</h4>
                    <p className="text-[11px] text-slate-400">{stu.year} • Roll: {stu.studentId || 'N/A'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {stu.joinedClubs?.length || 0} Clubs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Faculty (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" /> Department Faculty Roster ({faculty.length})
            </h2>
            <Link to="/hod/faculty" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View Faculty →
            </Link>
          </div>

          <div className="space-y-3">
            {faculty.slice(0, 4).map((fac) => (
              <div
                key={fac._id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={fac.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fac.name}`}
                    alt={fac.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{fac.name}</h4>
                    <p className="text-[11px] text-slate-400">{fac.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                  Faculty
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
