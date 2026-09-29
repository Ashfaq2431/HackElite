import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  BarChart3, TrendingUp, Users, Calendar, BookOpen, Award,
  RefreshCw, AlertCircle, Building2
} from 'lucide-react';

function StatCard({ label, value, icon: Icon, color = 'indigo', sub }) {
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
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function SimpleBar({ label, value, max, color = 'bg-indigo-500' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 font-medium truncate max-w-[65%]">{label}</span>
        <span className="text-slate-500">{value} ({pct}%)</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function HodAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const dept = encodeURIComponent(user?.department || '');
      const res = await api.get(`/analytics?department=${dept}`);
      setStats(res.data);
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [user?.department]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto mt-16 bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
      <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
      <p className="text-rose-700 font-medium">{error}</p>
      <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm hover:bg-rose-700 transition">
        Retry
      </button>
    </div>
  );

  const topEvents = stats?.topEvents || [];
  const maxReg = topEvents.length > 0 ? Math.max(...topEvents.map(e => e.registrations || 0)) : 1;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Department Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            <Building2 className="w-4 h-4 inline mr-1" />
            {user?.department || 'Your Department'} — Insights & Engagement
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Students" value={stats?.totalStudents} icon={Users} color="indigo" sub="In department" />
        <StatCard label="Faculty" value={stats?.totalFaculty} icon={BookOpen} color="violet" sub="Active staff" />
        <StatCard label="Events" value={stats?.totalEvents} icon={Calendar} color="emerald" sub="Total events" />
        <StatCard label="Clubs" value={stats?.totalClubs} icon={Award} color="amber" sub="Registered clubs" />
        <StatCard label="Registrations" value={stats?.totalRegistrations} icon={TrendingUp} color="blue" sub="Event sign-ups" />
        <StatCard label="Announcements" value={stats?.totalAnnouncements} icon={BarChart3} color="rose" sub="Published" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Top Events by Registrations</h2>
        {topEvents.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No event data available yet.</p>
        ) : (
          <div className="space-y-4">
            {topEvents.map((ev, i) => (
              <SimpleBar
                key={ev._id || i}
                label={ev.title || 'Event'}
                value={ev.registrations || 0}
                max={maxReg}
                color={['bg-indigo-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500'][i % 5]}
              />
            ))}
          </div>
        )}
      </div>

      {stats?.clubMembership && stats.clubMembership.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Club Membership Distribution</h2>
          <div className="space-y-4">
            {(() => {
              const maxM = Math.max(...stats.clubMembership.map(c => c.memberCount || 0));
              return stats.clubMembership.map((club, i) => (
                <SimpleBar
                  key={club._id || i}
                  label={club.name || 'Club'}
                  value={club.memberCount || 0}
                  max={maxM || 1}
                  color={['bg-blue-500','bg-teal-500','bg-purple-500','bg-orange-500','bg-cyan-500'][i % 5]}
                />
              ));
            })()}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6">
          <h3 className="font-semibold text-indigo-900 mb-2">Department Summary</h3>
          <ul className="space-y-2 text-sm text-indigo-800">
            <li className="flex justify-between"><span>Total Students</span><strong>{stats?.totalStudents ?? '—'}</strong></li>
            <li className="flex justify-between"><span>Total Faculty</span><strong>{stats?.totalFaculty ?? '—'}</strong></li>
            <li className="flex justify-between"><span>Pending Approvals</span><strong>{stats?.pendingEvents ?? '—'}</strong></li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
          <h3 className="font-semibold text-emerald-900 mb-2">Engagement Overview</h3>
          <ul className="space-y-2 text-sm text-emerald-800">
            <li className="flex justify-between"><span>Total Events</span><strong>{stats?.totalEvents ?? '—'}</strong></li>
            <li className="flex justify-between"><span>Total Registrations</span><strong>{stats?.totalRegistrations ?? '—'}</strong></li>
            <li className="flex justify-between"><span>Total Clubs</span><strong>{stats?.totalClubs ?? '—'}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
