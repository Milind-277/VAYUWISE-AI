import React from 'react';
import { DailyFamilyActionPlan } from '../../types';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Sun, 
  Briefcase, 
  Home, 
  Moon, 
  X, 
  Printer, 
  Share2 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: DailyFamilyActionPlan | null;
  loading: boolean;
}

export const ActionPlanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  plan,
  loading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Personalized Family Clean-Air Action Plan
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                  {plan?.status === 'success' ? 'Gemini 2.5 Grounded' : 'Expert Protocol'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Grounded in real-time air metrics for {plan?.city || 'your area'} (AQI: {plan?.currentAqi || '--'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Gemini AI is analyzing atmospheric boundary layers and family protocols...
            </div>
            <div className="text-xs text-slate-400">
              Minimizing personal data payload & validating WHO indoor air safety parameters
            </div>
          </div>
        ) : plan ? (
          <div className="space-y-4">
            
            {/* Overview Banner */}
            <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60">
              <div className="text-xs font-bold text-brand-800 dark:text-brand-300 uppercase tracking-wider mb-1">
                Executive Family Summary
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {plan.summaryGuidance}
              </p>
            </div>

            {/* Plan Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Morning Window */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Sun className="w-4 h-4" />
                  <span>Morning Window & Ventilation</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Window: {plan.morningWindow.recommendedTime}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {plan.morningWindow.advice}
                </p>
                <div className="pt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    Ventilation: {plan.morningWindow.ventilationStatus}
                  </span>
                </div>
              </div>

              {/* Commute Plan */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Briefcase className="w-4 h-4" />
                  <span>Transit & Commute Shield</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Mode: {plan.commutePlan.safeTravelMode}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  PPE: {plan.commutePlan.ppeRecommendation}
                </p>
                <div className="text-[11px] text-slate-500 italic">
                  {plan.commutePlan.notes}
                </div>
              </div>

              {/* Indoor Clean Air */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Home className="w-4 h-4" />
                  <span>Indoor Environment Setup</span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <strong>Filtration:</strong> {plan.indoorAirPlan.purificationSetting}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <strong>Cleaning:</strong> {plan.indoorAirPlan.cleaningTechnique}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <strong>Cooking:</strong> {plan.indoorAirPlan.cookingPrecaution}
                </div>
              </div>

              {/* Evening Routine */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <Moon className="w-4 h-4" />
                  <span>Evening & Sensitive Groups</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {plan.eveningRoutine.outdoorSafety}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <strong>Vulnerable:</strong> {plan.eveningRoutine.childrenElderlyProtocol}
                </p>
              </div>

            </div>

            {/* Cautionary Warnings */}
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-1">
              <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Safety Directives</span>
              </div>
              <ul className="list-disc list-inside text-xs text-rose-900 dark:text-rose-200 space-y-1 font-medium">
                {plan.cautionaryNotes.map((note, nIdx) => (
                  <li key={nIdx}>{note}</li>
                ))}
              </ul>
            </div>

            {/* Print / Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-400 font-medium">
                Ground Source: {plan.sourceAttribution}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Plan</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};
