import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { exportAttendeesToExcel } from '../../utils/exportToExcel';
import {
  Calendar,
  Plus,
  Search,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  X,
  Ticket,
  Download,
  Shield,
  AlertCircle,
} from 'lucide-react';

export default function FacultyEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    club: '',
    category: 'Workshop',
    description: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '12:30 PM',
    venue: 'Department Seminar Hall',
    capacity: 80,
    bannerImage: '',
    tags: 'Academic, Technical',
    allowedAudience: 'all',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, clubsRes] = await Promise.all([
        api.get('/events', { params: { department: user?.department } }),
        api.get('/clubs'),
      ]);

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.events);
      }

      if (clubsRes.data.success) {
        const assigned = clubsRes.data.clubs.filter(
          (c) => c.facultyInCharge?._id === user?._id || c.facultyInCharge === user?._id
        );
        setMyClubs(assigned);
        if (assigned.length > 0) {
          setFormData((prev) => ({ ...prev, club: assigned[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load faculty event data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (myClubs.length === 0) {
      alert('You must be assigned as Faculty-in-Charge of a club to create events. Please contact your HOD.');
      return;
    }
    if (!formData.club) {
      alert('Please select a club you are in charge of.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        department: user?.department,
        tags: formData.tags.split(',').map((t) => t.trim()),
      };

      const res = await api.post('/events', payload);
      if (res.data.success) {
        alert(res.data.message || 'Event created and submitted to HOD for approval!');
        setShowCreateModal(false);
        setFormData({
          title: '',
          club: myClubs[0]?._id || '',
          category: 'Workshop',
          description: '',
          date: '',
          startTime: '10:00 AM',
          endTime: '12:30 PM',
          venue: 'Department Seminar Hall',
          capacity: 80,
          bannerImage: '',
          tags: 'Academic, Technical',
          allowedAudience: 'all',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" /> Faculty Event Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize club events, submit them for HOD approval, and export registered attendee lists
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Host New Event
        </button>
      </div>

      {/* Faculty In Charge Notice Banner */}
      {myClubs.length > 0 ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-indigo-900">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Faculty-in-Charge of:</strong>{' '}
              {myClubs.map((c) => c.name).join(', ')}
            </span>
          </div>
          <span className="text-indigo-600 font-semibold hidden sm:inline">
            You can host events for your assigned clubs
          </span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            You are currently not designated as Faculty-in-Charge for any student club. Contact your HOD to assign you to a club to organize events.
          </span>
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-slate-700">No Department Events</h3>
          <p className="text-xs mt-1">Click "Host New Event" to schedule an academic session.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const activeRegCount = ev.registeredUsers?.filter((r) => r.status !== 'cancelled').length || 0;
            const attendedCount = ev.registeredUsers?.filter((r) => r.status === 'attended').length || 0;

            const isPending = ev.approvalStatus === 'pending_approval';
            const isApproved = ev.approvalStatus === 'approved';
            const isRejected = ev.approvalStatus === 'rejected';

            return (
              <div
                key={ev._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-indigo-300 transition flex flex-col justify-between"
              >
                <div className="h-40 w-full bg-slate-900 relative">
                  <img
                    src={ev.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
                    alt={ev.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                      {ev.category}
                    </span>
                  </div>
                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                        isApproved
                          ? 'bg-emerald-500 text-white'
                          : isRejected
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {isApproved
                        ? '✓ HOD Approved'
                        : isRejected
                        ? '✕ Rejected'
                        : '⏳ Pending HOD Approval'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {ev.club && (
                      <span className="text-[11px] font-semibold text-indigo-600 block mb-1">
                        Hosted by {ev.club.name}
                      </span>
                    )}
                    <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1">{ev.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{ev.description}</p>

                    {/* Audience badge */}
                    <div className="mt-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          ev.allowedAudience === 'club_members_only'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ev.allowedAudience === 'club_members_only'
                          ? '🔒 Club Members Only'
                          : '👥 Open to All Students'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(ev.date).toLocaleDateString()} • {ev.startTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Registered</span>
                        <span className="font-bold text-slate-900">{activeRegCount} Students</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Checked In</span>
                        <span className="font-bold text-emerald-600">{attendedCount} Attended</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => exportAttendeesToExcel(ev.registeredUsers, ev.title)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-semibold rounded-xl text-xs transition border border-emerald-200"
                      title="Export Registered Attendees to Excel"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Excel
                    </button>
                    <Link
                      to={`/events/${ev._id}`}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-xl text-xs transition"
                    >
                      Console →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Host Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Schedule Club Event</h3>
                <p className="text-xs text-slate-500">Will be sent to HOD for approval before being visible to students</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              {/* Club Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Organizing Club (Where you are Faculty-in-Charge) *
                </label>
                {myClubs.length > 0 ? (
                  <select
                    required
                    value={formData.club}
                    onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-600"
                  >
                    {myClubs.map((club) => (
                      <option key={club._id} value={club._id}>
                        {club.name} ({club.category})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                    You have not been assigned as Faculty-in-Charge to any club yet. An HOD must assign you to a club before you can organize club events.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Full-Stack Web Development Bootcamp"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* Allowed Audience Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Participation Eligibility (Who Can Register) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, allowedAudience: 'all' })}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                      formData.allowedAudience === 'all'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">All Students</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">Open to all students across campus</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, allowedAudience: 'club_members_only' })}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                      formData.allowedAudience === 'club_members_only'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">Club Members Only</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">Restricted strictly to members of this club</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar & Talk">Seminar & Talk</option>
                    <option value="Hackathon & Contest">Hackathon & Contest</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Agenda *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Topics, prerequisites, seminar objectives..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Timing
                  </label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="10:00 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Venue / Lab
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Room 302, Department Wing"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || myClubs.length === 0}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit for HOD Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
