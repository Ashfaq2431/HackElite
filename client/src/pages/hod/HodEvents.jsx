import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { exportAttendeesToExcel } from '../../utils/exportToExcel';
import {
  Calendar,
  Check,
  X,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Download,
} from 'lucide-react';

export default function HodEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events', {
        params: { department: user?.department },
      });
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleApproval = async (eventId, action) => {
    try {
      const res = await api.put(`/events/${eventId}/approval`, { action });
      alert(res.data.message || `Event ${action}d`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update approval');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-amber-600" /> Department Events Oversight & Approvals
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, approve, and export registration data for events hosted in {user?.department}
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-slate-700">No Department Events</h3>
          <p className="text-xs mt-1">No events have been scheduled under this department yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => {
            const activeRegs = ev.registeredUsers?.filter((r) => r.status !== 'cancelled').length || 0;
            const attendedCount = ev.registeredUsers?.filter((r) => r.status === 'attended').length || 0;

            return (
              <div
                key={ev._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-amber-300 transition"
              >
                <div className="space-y-2 min-w-0 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                      {ev.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        ev.approvalStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.approvalStatus === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Status: {ev.approvalStatus === 'approved' ? '✓ Approved' : ev.approvalStatus === 'rejected' ? '✕ Rejected' : '⏳ Pending HOD Approval'}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {ev.allowedAudience === 'club_members_only' ? '🔒 Club Members Only' : '👥 Open to All'}
                    </span>
                    {ev.club && (
                      <span className="text-[11px] font-medium text-indigo-600">
                        Club: {ev.club.name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{ev.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>📅 {new Date(ev.date).toLocaleDateString()} at {ev.startTime}</span>
                    <span>📍 {ev.venue}</span>
                    <span>👤 Host: {ev.createdBy?.name || 'Faculty Coordinator'}</span>
                    <span className="font-bold text-slate-900">
                      👥 {activeRegs} Registered ({attendedCount} checked-in)
                    </span>
                  </div>
                </div>

                {/* HOD Actions: Approval & Export */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => exportAttendeesToExcel(ev.registeredUsers, ev.title)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200"
                    title="Export Registered Attendees to Excel format"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Excel
                  </button>

                  {ev.approvalStatus === 'pending_approval' ? (
                    <>
                      <button
                        onClick={() => handleApproval(ev._id, 'approve')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleApproval(ev._id, 'reject')}
                        className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </>
                  ) : (
                    <Link
                      to={`/events/${ev._id}`}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-bold transition"
                    >
                      Console →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
