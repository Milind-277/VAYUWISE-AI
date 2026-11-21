import React from 'react';
import { AqiCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle, CheckCircle2, AlertTriangle, Flame, ShieldAlert, Info } from 'lucide-react';

interface Props {
  aqi: number;
  officialCpcbAqi: number | null;
  category: AqiCategory;
  dominantPollutant: string;
  sourceName: string;
  timestamp: string;
  meetsCpcbCriteria: boolean;
  cpcbStatusMessage: string;
}

export const AqiGauge: React.FC<Props> = ({
  aqi,
  officialCpcbAqi,
  category,
  dominantPollutant,
  sourceName,
  timestamp,
  meetsCpcbCriteria,
  cpcbStatusMessage
}) => {
  const { t } = useLanguage();

  const getCategoryTheme = (cat: AqiCategory) => {
    switch (cat) {
      case 'Good':
        return {
          bg: 'from-emerald-500/20 to-teal-500/5',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-300 dark:border-emerald-700',
          badge: 'bg-emerald-500 text-white',
          desc: 'Air quality is considered satisfactory; air pollution poses minimal or no health risk.',
          icon: CheckCircle2
        };
      case 'Satisfactory':
        return {
          bg: 'from-lime-500/20 to-emerald-500/5',
          text: 'text-lime-600 dark:text-lime-400',
          border: 'border-lime-300 dark:border-lime-700',
          badge: 'bg-lime-500 text-slate-900',
          desc: 'Minor breathing discomfort may be experienced by sensitive individuals.',
          icon: CheckCircle2
        };
      case 'Moderate':
        return {
          bg: 'from-amber-500/20 to-yellow-500/5',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-300 dark:border-amber-700',
          badge: 'bg-amber-500 text-slate-900',
          desc: 'Breathing discomfort possible for individuals with asthma, pulmonary or cardiac diseases.',
          icon: AlertCircle
        };
      case 'Poor':
        return {
          bg: 'from-orange-500/20 to-amber-500/5',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-300 dark:border-orange-700',
          badge: 'bg-orange-500 text-white',
          desc: 'Breathing discomfort on prolonged exposure to most people.',
          icon: AlertTriangle
        };
      case 'Very Poor':
        return {
          bg: 'from-red-500/20 to-orange-500/5',
          text: 'text-red-600 dark:text-red-400',
          border: 'border-red-300 dark:border-red-700',
          badge: 'bg-red-600 text-white',
          desc: 'Respiratory illness on prolonged exposure. Significant risk to children and elderly.',
          icon: Flame
        };
      case 'Severe':
      default:
        return {
          bg: 'from-rose-900/30 to-red-950/20',
          text: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-700 dark:border-rose-800',
          badge: 'bg-rose-900 text-white animate-pulse',
          desc: 'Affects healthy individuals and seriously impacts those with existing respiratory conditions.',
          icon: ShieldAlert
        };
    }
  };

  const theme = getCategoryTheme(category);
  const IconComponent = theme.icon;
  const progressPercent = Math.min(100, Math.round((aqi / 500) * 100));

  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className={`glass-card p-6 rounded-3xl bg-gradient-to-br ${theme.bg} border ${theme.border} relative overflow-hidden`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Main Display */}
        <div className="flex items-center gap-6">
          <div className="relative flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-slate-200 dark:border-slate-800 flex items-center justify-center relative shadow-inner">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className={`${theme.text} transition-all duration-1000 ease-out`}
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center px-2">
                <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {aqi}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center leading-tight mt-0.5">
                  {officialCpcbAqi !== null ? 'CPCB NAQI' : 'MODEL FORECAST'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
                {officialCpcbAqi !== null 
                  ? (t.aqiCategories[category as keyof typeof t.aqiCategories] || category)
                  : `Forecast: ${t.aqiCategories[category as keyof typeof t.aqiCategories] || category}`}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <IconComponent className="w-3.5 h-3.5" />
                Updated: {formattedTime}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
              {officialCpcbAqi !== null 
                ? 'Official CPCB National AQI' 
                : 'Model-Derived Atmospheric Forecast Estimate'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md font-medium leading-relaxed">
              {theme.desc}
            </p>

            {officialCpcbAqi === null && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{cpcbStatusMessage || 'Insufficient data to calculate official CPCB AQI.'}</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  Forecast Source: <strong className="text-slate-900 dark:text-white">{sourceName || 'Copernicus CAMS / Open-Meteo'}</strong>.
                  Primary Forecast Pollutant: <strong className="text-slate-900 dark:text-white">{dominantPollutant}</strong>.
                  This indicative forecast estimate is derived from numerical dispersion models and must not be cited as an official regulatory station AQI.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dominant Pollutant & Standards Info */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[190px]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {officialCpcbAqi !== null ? t.dominantPollutant : 'Forecast Primary Driver'}
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-between">
              <span>{dominantPollutant}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold">
                {officialCpcbAqi !== null ? 'Primary Driver' : 'Forecast Driver'}
              </span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[190px]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Methodology Classification
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${meetsCpcbCriteria && officialCpcbAqi !== null ? 'bg-emerald-500' : 'bg-sky-500'}`} />
              <span>{meetsCpcbCriteria && officialCpcbAqi !== null ? 'Official CPCB NAQI (24h Station)' : 'Copernicus CAMS Model Estimate'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
