import React from 'react';
import { WeatherContext, LowestPm25WindowForecast, CleanestWindowForecast } from '../../types';
import { Thermometer, Droplets, Wind, Layers, AlertCircle, Sun } from 'lucide-react';

interface Props {
  weather: WeatherContext;
  lowestPm25Window?: LowestPm25WindowForecast;
  cleanestWindowToday?: CleanestWindowForecast;
}

export const WeatherCard: React.FC<Props> = ({ weather, lowestPm25Window, cleanestWindowToday }) => {
  const getDispersionBadge = (risk: string) => {
    switch (risk) {
      case 'Very Poor':
        return 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border-rose-300 dark:border-rose-800';
      case 'Poor':
        return 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200 border-orange-300 dark:border-orange-800';
      case 'Moderate':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800';
    }
  };

  const dispersionExplanations: Record<string, string> = {
    'Very Poor': 'A shallow boundary mixing layer (< 180m) and calm winds (< 4 km/h) constrain vertical particulate dispersion. Surface vehicular exhaust and smoke remain trapped near ground level.',
    'Poor': 'Cold surface temperatures and light winds restrict boundary layer mixing. Particulates accumulate near street corridors.',
    'Moderate': 'Moderate atmospheric mixing height. Particulate dilution increases during daytime solar convection.',
    'Favorable': 'Active atmospheric mixing layer (> 800m) and convective turbulence promoting vertical dilution of ground-level pollutants.'
  };

  return (
    <div className="glass-card p-5 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Atmospheric Dispersion Potential & Meteorology
          </h3>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getDispersionBadge(weather.dispersionPotential)}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Dispersion Potential: {weather.dispersionPotential}</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
        {dispersionExplanations[weather.dispersionPotential] || dispersionExplanations.Moderate}
      </p>

      {/* Scientific Qualifier Notice */}
      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
        * {weather.dispersionQualifier}
      </div>

      {/* Dynamic Lowest PM2.5 Window Banner (Concentration and Window only; no short-duration CPCB AQI calculated) */}
      {(lowestPm25Window || cleanestWindowToday) && (() => {
        const win = lowestPm25Window || cleanestWindowToday!;
        return (
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-2.5">
            <Sun className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-teal-900 dark:text-teal-200 flex flex-wrap items-center gap-2">
                <span>Lowest PM2.5 Forecast Window: {win.timeWindow}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-200 dark:bg-teal-800 text-teal-900 dark:text-teal-100">
                  Predicted PM2.5: ~{win.predictedPm25} µg/m³
                </span>
              </div>
              <div className="text-teal-800 dark:text-teal-300 font-medium">
                {win.rationale}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 italic pt-0.5">
                Note: This 2-hour model forecast window displays predicted PM2.5 particulate concentration in µg/m³ based on diurnal atmospheric mixing. It does NOT calculate a short-duration CPCB AQI or category, which officially require 24-hour multi-pollutant regulatory monitoring.
              </div>
              <div className="text-[10px] text-slate-400 italic">
                Limitation: {win.limitations}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Grid of Weather Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Thermometer className="w-4 h-4 text-amber-500" />
            <span>Temperature</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {weather.temperature}°C
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span>Rel. Humidity</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {weather.humidity}%
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Wind className="w-4 h-4 text-teal-500" />
            <span>Surface Wind</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {weather.windSpeed} <span className="text-xs font-semibold text-slate-400">km/h</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Mixing Layer (h)</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {weather.boundaryLayerHeight ?? 450} <span className="text-xs font-semibold text-slate-400">m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
