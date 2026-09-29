import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, GraduationCap, Award, Hash, Mail } from 'lucide-react';

export default function FacultyStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/department/students', {
        params: {
          search: search || undefined,
          year: yearFilter !== 'All' ? yearFilter : undefined,
        },
      });
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Failed to load department students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [yearFilter]);

  const years = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate / PhD'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" /> Department Student Directory
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Authorized roster of students enrolled in {user?.department}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search students by name, email, or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              Year: {y}
            </option>
          ))}
        </select>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading student directory...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-slate-700">No Students Found</h3>
          <p className="text-xs mt-1">No enrolled students match your query in this department.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((stu) => (
            <div
              key={stu._id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={stu.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stu.name}`}
                    alt={stu.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/20"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{stu.name}</h3>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {stu.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Class Year:</span>
                    <span className="font-bold">{stu.year}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Roll ID:</span>
                    <span className="font-mono font-medium">{stu.studentId || 'N/A'}</span>
                  </div>
                </div>

                {stu.skills && stu.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {stu.skills.slice(0, 3).map((sk, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {sk}
                      </span>
                    ))}
                    {stu.skills.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{stu.skills.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{stu.joinedClubs?.length || 0} Clubs</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                  Enrolled
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
