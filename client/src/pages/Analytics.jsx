import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Calendar,
  CheckCircle,
  Megaphone,
  MessageSquare,
  Activity,
  Layers,
} from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Aggregating campus metrics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
        <p className="text-sm text-slate-500">Failed to load analytics data.</p>
      </div>
    );
  }

  const { stats, topClubs, topEvents, departmentDistribution, eventCategoryDistribution } = data;

  const maxClubMembers = topClubs.length > 0 ? Math.max(...topClubs.map((c) => c.memberCount), 1) : 1;
  const maxEventRegs = topEvents.length > 0 ? Math.max(...topEvents.map((e) => e.registrations), 1) : 1;
  const maxDeptCount = departmentDistribution.length > 0 ? Math.max(...departmentDistribution.map((d) => d.count), 1) : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" /> Student Engagement & Campus Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time metrics on student participation, club governance, and event attendance
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">Total Scholars</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalStudents || 0}</p>
          <span className="text-[11px] text-indigo-600 font-medium">Active Enrolled</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">Active Clubs</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalClubs || 0}</p>
          <span className="text-[11px] text-purple-600 font-medium">Societies</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">Campus Events</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalEvents || 0}</p>
          <span className="text-[11px] text-amber-600 font-medium">Published</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">Total RSVPs</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalRegistrations || 0}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Event Passes</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">Notices Issued</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalAnnouncements || 0}</p>
          <span className="text-[11px] text-blue-600 font-medium">Circulars</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-400">Forum Threads</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalDiscussions || 0}</p>
          <span className="text-[11px] text-rose-600 font-medium">Discussions</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Top Active Clubs by Member Roster */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Most Popular Clubs by Membership
            </h3>
            <span className="text-xs text-slate-400">Members</span>
          </div>

          <div className="space-y-4">
            {topClubs.map((club, idx) => {
              const percentage = Math.round((club.memberCount / maxClubMembers) * 100);
              return (
                <div key={club.id || idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 truncate">{club.name}</span>
                    <span className="text-indigo-600 font-bold">{club.memberCount} members</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Top Events by Attendee Registrations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Highest RSVP Event Turnout
            </h3>
            <span className="text-xs text-slate-400">Passes Issued</span>
          </div>

          <div className="space-y-4">
            {topEvents.map((ev, idx) => {
              const percentage = Math.round((ev.registrations / maxEventRegs) * 100);
              return (
                <div key={ev.id || idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 truncate">{ev.title}</span>
                    <span className="text-emerald-600 font-bold">{ev.registrations} RSVPs</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Department Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" /> Student Distribution by Department
            </h3>
            <span className="text-xs text-slate-400">Headcount</span>
          </div>

          <div className="space-y-4">
            {departmentDistribution.map((dept, idx) => {
              const percentage = Math.round((dept.count / maxDeptCount) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 truncate">{dept.name}</span>
                    <span className="text-purple-600 font-bold">{dept.count} scholars</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Event Category Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" /> Event Category Distribution
            </h3>
            <span className="text-xs text-slate-400">Total Count</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {eventCategoryDistribution.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-xs font-semibold text-slate-500 block truncate">{cat.name}</span>
                <span className="text-2xl font-black text-slate-900 block">{cat.count}</span>
                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Events</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
