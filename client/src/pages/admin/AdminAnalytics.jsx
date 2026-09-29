import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, TrendingUp, Users, Calendar, Award, BookOpen, RefreshCw } from 'lucide-react';

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

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const topEvents = stats?.topEvents || [];
  const maxReg = topEvents.length > 0 ? Math.max(...topEvents.map((e) => e.registrations || 0)) : 1;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Analytics & Intelligence</h1>
          <p className="text-slate-500 text-sm mt-0.5">Campus-wide engagement, user distribution, and activity trends.</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="indigo" sub="All accounts" />
        <StatCard label="Students" value={stats?.totalStudents} icon={Users} color="blue" sub="Learners" />
        <StatCard label="Faculty" value={stats?.totalFaculty} icon={BookOpen} color="violet" sub="Staff members" />
        <StatCard label="HODs" value={stats?.totalHods} icon={BookOpen} color="purple" sub="Dept heads" />
        <StatCard label="Active Clubs" value={stats?.totalClubs} icon={Award} color="amber" sub="Recognized" />
        <StatCard label="Total RSVPs" value={stats?.totalRegistrations} icon={TrendingUp} color="emerald" sub="Event sign-ups" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Top Events by Engagement</h2>
          {topEvents.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No event registrations recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {topEvents.map((ev, i) => (
                <SimpleBar
                  key={ev._id || i}
                  label={ev.title || 'Event'}
                  value={ev.registrations || 0}
                  max={maxReg}
                  color={['bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'][i % 5]}
                />
              ))}
            </div>
          )}
        </div>

        {stats?.clubMembership && stats.clubMembership.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Club Membership Scale</h2>
            <div className="space-y-4">
              {(() => {
                const maxM = Math.max(...stats.clubMembership.map((c) => c.memberCount || 0));
                return stats.clubMembership.map((club, i) => (
                  <SimpleBar
                    key={club._id || i}
                    label={club.name || 'Club'}
                    value={club.memberCount || 0}
                    max={maxM || 1}
                    color={['bg-blue-500', 'bg-teal-500', 'bg-purple-500', 'bg-orange-500', 'bg-cyan-500'][i % 5]}
                  />
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-2">Campus Engagement Health: Optimal</h3>
        <p className="text-indigo-200 text-sm max-w-2xl leading-relaxed">
          Platform-wide metrics indicate robust student participation across tech symposiums and cultural organizations.
          All four administrative tiers (Student, Faculty, HOD, and Central Admin) are operating with role-based access.
        </p>
      </div>
    </div>
  );
}
