import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Megaphone,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  User,
  Shield,
  Bell,
  Award,
  GraduationCap,
  BookOpen,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Role-specific navigation items
  const getNavItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { to: '/student/dashboard', label: 'Home', icon: Home, end: true },
          { to: '/student/events', label: 'My Results & Passes', icon: Calendar },
          { to: '/student/clubs', label: 'Clubs & Societies', icon: Award },
          { to: '/student/announcements', label: 'Campus Notices', icon: Megaphone },
          { to: '/student/discussions', label: 'Forum & Meetups', icon: MessageSquare },
          { to: '/student/profile', label: 'Settings & Profile', icon: User },
        ];
      case 'faculty':
        return [
          { to: '/faculty/dashboard', label: 'Home', icon: Home, end: true },
          { to: '/faculty/students', label: 'My Students', icon: Users },
          { to: '/faculty/events', label: 'Manage Events', icon: Calendar },
          { to: '/faculty/announcements', label: 'Circulars', icon: Megaphone },
          { to: '/faculty/discussions', label: 'Discussions', icon: MessageSquare },
          { to: '/faculty/profile', label: 'My Profile', icon: User },
        ];
      case 'hod':
        return [
          { to: '/hod/dashboard', label: 'Home', icon: Home, end: true },
          { to: '/hod/students', label: 'Dept Students', icon: GraduationCap },
          { to: '/hod/faculty', label: 'Dept Faculty', icon: BookOpen },
          { to: '/hod/clubs', label: 'Clubs Oversight', icon: Award },
          { to: '/hod/events', label: 'Event Approvals', icon: Calendar },
          { to: '/hod/announcements', label: 'Circulars', icon: Megaphone },
          { to: '/hod/analytics', label: 'Analytics', icon: BarChart3 },
          { to: '/hod/profile', label: 'My Profile', icon: User },
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard', icon: Shield, end: true },
          { to: '/admin/users', label: 'Manage Users', icon: Users },
          { to: '/admin/events', label: 'Manage Events', icon: Calendar },
        ];
      default:
        return [
          { to: '/', label: 'Campus Feed', icon: Home, end: true },
          { to: '/events', label: 'Events', icon: Calendar },
          { to: '/clubs', label: 'Clubs', icon: Award },
          { to: '/announcements', label: 'Announcements', icon: Megaphone },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container matching violet/indigo theme */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-700 via-indigo-800 to-violet-900 text-white flex flex-col justify-between transition-transform duration-300 shadow-xl lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Top Brand Box (E-Skool style badge with yellow icon) */}
          <div className="flex items-center gap-3 p-2.5 bg-white/10 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-sm shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="truncate">
              <div className="font-extrabold text-base tracking-tight text-white leading-tight">
                Campus<span className="text-amber-300">Connect</span>
              </div>
              <div className="text-[10px] text-indigo-200 uppercase tracking-wider font-semibold">
                {user?.role ? `${user.role} portal` : 'Portal'}
              </div>
            </div>
          </div>

          {/* Main Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-white/20 text-white shadow-xs'
                        : 'text-indigo-100 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-indigo-200" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer with Academic/Semester Progress bar & Logout */}
        <div className="p-4 space-y-3 bg-black/15 border-t border-white/10">
          {user?.role === 'student' && (
            <div className="px-2 py-1 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-200 font-medium">Semester</span>
                <span className="font-bold text-amber-300">{user?.year || '2 of 3'}</span>
              </div>
              <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-2/3" />
              </div>
            </div>
          )}

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-200 hover:text-white hover:bg-rose-600/30 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
