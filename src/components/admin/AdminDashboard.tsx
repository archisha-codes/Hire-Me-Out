import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, Users, Building2, UserCheck, DollarSign, Settings, Award } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [rules, setRules] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form edit state
  const [pricingForm, setPricingForm] = useState({
    studentFee: 499,
    companySubMonthly: 9999,
    employeeRewardAmount: 3000,
    platformCommissionPercent: 20,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const mData = await api.getAdminAnalytics();
      setMetrics(mData.metrics);

      const rData = await api.getCommissionRules();
      setRules(rData.rule);
      if (rData.rule) {
        setPricingForm({
          studentFee: rData.rule.studentFee,
          companySubMonthly: rData.rule.companySubMonthly,
          employeeRewardAmount: rData.rule.employeeRewardAmount,
          platformCommissionPercent: rData.rule.platformCommissionPercent,
        });
      }

      const uData = await api.getUsersList();
      setUsers(uData.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateCommissionRules(pricingForm);
      alert('Monetization & Commission settings saved successfully!');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-950 via-slate-900 to-slate-950 p-6 border border-slate-800 flex items-center justify-between shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase">ADMIN PLATFORM CONTROL</span>
          <h1 className="text-2xl font-extrabold text-white">Platform Governance & Monetization</h1>
          <p className="text-xs text-slate-300">Oversee candidate verifications, company subscriptions, and commission settings.</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 block">Total Candidates</span>
          <span className="text-2xl font-bold text-white">{metrics?.totalStudents || 25}</span>
          <span className="text-emerald-400 text-[11px] block">{metrics?.verificationRate || 85}% Verification Rate</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 block">Recruiters & Companies</span>
          <span className="text-2xl font-bold text-brand-300">{metrics?.totalCompanies || 10}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 block">Employee Referrers</span>
          <span className="text-2xl font-bold text-cyan-400">{metrics?.totalEmployees || 20}</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 block">Platform Revenue</span>
          <span className="text-2xl font-bold text-emerald-400">₹{metrics?.totalRevenue || 284500}</span>
        </div>
      </div>

      {/* Pricing & Commission Config Editor */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-400" />
          <span>Configurable Monetization & Commission Rules</span>
        </h3>

        <form onSubmit={handleUpdatePricing} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-400">Student Verification Fee (₹)</label>
            <input
              type="number"
              value={pricingForm.studentFee}
              onChange={e => setPricingForm({ ...pricingForm, studentFee: parseFloat(e.target.value) || 0 })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-400">Company Sub Monthly (₹)</label>
            <input
              type="number"
              value={pricingForm.companySubMonthly}
              onChange={e => setPricingForm({ ...pricingForm, companySubMonthly: parseFloat(e.target.value) || 0 })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-400">Employee Referral Reward (₹)</label>
            <input
              type="number"
              value={pricingForm.employeeRewardAmount}
              onChange={e => setPricingForm({ ...pricingForm, employeeRewardAmount: parseFloat(e.target.value) || 0 })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-400">Platform Commission (%)</label>
            <input
              type="number"
              value={pricingForm.platformCommissionPercent}
              onChange={e => setPricingForm({ ...pricingForm, platformCommissionPercent: parseFloat(e.target.value) || 0 })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:border-brand-500 outline-none"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-600/30"
            >
              Save Pricing Settings
            </button>
          </div>
        </form>
      </div>

      {/* User Moderation Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-base">User Management & Accounts ({users.length})</h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950 font-mono">
                <th className="p-3">User Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((u, idx) => (
                <tr key={idx} className="hover:bg-slate-950/50">
                  <td className="p-3 font-semibold text-white">{u.name}</td>
                  <td className="p-3 text-slate-300 font-mono">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
