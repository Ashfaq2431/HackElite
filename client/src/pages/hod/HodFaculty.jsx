import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Mail, Award, BookOpen } from 'lucide-react';

export default function HodFaculty() {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/department/faculty', {
        params: { search: search || undefined },
      });
      if (res.data.success) {
        setFaculty(res.data.faculty);
      }
    } catch (err) {
      console.error('Failed to load faculty', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-600" /> {user?.department} – Faculty Roster
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Academic teaching staff, lab instructors, and research advisors in your department
        </p>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading department faculty...</p>
        </div>
      ) : faculty.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
          <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <h3 className="font-bold text-slate-700">No Faculty Found</h3>
          <p className="text-xs mt-1">No faculty members are currently assigned to this department.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculty.map((fac) => (
            <div
              key={fac._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-purple-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={fac.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fac.name}`}
                    alt={fac.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/20"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">{fac.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" /> {fac.email}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      {fac.year || 'Associate Professor'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {fac.bio || 'Faculty advisor and academic instructor.'}
                </p>

                {fac.skills && fac.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {fac.skills.map((sk, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Faculty ID: {fac.studentId || 'N/A'}</span>
                <span className="font-bold text-purple-700">Authorized</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
