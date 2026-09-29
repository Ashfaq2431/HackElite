import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  UserCheck,
  UserPlus,
  Shield,
  Megaphone,
  Globe,
  Share2,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function ClubDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [club, setClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, members, events, admin
  const [joinMessage, setJoinMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      const [clubRes, evRes] = await Promise.all([
        api.get(`/clubs/${id}`),
        api.get(`/events?clubId=${id}`),
      ]);
      if (clubRes.data.success) {
        setClub(clubRes.data.club);
      }
      if (evRes.data.success) {
        setClubEvents(evRes.data.events);
      }
    } catch (err) {
      console.error('Failed to load club details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading club profile...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <h3 className="text-lg font-bold text-slate-800">Club Not Found</h3>
        <Link to="/clubs" className="text-sm text-indigo-600 font-semibold mt-2 inline-block">
          ← Back to Clubs
        </Link>
      </div>
    );
  }

  const isLead = user && (club.lead?._id === user._id || club.lead === user._id);
  const isFacultyInCharge = user && (club.facultyInCharge?._id === user._id || club.facultyInCharge === user._id);
  const isHod = user?.role === 'hod';
  const isMember = user && club.members?.some((m) => m.user?._id === user._id || m.user === user._id);
  const hasPendingRequest =
    user &&
    club.joinRequests?.some(
      (r) => (r.user?._id === user._id || r.user === user._id) && r.status === 'pending'
    );
  const canManage = isLead || isAdmin || isFacultyInCharge || isHod;

  const handleJoin = async () => {
    if (!user) {
      alert('Please log in first to join this club');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post(`/clubs/${id}/join`, { message: joinMessage });
      alert(res.data.message || 'Join request submitted!');
      fetchClubData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(`Are you sure you want to leave ${club.name}?`)) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/clubs/${id}/leave`);
      alert(res.data.message || 'You have left the club');
      fetchClubData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave club');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewRequest = async (requestId, action) => {
    try {
      const res = await api.put(`/clubs/${id}/requests/${requestId}`, { action });
      alert(res.data.message || `Request ${action}d`);
      fetchClubData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request');
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Remove this member from the club?')) return;
    try {
      await api.delete(`/clubs/${id}/members/${memberUserId}`);
      fetchClubData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Club Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="h-48 sm:h-64 w-full bg-slate-900 relative">
          <img
            src={club.bannerImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80'}
            alt={club.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={club.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${club.name}`}
                alt={club.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
              />
              <div className="mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  {club.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {club.name}
                </h1>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {user?.role !== 'student' ? (
                <>
                  {isFacultyInCharge ? (
                    <span className="px-4 py-2 bg-purple-50 border border-purple-200 text-purple-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <Shield className="w-4 h-4 text-purple-600" /> Faculty-in-Charge
                    </span>
                  ) : isHod ? (
                    <span className="px-4 py-2 bg-violet-50 border border-violet-200 text-violet-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <Shield className="w-4 h-4 text-violet-600" /> Department HOD
                    </span>
                  ) : isAdmin ? (
                    <span className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <Shield className="w-4 h-4 text-rose-600" /> Administrator
                    </span>
                  ) : (
                    <span className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium">
                      Faculty Member
                    </span>
                  )}
                </>
              ) : isLead ? (
                <span className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <Shield className="w-4 h-4 text-amber-600" /> Club President / Lead
                </span>
              ) : isMember ? (
                <button
                  onClick={handleLeave}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Leave Club
                </button>
              ) : hasPendingRequest ? (
                <span className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Application Under Review
                </span>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Request to Join
                </button>
              )}
            </div>
          </div>

          {/* Quick Info bar */}
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-100 text-xs text-slate-600">
            {club.facultyInCharge && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Faculty-in-Charge: <strong>{club.facultyInCharge.name}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span><strong>{club.members?.length || 1}</strong> Active Members</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{club.meetingSchedule || 'Regular Schedule'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>{club.venueOrRoom || 'Campus Hall'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview & Mission
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
            activeTab === 'members'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Members ({club.members?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
            activeTab === 'events'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Club Events ({clubEvents.length})
        </button>

        {canManage && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`pb-3 px-4 text-sm font-semibold transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-rose-600'
            }`}
          >
            <Shield className="w-4 h-4" /> Lead Management
            {club.joinRequests?.filter((r) => r.status === 'pending').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {club.joinRequests.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">About {club.name}</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {club.description}
              </p>
            </div>

            {club.mission && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-6 rounded-3xl border border-indigo-100 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Our Mission & Vision
                </h3>
                <p className="text-sm text-indigo-900/80 leading-relaxed">
                  {club.mission}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Leadership card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                Club President / Lead
              </h3>
              {club.lead && (
                <div className="flex items-center gap-3">
                  <img
                    src={club.lead.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${club.lead.name}`}
                    alt={club.lead.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{club.lead.name}</h4>
                    <p className="text-xs text-slate-500">{club.lead.department}</p>
                    <p className="text-xs text-indigo-600 font-medium">{club.lead.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            {club.socialLinks && Object.values(club.socialLinks).some(Boolean) && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Club Links & Communities
                </h3>
                <div className="space-y-2">
                  {club.socialLinks.discord && (
                    <a
                      href={club.socialLinks.discord}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-xs font-medium text-slate-700 hover:text-indigo-600 transition"
                    >
                      <span>Join Discord Server</span>
                      <Share2 className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {club.socialLinks.github && (
                    <a
                      href={club.socialLinks.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-xs font-medium text-slate-700 hover:text-indigo-600 transition"
                    >
                      <span>GitHub Organization</span>
                      <Share2 className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Members Directory */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Official Club Roster</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {club.members?.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={m.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.name || 'Member'}`}
                    alt={m.user?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.user?.name || 'Student Member'}</h4>
                    <p className="text-[11px] text-slate-500">{m.user?.department || 'Engineering'}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-white rounded-md border text-slate-600">
                      {m.role}
                    </span>
                  </div>
                </div>

                {canManage && m.user?._id !== club.lead?._id && (
                  <button
                    onClick={() => handleRemoveMember(m.user?._id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Club Events */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Events Organized by {club.name}</h3>
            {canManage && (
              <Link
                to="/events"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + New Event
              </Link>
            )}
          </div>

          {clubEvents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No events currently scheduled by this club.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clubEvents.map((ev) => (
                <Link
                  key={ev._id}
                  to={`/events/${ev._id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 transition shadow-xs flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{ev.category}</span>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mt-1">
                      {ev.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{ev.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500 mt-4">
                    <span>📅 {new Date(ev.date).toLocaleDateString()}</span>
                    <span className="font-semibold text-indigo-600">View Details →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Lead Administration */}
      {canManage && activeTab === 'admin' && (
        <div className="space-y-6">
          {/* Join Requests Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" /> Pending Membership Applications
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {club.joinRequests?.filter((r) => r.status === 'pending').length || 0} Pending
              </span>
            </div>

            {club.joinRequests?.filter((r) => r.status === 'pending').length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No pending membership requests right now.</p>
            ) : (
              <div className="space-y-3">
                {club.joinRequests
                  .filter((r) => r.status === 'pending')
                  .map((req) => (
                    <div
                      key={req._id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={req.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user?.name || 'Applicant'}`}
                          alt={req.user?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{req.user?.name}</h4>
                          <p className="text-[11px] text-slate-500">{req.user?.department} • {req.user?.year}</p>
                          {req.message && <p className="text-xs text-slate-600 mt-1 italic">"{req.message}"</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleReviewRequest(req._id, 'approve')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReviewRequest(req._id, 'reject')}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
