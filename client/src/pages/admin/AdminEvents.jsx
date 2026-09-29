import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Search, Trash2, CheckCircle, Clock, MapPin, Users, AlertCircle, X, Edit } from 'lucide-react';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'Workshop',
    department: '',
    venue: '',
    capacity: 0,
    date: '',
    startTime: '',
    endTime: '',
    approvalStatus: 'approved',
    allowedAudience: 'all',
    description: '',
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(res.data.events || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openEditModal = (ev) => {
    setSelectedEvent(ev);
    setEditFormData({
      title: ev.title || '',
      category: ev.category || 'Workshop',
      department: ev.department || 'Computer Science & Engineering',
      venue: ev.venue || '',
      capacity: ev.capacity || 0,
      date: ev.date ? new Date(ev.date).toISOString().split('T')[0] : '',
      startTime: ev.startTime || '',
      endTime: ev.endTime || '',
      approvalStatus: ev.approvalStatus || 'approved',
      allowedAudience: ev.allowedAudience || 'all',
      description: ev.description || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    try {
      setSubmitting(true);
      const res = await api.put(`/events/${selectedEvent._id}`, editFormData);
      if (res.data.success) {
        alert('Event details updated successfully!');
        setShowEditModal(false);
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update event details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter((e) => e._id !== id));
    } catch {
      alert('Failed to delete event');
    }
  };

  const handleApproval = async (id, action) => {
    try {
      await api.put(`/events/${id}/approval`, { action });
      fetchEvents();
    } catch {
      alert('Failed to update event status');
    }
  };

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.department?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || e.approvalStatus === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Event Oversight & Modifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Admin console: modify details of campus events, schedules, capacity, and approval statuses.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by title or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Audience</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ev) => (
                <tr key={ev._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900 leading-tight">{ev.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{ev.venue || 'Campus Auditorium'}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">{ev.department || 'All Campus'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div>{ev.date ? new Date(ev.date).toLocaleDateString() : 'TBD'}</div>
                    <div className="text-[11px] text-slate-400">{ev.startTime || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600">
                      {ev.allowedAudience === 'club_members_only' ? '🔒 Members Only' : '👥 Open to All'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        ev.approvalStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : ev.approvalStatus === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {ev.approvalStatus || 'approved'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(ev)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl text-xs font-semibold transition"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>

                      {ev.approvalStatus === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => handleApproval(ev._id, 'approve')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproval(ev._id, 'reject')}
                            className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(ev._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Event Details Modal */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Modify Event Details</h2>
                <p className="text-xs text-slate-500">Edit scheduling, capacity, and audience permissions</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
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
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Seat Capacity</label>
                  <input
                    type="number"
                    value={editFormData.capacity}
                    onChange={(e) => setEditFormData({ ...editFormData, capacity: Number(e.target.value) })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Timing</label>
                  <input
                    type="text"
                    value={editFormData.startTime}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                    placeholder="10:00 AM"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Venue</label>
                <input
                  type="text"
                  value={editFormData.venue}
                  onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                  placeholder="Main Seminar Hall"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Approval Status</label>
                  <select
                    value={editFormData.approvalStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, approvalStatus: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600 font-medium"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Audience Eligibility</label>
                  <select
                    value={editFormData.allowedAudience}
                    onChange={(e) => setEditFormData({ ...editFormData, allowedAudience: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600 font-medium"
                  >
                    <option value="all">All Students (Open)</option>
                    <option value="club_members_only">Club Members Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Event Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
