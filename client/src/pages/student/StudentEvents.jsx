import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Search,
  Filter,
  Clock,
  MapPin,
  Users,
  Video,
  CheckCircle,
  Ticket,
  ArrowRight,
  X,
  QrCode,
} from 'lucide-react';

export default function StudentEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'registered'
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [activePass, setActivePass] = useState(null);

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
  }, [category]);

  const handleRegister = async (eventId) => {
    try {
      const res = await api.post(`/events/${eventId}/register`);
      if (res.data.success) {
        alert(res.data.message || 'Pass issued successfully!');
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register');
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm('Cancel your event reservation?')) return;
    try {
      await api.post(`/events/${eventId}/cancel`);
      alert('Reservation cancelled');
      setActivePass(null);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const registeredEvents = events.filter((ev) =>
    ev.registeredUsers?.some((r) => (r.user?._id === user?._id || r.user === user?._id) && r.status !== 'cancelled')
  );

  const displayedEvents = activeTab === 'registered' ? registeredEvents : events;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" /> Student Campus Events & Workshops
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover upcoming competitions, seminars, and secure your official student passes
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'registered' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" /> My Passes ({registeredEvents.length})
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search events by title, keyword, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchEvents()}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              Category: {c}
            </option>
          ))}
        </select>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading events...</p>
        </div>
      ) : displayedEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-slate-700">No Events Found</h3>
          <p className="text-xs mt-1">
            {activeTab === 'registered' ? "You haven't reserved any event passes yet." : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((ev) => {
            const userReg = ev.registeredUsers?.find(
              (r) => (r.user?._id === user?._id || r.user === user?._id) && r.status !== 'cancelled'
            );
            const isReg = !!userReg;
            const activeCount = ev.registeredUsers?.filter((r) => r.status !== 'cancelled').length || 0;
            const isFull = ev.capacity > 0 && activeCount >= ev.capacity;

            return (
              <div
                key={ev._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-indigo-300 transition flex flex-col justify-between group"
              >
                <div className="h-44 w-full bg-slate-900 relative overflow-hidden">
                  <img
                    src={ev.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                    {ev.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-2">
                      {ev.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(ev.date).toLocaleDateString()} • {ev.startTime}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Users className="w-3.5 h-3.5" />
                        <span>{activeCount} registered {ev.capacity > 0 ? `(${ev.capacity - activeCount} seats left)` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {isReg ? (
                      <button
                        onClick={() => setActivePass({ event: ev, reg: userReg })}
                        className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Ticket className="w-3.5 h-3.5" /> Pass ({userReg.ticketId})
                      </button>
                    ) : isFull ? (
                      <span className="text-xs text-slate-400 font-bold">Full Capacity</span>
                    ) : (
                      <button
                        onClick={() => handleRegister(ev._id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        Reserve Pass
                      </button>
                    )}

                    <Link
                      to={`/events/${ev._id}`}
                      className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Pass View Modal */}
      {activePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Confirmed Student Pass
              </span>
              <button
                onClick={() => setActivePass(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white p-6 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    CampusConnect Pass
                  </span>
                  <h4 className="font-extrabold text-base leading-snug mt-0.5">{activePass.event.title}</h4>
                </div>
                <div className="p-2 bg-white/20 rounded-xl">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/20">
                <div>
                  <p className="text-indigo-200 text-[10px]">Student</p>
                  <p className="font-bold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-[10px]">Pass ID</p>
                  <p className="font-bold tracking-widest">{activePass.reg.ticketId}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-[10px]">Date</p>
                  <p className="font-bold">{new Date(activePass.event.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-[10px]">Venue</p>
                  <p className="font-bold truncate">{activePass.event.venue}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleCancelRegistration(activePass.event._id)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
              >
                Cancel Registration
              </button>
              <button
                onClick={() => setActivePass(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
