import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Mail, Hash, CheckCircle, Shield } from 'lucide-react';

export default function HodStudents() {
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

  const years = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-600" /> {user?.department} – Student Roster
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          HOD administrative overview of students enrolled in your department
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search students by name, email, or roll ID..."
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

      {/* Students Table */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading student directory...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-slate-700">No Department Students</h3>
          <p className="text-xs mt-1">No enrolled students found matching this criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Roll ID</th>
                <th className="px-6 py-4">Class Year</th>
                <th className="px-6 py-4">Clubs Joined</th>
                <th className="px-6 py-4">Skills & Focus</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((stu) => (
                <tr key={stu._id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={stu.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stu.name}`}
                        alt={stu.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{stu.name}</p>
                        <p className="text-slate-400 text-[11px]">{stu.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium">{stu.studentId || 'N/A'}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{stu.year}</td>
                  <td className="px-6 py-4">{stu.joinedClubs?.length || 0} Clubs</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {stu.skills?.slice(0, 2).map((sk, idx) => (
                        <span key={idx} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Enrolled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
