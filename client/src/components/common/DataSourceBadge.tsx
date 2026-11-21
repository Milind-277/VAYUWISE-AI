import React from 'react';
import { DataSourceType } from '../../types';
import { ShieldCheck, CloudLightning, HelpCircle, AlertTriangle } from 'lucide-react';

interface Props {
  sourceType: DataSourceType;
  sourceName: string;
  isOfficial: boolean;
  meetsCpcbCriteria?: boolean;
}

export const DataSourceBadge: React.FC<Props> = ({
  sourceType,
  sourceName,
  isOfficial,
  meetsCpcbCriteria
}) => {
  if (sourceType === 'OBSERVED' && isOfficial) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-sm" title="Real-time continuous regulatory monitoring station">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>OBSERVED: {sourceName}</span>
        {meetsCpcbCriteria && (
          <span className="bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
            CPCB Verified
          </span>
        )}
      </div>
    );
  }

  if (sourceType === 'MODEL_FORECAST') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-700 shadow-sm" title="High-resolution atmospheric dispersion model forecast">
        <CloudLightning className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        <span>MODEL FORECAST: Open-Meteo / Copernicus CAMS</span>
        <span className="bg-sky-200 dark:bg-sky-800 text-sky-900 dark:text-sky-100 px-1.5 py-0.2 rounded text-[10px]">
          Simulated
        </span>
      </div>
    );
  }

  if (sourceType === 'DEMO') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-sm">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>DEMO / FALLBACK DATA</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
      <HelpCircle className="w-3.5 h-3.5" />
      <span>{sourceName}</span>
    </div>
  );
};
