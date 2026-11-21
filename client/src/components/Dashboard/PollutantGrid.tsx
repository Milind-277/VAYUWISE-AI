import React from 'react';
import { PollutantBreakdown } from '../../types';

interface Props {
  pollutants: PollutantBreakdown;
}

interface PollutantMeta {
  key: keyof PollutantBreakdown;
  label: string;
  fullName: string;
  safeLimitCpcb: string;
  whoGuideline: string;
  primarySource: string;
}

const POLLUTANT_METADATA: PollutantMeta[] = [
  {
    key: 'pm2_5',
    label: 'PM2.5',
    fullName: 'Fine Inhalable Particles (≤ 2.5 µm)',
    safeLimitCpcb: '60 µg/m³ (24h)',
    whoGuideline: '15 µg/m³ (24h)',
    primarySource: 'Vehicle exhaust, biomass burning, coal thermal plants & road dust'
  },
  {
    key: 'pm10',
    label: 'PM10',
    fullName: 'Coarse Particulates (≤ 10 µm)',
    safeLimitCpcb: '100 µg/m³ (24h)',
    whoGuideline: '45 µg/m³ (24h)',
    primarySource: 'Construction dust, soil resuspension, mechanical abrasion'
  },
  {
    key: 'no2',
    label: 'NO2',
    fullName: 'Nitrogen Dioxide',
    safeLimitCpcb: '80 µg/m³ (24h)',
    whoGuideline: '25 µg/m³ (24h)',
    primarySource: 'High-temperature diesel combustion & urban traffic corridors'
  },
  {
    key: 'o3',
    label: 'O3',
    fullName: 'Ground-Level Ozone',
    safeLimitCpcb: '100 µg/m³ (8h)',
    whoGuideline: '100 µg/m³ (8h)',
    primarySource: 'Secondary smog produced by photochemical reaction of NOx and VOCs under sunlight'
  },
  {
    key: 'co',
    label: 'CO',
    fullName: 'Carbon Monoxide',
    safeLimitCpcb: '2.0 mg/m³ (8h)',
    whoGuideline: '4.0 mg/m³ (24h)',
    primarySource: 'Incomplete combustion in idling vehicle engines and chulhas'
  },
  {
    key: 'so2',
    label: 'SO2',
    fullName: 'Sulphur Dioxide',
    safeLimitCpcb: '80 µg/m³ (24h)',
    whoGuideline: '40 µg/m³ (24h)',
    primarySource: 'Coal power generation, diesel fuel, and industrial furnaces'
  }
];

export const PollutantGrid: React.FC<Props> = ({ pollutants }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Key Pollutants & Concentrations</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            (Micrograms per Cubic Meter)
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {POLLUTANT_METADATA.map((meta) => {
          const detail = pollutants[meta.key];
          const val = detail?.value ?? 0;
          const unit = detail?.unit ?? 'µg/m³';
          const subIndex = detail?.subIndex;

          // Color scale
          let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
          if (subIndex) {
            if (subIndex > 300) badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
            else if (subIndex > 200) badgeColor = 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300';
            else if (subIndex > 100) badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
            else badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
          }

          return (
            <div
              key={meta.key}
              className="glass-card p-4 rounded-2xl flex flex-col justify-between hover:border-brand-500/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {meta.label}
                  </span>
                  {subIndex !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
                      Sub-Index: {subIndex}
                    </span>
                  )}
                </div>

                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  {val} <span className="text-xs font-semibold text-slate-400">{unit}</span>
                </div>

                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1" title={meta.fullName}>
                  {meta.fullName}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>CPCB Standard:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{meta.safeLimitCpcb}</span>
                </div>
                <div className="text-slate-400 truncate" title={`Primary Source: ${meta.primarySource}`}>
                  {meta.primarySource}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
