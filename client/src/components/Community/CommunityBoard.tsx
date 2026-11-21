import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { CommunityPledge } from '../../types';
import { 
  Users, 
  Flame, 
  Leaf, 
  CheckCircle, 
  ShieldAlert, 
  PlusCircle, 
  Info 
} from 'lucide-react';

export const CommunityBoard: React.FC = () => {
  const [pledges, setPledges] = useState<CommunityPledge[]>([]);
  const [reportGuide, setReportGuide] = useState<any>(null);
  const [totalActions, setTotalActions] = useState<number>(2835);
  const [totalCo2Saved, setTotalCo2Saved] = useState<number>(9420);
  const [openBurningReports, setOpenBurningReports] = useState<number>(64);
  const [joinedPledges, setJoinedPledges] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('vayuwise_joined_pledges');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {};
  });

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportCity, setReportCity] = useState('');
  const [reportLocation, setReportLocation] = useState('');
  const [incidentType, setIncidentType] = useState('Open Garbage Fire');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchBoard = async () => {
      try {
        const res = await ApiService.getCommunityBoard();
        if (mounted) {
          setPledges(res.data.pledges);
          setTotalActions(res.data.totalActionsCompletedThisWeek);
          setTotalCo2Saved(res.data.totalKgCo2SavedThisWeek);
          setOpenBurningReports(res.data.openBurningReportsLogged);
          setReportGuide(res.reportGuide);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBoard();
    return () => { mounted = false; };
  }, []);

  const handleJoinPledge = async (pledgeId: string) => {
    try {
      const res = await ApiService.joinPledge(pledgeId);
      if (res.success) {
        const updated = { ...joinedPledges, [pledgeId]: true };
        setJoinedPledges(updated);
        localStorage.setItem('vayuwise_joined_pledges', JSON.stringify(updated));
        setPledges(prev => prev.map(p => p.id === pledgeId ? res.updatedPledge : p));
        setTotalActions(res.totalCommunityActions);
        if (res.updatedPledge.co2SavingsEstimateKgPerWeek) {
          setTotalCo2Saved(prev => prev + Math.round(res.updatedPledge.co2SavingsEstimateKgPerWeek));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportLocation.trim()) return;
    setSubmittingReport(true);
    try {
      const res = await ApiService.reportIncident(reportCity, reportLocation, incidentType);
      setReportSuccessMsg(res.message);
      setOpenBurningReports(res.totalReportsLogged);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccessMsg('');
        setReportLocation('');
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Banner with Explicit Demonstration Label */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent border border-teal-200 dark:border-teal-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-teal-600 text-white uppercase tracking-wider">
                Module 7
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 uppercase tracking-wider">
                Demonstration Simulation
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Community Clean-Air Action Board
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
              Join neighborhood clean-air pledges, advocate for school zero-idling zones, and learn how to report illegal open garbage fires via official CPCB nodal channels.
            </p>
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center gap-2 shrink-0 transition-all hover:scale-[1.02]"
          >
            <Flame className="w-4 h-4" />
            <span>Report Open Burning Fire</span>
          </button>
        </div>

        {/* Civic Integrity Notice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-600 shrink-0" />
          <span>
            <strong>Civic Integrity Notice:</strong> Community counters below represent interactive demonstration indicators for educational awareness. Real municipal grievance reporting requires filing directly via the official CPCB SAMEER app.
          </span>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="p-3 bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Simulated Weekly Actions
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {totalActions.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Estimated CO₂e Saved
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                {totalCo2Saved.toLocaleString()} kg
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Burning Incidents Tracked
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {openBurningReports}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pledges Grid */}
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
          Neighborhood Clean-Air Commitments
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pledges.map((pledge) => {
            const hasJoined = joinedPledges[pledge.id];

            return (
              <div
                key={pledge.id}
                className="glass-card p-5 rounded-2xl flex flex-col justify-between border border-slate-200 dark:border-slate-800 hover:border-brand-400 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {pledge.badge}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {pledge.participantsCount} Citizens Pledged
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {pledge.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                    {pledge.description}
                  </p>

                  {pledge.co2SavingsEstimateKgPerWeek && (
                    <div className="mt-3 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5" />
                      <span>~{pledge.co2SavingsEstimateKgPerWeek} kg CO₂e avoided / week</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    data-testid="join-pledge-btn"
                    onClick={() => handleJoinPledge(pledge.id)}
                    disabled={hasJoined}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      hasJoined
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 cursor-default'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                    }`}
                  >
                    {hasJoined ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Pledge Committed (Saved Locally)</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Take This Pledge</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Open Burning Reporting Guide */}
      {reportGuide && (
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {reportGuide.title}
            </h3>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {reportGuide.legalContext}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {reportGuide.actionSteps.map((stepItem: any, sIdx: number) => (
              <div
                key={sIdx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center mb-2">
                    {stepItem.step}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {stepItem.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                    {stepItem.details}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-medium">
            <strong>Safety Precaution:</strong> {reportGuide.safetyPrecaution}
          </div>
        </div>
      )}

      {/* Incident Reporting Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Report Open Burning / Dust Incident
                </h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {reportSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-100 font-medium space-y-2">
                <div className="font-bold text-sm">✓ Incident Recorded in Local Watchdog Registry</div>
                <div>{reportSuccessMsg}</div>
              </div>
            ) : (
              <form onSubmit={handleSubmitIncident} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">City / District</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi NCR, Pune, Mumbai"
                    value={reportCity}
                    onChange={(e) => setReportCity(e.target.value)}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Exact Location / Landmark</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Near Sector 14 market gate / Ring Road flyover"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Incident Category</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="Open Garbage Fire">Open Garbage Fire</option>
                    <option value="Dry Leaves / Biomass Burning">Dry Leaves / Biomass Burning</option>
                    <option value="Plastic / Cable Burning">Plastic / Cable Burning (Hazardous)</option>
                    <option value="Uncovered Construction Dust">Uncovered Construction Dust</option>
                    <option value="Vehicular Smoke / Commercial Idling">Vehicular Heavy Idling</option>
                  </select>
                </div>

                <p className="text-[11px] text-slate-500 font-medium">
                  Note: Submissions here are registered in the community demonstration log. To trigger immediate official municipal dispatch, please also submit via the CPCB SAMEER app.
                </p>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                  >
                    {submittingReport ? 'Submitting...' : 'Log Incident'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
