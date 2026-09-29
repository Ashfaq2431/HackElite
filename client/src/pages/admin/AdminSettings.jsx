import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, CheckCircle, Save } from 'lucide-react';

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    collegeName: 'Apex Institute of Engineering & Technology',
    academicYear: '2025–2026',
    allowStudentClubCreation: false,
    requireHodApproval: true,
    notificationEmails: true,
    maintenanceMode: false,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Global configuration and institutional policy controls.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4" /> Platform settings updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Institution Details</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Institution Name</label>
            <input
              type="text"
              value={config.collegeName}
              onChange={(e) => setConfig({ ...config, collegeName: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Active Academic Session</label>
            <input
              type="text"
              value={config.academicYear}
              onChange={(e) => setConfig({ ...config, academicYear: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Governance & Approval Policies</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-800">Require HOD Event Approval</p>
                <p className="text-xs text-slate-400">Events submitted by faculty/students require approval before publishing</p>
              </div>
              <input
                type="checkbox"
                checked={config.requireHodApproval}
                onChange={(e) => setConfig({ ...config, requireHodApproval: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-800">Allow Direct Student Club Creation</p>
                <p className="text-xs text-slate-400">Enable students to propose new clubs without prior administrative registration</p>
              </div>
              <input
                type="checkbox"
                checked={config.allowStudentClubCreation}
                onChange={(e) => setConfig({ ...config, allowStudentClubCreation: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-800">Platform Maintenance Mode</p>
                <p className="text-xs text-slate-400">Temporarily restrict student access for maintenance windows</p>
              </div>
              <input
                type="checkbox"
                checked={config.maintenanceMode}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition shadow-sm"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </form>
    </div>
  );
}
