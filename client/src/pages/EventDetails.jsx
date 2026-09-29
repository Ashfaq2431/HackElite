import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  CheckCircle,
  Share2,
  Ticket,
  UserCheck,
  Shield,
  ArrowRight,
  X,
  QrCode,
  Download,
} from 'lucide-react';
import { exportAttendeesToExcel } from '../utils/exportToExcel';

export default function EventDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
      }
    } catch (err) {
      console.error('Failed to load event details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <h3 className="text-lg font-bold text-slate-800">Event Not Found</h3>
        <Link to="/events" className="text-sm text-indigo-600 font-semibold mt-2 inline-block">
          ← Back to Events
        </Link>
      </div>
    );
  }

  const userRegistration =
    user && event.registeredUsers?.find((r) => (r.user?._id === user._id || r.user === user._id) && r.status !== 'cancelled');
  const isRegistered = !!userRegistration;
  const isOrganizer = user && (event.createdBy?._id === user._id || event.createdBy === user._id);
  const isFacultyInCharge =
    user && event.club && (event.club.facultyInCharge?._id === user._id || event.club.facultyInCharge === user._id);
  const isHOD = user?.role === 'hod';
  const canManage = isOrganizer || isAdmin || isFacultyInCharge || isHOD;

  const activeRegistrations = event.registeredUsers?.filter((r) => r.status !== 'cancelled') || [];
  const isFull = event.capacity > 0 && activeRegistrations.length >= event.capacity;

  const handleRegister = async () => {
    if (!user) {
      alert('Please log in to RSVP for this event.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post(`/events/${id}/register`);
      if (res.data.success) {
        alert(res.data.message || 'Pass issued successfully!');
        setShowTicketModal(true);
        fetchEvent();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel your event registration?')) return;
    setIsSubmitting(true);
    try {
      await api.post(`/events/${id}/cancel`);
      alert('Registration cancelled');
      setShowTicketModal(false);
      fetchEvent();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (ticketId) => {
    try {
      const res = await api.put(`/events/${id}/attendees/${ticketId}/checkin`);
      fetchEvent();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update check-in');
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={event.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
                {event.category}
              </span>
              {event.club && (
                <Link
                  to={`/clubs/${event.club._id}`}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition"
                >
                  Hosted by {event.club.name}
                </Link>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>

          {/* Registration Trigger Button - Students Only */}
          <div className="shrink-0">
            {user?.role === 'student' ? (
              isRegistered ? (
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 transition"
                >
                  <Ticket className="w-4 h-4" /> View My Pass ({userRegistration.ticketId})
                </button>
              ) : isFull ? (
                <span className="px-6 py-3 bg-slate-700 text-slate-300 rounded-2xl font-bold text-sm">
                  Event at Full Capacity
                </span>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/30 flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Ticket className="w-4 h-4" /> RSVP / Reserve Pass
                </button>
              )
            ) : (
              <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl text-xs font-semibold text-slate-200 border border-white/20">
                {user?.role === 'faculty' ? 'Faculty Organizer Console' : user?.role === 'hod' ? 'Department HOD Oversight' : 'System Admin Console'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Details vs Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Event Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Details Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About this Event</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 flex flex-wrap gap-1.5">
                {event.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Speakers / Guests */}
          {event.speakers && event.speakers.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Featured Keynote Speakers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.speakers.map((spk, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <img
                      src={spk.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${spk.name}`}
                      alt={spk.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{spk.name}</h4>
                      <p className="text-xs text-slate-500">{spk.designation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendee Management (Organizer / Admin view) */}
          {canManage && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Registered Attendees ({activeRegistrations.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportAttendeesToExcel(event.registeredUsers, event.title)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shadow-xs"
                    title="Download Excel file of registered students"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Excel (.xlsx)
                  </button>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">Check-In Console</span>
                </div>
              </div>

              {activeRegistrations.length === 0 ? (
                <p className="text-xs text-slate-400">No attendees have registered yet.</p>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {activeRegistrations.map((reg) => (
                    <div key={reg.ticketId} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={reg.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reg.user?.name || 'User'}`}
                          alt={reg.user?.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{reg.user?.name}</p>
                          <p className="text-slate-400">{reg.user?.department} • Ticket: {reg.ticketId}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCheckIn(reg.ticketId)}
                        className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                          reg.status === 'attended'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {reg.status === 'attended' ? 'Attended' : 'Check In'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Schedule & Location (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
              Event Logistics
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Date & Day</p>
                  <p className="text-slate-500 mt-0.5">
                    {new Date(event.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Timing</p>
                  <p className="text-slate-500 mt-0.5">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  {event.isOnline ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {event.isOnline ? 'Online Meeting' : 'Campus Venue'}
                  </p>
                  <p className="text-slate-500 mt-0.5">{event.venue}</p>
                  {event.isOnline && event.meetingLink && isRegistered && (
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 font-bold mt-1"
                    >
                      Open Video Room <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Capacity & Seats</p>
                  <p className="text-slate-500 mt-0.5">
                    {activeRegistrations.length} registered {event.capacity > 0 ? `/ ${event.capacity} total seats` : '(Unlimited)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Organizer Profile */}
            {event.createdBy && (
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={event.createdBy.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.createdBy.name}`}
                  alt={event.createdBy.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">{event.createdBy.name}</p>
                  <p className="text-slate-400">Event Host / Faculty</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Pass Modal */}
      {showTicketModal && userRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Official Campus Event Pass
              </span>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Card Aesthetic */}
            <div className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white p-6 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    CampusConnect Pass
                  </span>
                  <h4 className="font-extrabold text-base leading-snug mt-0.5">{event.title}</h4>
                </div>
                <div className="p-2 bg-white/20 rounded-xl">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/20">
                <div>
                  <p className="text-indigo-200 text-[10px]">Attendee</p>
                  <p className="font-bold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-[10px]">Pass ID</p>
                  <p className="font-bold tracking-widest">{userRegistration.ticketId}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-[10px]">Date</p>
                  <p className="font-bold">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-[10px]">Venue</p>
                  <p className="font-bold truncate">{event.venue}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleCancelRegistration}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
              >
                Cancel Registration
              </button>
              <button
                onClick={() => setShowTicketModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
