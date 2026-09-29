import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users, Calendar, Megaphone, Shield,
  TrendingUp, Award, Clock, ArrowRight,
  Plus, CheckCircle, AlertTriangle
} from 'lucide-react';

function StatCard({ label, value, sub, icon: Icon, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes] = await Promise.all([
          api.get('/analytics'),
          api.get('/auth/users'),
        ]);
        setStats(statsRes.data);
        const allUsers = usersRes.data.users || usersRes.data || [];
        setRecentUsers(allUsers.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const roleBadge = (role) => {
    switch (role) {
      case 'admin': return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-rose-100 text-rose-700">Admin</span>;
      case 'hod': return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-violet-100 text-violet-700">HOD</span>;
      case 'faculty': return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">Faculty</span>;
      default: return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">Student</span>;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold uppercase tracking-wider">
              System Administration
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Platform Control Center</h1>
          <p className="text-slate-500 text-sm">Full administrative authority over users, clubs, events, and platform metrics.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/users"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Manage Users
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="indigo" sub="Registered accounts" />
        <StatCard label="Students" value={stats?.totalStudents} icon={Users} color="blue" sub="Active learners" />
        <StatCard label="Faculty & HOD" value={(stats?.totalFaculty || 0) + (stats?.totalHods || 0)} icon={Shield} color="violet" sub="Academic staff" />
        <StatCard label="Active Clubs" value={stats?.totalClubs} icon={Award} color="amber" sub="Recognized bodies" />
        <StatCard label="Total Events" value={stats?.totalEvents} icon={Calendar} color="emerald" sub="Created platform-wide" />
        <StatCard label="Registrations" value={stats?.totalRegistrations} icon={TrendingUp} color="rose" sub="Total event RSVPs" />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/users" className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">User Directory</h3>
          <p className="text-xs text-slate-500 mt-1">Add, deactivate, or assign roles to platform members.</p>
          <span className="text-xs font-semibold text-indigo-600 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
            Manage <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link to="/admin/clubs" className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Club Oversight</h3>
          <p className="text-xs text-slate-500 mt-1">Review club registrations, leadership, and health status.</p>
          <span className="text-xs font-semibold text-amber-600 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
            Oversee <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link to="/admin/events" className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Event Manager</h3>
          <p className="text-xs text-slate-500 mt-1">Monitor campus-wide events, approvals, and attendances.</p>
          <span className="text-xs font-semibold text-emerald-600 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
            View Events <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link to="/admin/announcements" className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-rose-300 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Megaphone className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Announcements</h3>
          <p className="text-xs text-slate-500 mt-1">Broadcast official institution-wide announcements.</p>
          <span className="text-xs font-semibold text-rose-600 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
            Publish <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Users</h2>
            <p className="text-xs text-slate-500 mt-0.5">Recently active or registered platform accounts</p>
          </div>
          <Link to="/admin/users" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            View All Users →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-8 h-8 rounded-full ring-2 ring-slate-100 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm leading-tight">{u.name}</p>
                      <p className="text-xs text-slate-400 leading-none mt-0.5">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{roleBadge(u.role)}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{u.department || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
