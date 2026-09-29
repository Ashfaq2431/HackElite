import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, getDashboardRoute } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingNotification from './components/FloatingNotification';

// Common Auth & Public Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ClubDetails from './pages/ClubDetails';
import EventDetails from './pages/EventDetails';
import DiscussionDetails from './pages/DiscussionDetails';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentEvents from './pages/student/StudentEvents';
import StudentClubs from './pages/student/StudentClubs';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import StudentDiscussions from './pages/student/StudentDiscussions';
import StudentNotifications from './pages/student/StudentNotifications';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyStudents from './pages/faculty/FacultyStudents';
import FacultyEvents from './pages/faculty/FacultyEvents';
import FacultyAnnouncements from './pages/faculty/FacultyAnnouncements';
import FacultyDiscussions from './pages/faculty/FacultyDiscussions';
import FacultyNotifications from './pages/faculty/FacultyNotifications';
import FacultyProfile from './pages/faculty/FacultyProfile';

// HOD Pages
import HodDashboard from './pages/hod/HodDashboard';
import HodStudents from './pages/hod/HodStudents';
import HodFaculty from './pages/hod/HodFaculty';
import HodClubs from './pages/hod/HodClubs';
import HodEvents from './pages/hod/HodEvents';
import HodAnnouncements from './pages/hod/HodAnnouncements';
import HodAnalytics from './pages/hod/HodAnalytics';
import HodProfile from './pages/hod/HodProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminClubs from './pages/admin/AdminClubs';
import AdminEvents from './pages/admin/AdminEvents';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

// Fallback dynamic redirect component based on authenticated role
function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDashboardRoute(user.role)} replace />;
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Blue Sidebar — full height */}
      {!isAuthPage && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Right column: navbar + content + right panel */}
      <div className={`flex-1 flex flex-col min-h-screen ${!isAuthPage ? 'lg:pl-64' : ''}`}>
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-5 sm:p-6 lg:p-8">
          <div className="w-full max-w-5xl mx-auto">
              <Routes>
                {/* Root / Default Redirect based on role */}
                <Route path="/" element={<RoleRedirect />} />

                {/* Public Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Shared Detail Pages (Accessible across authorized roles) */}
                <Route
                  path="/clubs/:id"
                  element={
                    <ProtectedRoute>
                      <ClubDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <ProtectedRoute>
                      <EventDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/discussions/:id"
                  element={
                    <ProtectedRoute>
                      <DiscussionDetails />
                    </ProtectedRoute>
                  }
                />

                {/* =========================================
                    STUDENT ROLE ROUTES (/student/*)
                    ========================================= */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/events"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/clubs"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentClubs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/announcements"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentAnnouncements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/discussions"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDiscussions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/notifications"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentNotifications />
                    </ProtectedRoute>
                  }
                />

                {/* =========================================
                    FACULTY ROLE ROUTES (/faculty/*)
                    ========================================= */}
                <Route
                  path="/faculty/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['faculty']}>
                      <FacultyDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/profile"
                  element={
                    <ProtectedRoute allowedRoles={['faculty']}>
                      <FacultyProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/students"
                  element={
                    <ProtectedRoute allowedRoles={['faculty']}>
                      <FacultyStudents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/events"
                  element={
                    <ProtectedRoute allowedRoles={['faculty']}>
                      <FacultyEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/announcements"
                  element={
                    <ProtectedRoute allowedRoles={['faculty']}>
                      <FacultyAnnouncements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/discussions"
                  element={
                    <ProtectedRoute allowedRoles={['faculty']}>
                      <FacultyDiscussions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty/notifications"
                  element={
                    <ProtectedRoute allowedRoles={['faculty']}>
                      <FacultyNotifications />
                    </ProtectedRoute>
                  }
                />

                {/* =========================================
                    HOD ROLE ROUTES (/hod/*)
                    ========================================= */}
                <Route
                  path="/hod/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['hod']}>
                      <HodDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hod/students"
                  element={
                    <ProtectedRoute allowedRoles={['hod']}>
                      <HodStudents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hod/faculty"
                  element={
                    <ProtectedRoute allowedRoles={['hod']}>
                      <HodFaculty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hod/clubs"
                  element={
                    <ProtectedRoute allowedRoles={['hod']}>
                      <HodClubs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hod/events"
                  element={
                    <ProtectedRoute allowedRoles={['hod']}>
                      <HodEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hod/announcements"
                  element={
                    <ProtectedRoute allowedRoles={['hod']}>
                      <HodAnnouncements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hod/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['hod']}>
                      <HodAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hod/profile"
                  element={
                    <ProtectedRoute allowedRoles={['hod']}>
                      <HodProfile />
                    </ProtectedRoute>
                  }
                />

                {/* =========================================
                    ADMIN ROLE ROUTES (/admin/*)
                    ========================================= */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/clubs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminClubs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/announcements"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminAnnouncements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all Route: Redirect to Role Dashboard */}
                <Route path="*" element={<RoleRedirect />} />
              </Routes>
            </div>
          </main>
      </div>

      {/* Standalone floating notification button at bottom right */}
      {!isAuthPage && <FloatingNotification />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <MainLayout />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
