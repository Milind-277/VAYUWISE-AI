import React from 'react';
import { DailyForecastPoint } from '../../types';
import { Calendar, ShieldAlert } from 'lucide-react';

interface Props {
  dailyData: DailyForecastPoint[];
}

export const DailyForecastCard: React.FC<Props> = ({ dailyData }) => {
  if (!dailyData || dailyData.length === 0) return null;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Good':
        return 'bg-emerald-500 text-white';
      case 'Satisfactory':
        return 'bg-lime-500 text-slate-900';
      case 'Moderate':
        return 'bg-amber-500 text-slate-900';
      case 'Poor':
        return 'bg-orange-500 text-white';
      case 'Very Poor':
        return 'bg-red-600 text-white';
      case 'Severe':
      default:
        return 'bg-rose-900 text-white';
    }
  };

  return (
    <div className="glass-card p-5 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          7-Day Urban Air Outlook
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {dailyData.map((day, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col justify-between hover:border-brand-500/50 transition-all text-center"
          >
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {day.dayName}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {day.date}
              </div>

              <div className="my-2.5">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getCategoryColor(day.category)}`}>
                  {day.category}
                </span>
              </div>

              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {day.avgAqi}
              </div>
              <div className="text-[10px] text-slate-400">
                Range: {day.minAqi} - {day.maxAqi}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 text-left">
              {day.summary}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
