import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, getDashboardRoute } from '../context/AuthContext';
import { User, Shield, Menu, Search, Mail } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">Admin</span>;
      case 'hod':
        return <span className="bg-violet-100 text-violet-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">HOD</span>;
      case 'faculty':
        return <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">Faculty</span>;
      default:
        return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">Student</span>;
    }
  };

  const dashboardRoute = user ? getDashboardRoute(user.role) : '/';

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md">
      <div className="flex items-center h-14 px-4 sm:px-6">
        {/* Mobile toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 mr-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to learn today?"
              className="w-full pl-10 pr-4 py-2 text-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition"
            />
          </div>
        </div>

        {/* Right: Mail + Avatar */}
        <div className="flex items-center gap-3 ml-auto pl-4">
          <button className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition">
            <Mail className="w-5 h-5" />
          </button>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full ring-2 ring-white/40 object-cover"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      {getRoleBadge(user.role)}
                      {user.department && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.department}</span>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/${user.role}/profile`}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </Link>

                  <Link
                    to={dashboardRoute}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    <Shield className="w-4 h-4" /> Dashboard
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 rounded-xl shadow-sm transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
