import React from 'react';
import { FamilyProfileConsent } from '../../types';
import { ShieldCheck, Lock, Eye, AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  consent: FamilyProfileConsent;
  onUpdateConsent: (updated: FamilyProfileConsent) => void;
}

export const ConsentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  consent,
  onUpdateConsent
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Privacy & Explicit Consent Shield
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Minimal data principle: You control what Gemini sees
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

        {/* Core Principles */}
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-900 dark:text-white">Data Minimization:</strong> No direct identifiers are transmitted. Optional sensitive family profile flags are shared with Gemini only after explicit consent. No personal names, phone numbers, or exact street addresses are ever stored or sent.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Eye className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-900 dark:text-white">Backend Isolation:</strong> All Google Gemini API keys reside exclusively in secure backend server environment variables. Client browsers never possess API credentials.
            </span>
          </div>
        </div>

        {/* Master Consent Toggle */}
        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 cursor-pointer">
          <input
            data-testid="master-consent-toggle"
            type="checkbox"
            checked={consent.consentGranted}
            onChange={(e) => onUpdateConsent({ ...consent, consentGranted: e.target.checked })}
            className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
          />
          <div>
            <div className="text-xs font-bold text-brand-900 dark:text-brand-200">
              Enable Personalized AI Clean-Air Action Plans
            </div>
            <div className="text-[11px] text-brand-700 dark:text-brand-300 mt-0.5">
              Allow Gemini AI to consider the family vulnerability profile below to calibrate safety advice.
            </div>
          </div>
        </label>

        {/* Granular Family Profile Flags */}
        <div className={`space-y-2.5 transition-opacity ${consent.consentGranted ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Family Profile Flags (Optional)
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={consent.hasInfantOrChild ?? false}
              onChange={(e) => onUpdateConsent({ ...consent, hasInfantOrChild: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
            />
            <span>Family includes infants or school-going children (higher respiratory rate)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={consent.hasElderly ?? false}
              onChange={(e) => onUpdateConsent({ ...consent, hasElderly: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
            />
            <span>Family includes senior citizens (cardiovascular & cerebrovascular risk)</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={consent.hasAsthmaOrRespiratory ?? false}
              onChange={(e) => onUpdateConsent({ ...consent, hasAsthmaOrRespiratory: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
            />
            <span>Member has asthma, bronchitis, COPD, or allergic rhinitis</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex justify-end">
          <button
            data-testid="save-privacy-btn"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-md"
          >
            Save Privacy Settings
          </button>
        </div>

      </div>
    </div>
  );
};
