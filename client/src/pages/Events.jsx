import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  CheckCircle,
  Tag,
  ArrowRight,
  X,
} from 'lucide-react';

export default function Events() {
  const { user, isAdmin, isFaculty, isClubAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, all
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New event form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Workshop',
    club: '',
    description: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    venue: 'Campus Hall A',
    isOnline: false,
    meetingLink: '',
    capacity: 100,
    bannerImage: '',
    tags: 'Campus, Workshop',
  });

  const categories = [
    'All',
    'Workshop',
    'Hackathon & Contest',
    'Seminar & Talk',
    'Cultural & Arts',
    'Sports & Fitness',
    'Webinar',
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events', {
        params: {
          filter: filter !== 'all' ? filter : undefined,
          category: category !== 'All' ? category : undefined,
          search: search || undefined,
        },
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
  }, [filter, category]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await api.get('/clubs');
        if (res.data.success) {
          setClubs(res.data.clubs);
        }
      } catch (err) {
        console.error('Failed to fetch clubs for dropdown', err);
      }
    };
    fetchClubs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()),
        club: formData.club || undefined,
      };

      const res = await api.post('/events', payload);
      if (res.data.success) {
        alert('Event successfully created and published!');
        setShowCreateModal(false);
        setFormData({
          title: '',
          category: 'Workshop',
          club: '',
          description: '',
          date: '',
          startTime: '10:00 AM',
          endTime: '12:00 PM',
          venue: 'Campus Hall A',
          isOnline: false,
          meetingLink: '',
          capacity: 100,
          bannerImage: '',
          tags: 'Campus, Workshop',
        });
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCreate = isAdmin || isFaculty || isClubAdmin;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" /> Campus Events & Workshops
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover hackathons, technical masterclasses, cultural fests, and secure your event pass
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Host an Event
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search events by title, keyword, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Time Filter Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'upcoming' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'past' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading campus calendar...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Events Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting the filter or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const isRegistered =
              user && ev.registeredUsers?.some((r) => r.user === user._id || r.user?._id === user._id);
            const eventDate = new Date(ev.date);

            return (
              <div
                key={ev._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-300 transition flex flex-col justify-between group"
              >
                {/* Event Banner */}
                <div className="h-44 w-full bg-slate-900 relative overflow-hidden">
                  <img
                    src={ev.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-center shadow-md">
                    <span className="block text-[10px] font-black uppercase text-indigo-600">
                      {eventDate.toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="block text-base font-black text-slate-900 leading-none">
                      {eventDate.getDate()}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                    {ev.category}
                  </div>
                </div>

                {/* Event Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {ev.club && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mb-2">
                        <span>Organized by {ev.club.name}</span>
                      </div>
                    )}

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-2">
                      {ev.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ev.startTime} - {ev.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        {ev.isOnline ? (
                          <>
                            <Video className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-indigo-600 font-medium">Online Event</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{ev.venue}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {ev.registeredUsers?.length || 0} registered
                    </span>

                    <div className="flex items-center gap-2">
                      {isRegistered && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md border border-emerald-200 text-[11px] flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Registered
                        </span>
                      )}
                      <Link
                        to={`/events/${ev._id}`}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-xl transition flex items-center gap-1"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
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
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Host Campus Event</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AI & Robotics National Seminar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
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
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Hosting Club (Optional)
                  </label>
                  <select
                    value={formData.club}
                    onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  >
                    <option value="">Campus Independent</option>
                    {clubs.map((cl) => (
                      <option key={cl._id} value={cl._id}>
                        {cl.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Event Description & Agenda *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed information regarding keynote, requirements, eligibility, food, etc..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="10:00 AM"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Capacity (0=Unltd)
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
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Auditorium B, Engineering Block"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
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
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
