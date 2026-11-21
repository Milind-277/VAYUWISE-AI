import React, { useState, useEffect } from 'react';
import { RoutineSlot } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  BookOpen, 
  Activity, 
  GraduationCap, 
  Briefcase, 
  Sun, 
  Moon, 
  ShieldCheck 
} from 'lucide-react';

interface Props {
  currentAqi: number;
  dispersionPotential: string;
  city: string;
  cleanestWindow?: string;
}

export const RoutinePlanner: React.FC<Props> = ({ 
  currentAqi, 
  dispersionPotential, 
  city,
  cleanestWindow = '12:30 PM – 3:30 PM' 
}) => {
  const [slots, setSlots] = useState<RoutineSlot[]>([]);
  const [diurnalSummary, setDiurnalSummary] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'exercise' | 'school' | 'commute' | 'outdoor_work'>('all');

  useEffect(() => {
    let mounted = true;
    const fetchRoutine = async () => {
      try {
        const data = await ApiService.getRoutineRecommendations(currentAqi, dispersionPotential, city, cleanestWindow);
        if (mounted) {
          setSlots(data.slots);
          setDiurnalSummary(data.diurnalSummary);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoutine();
    return () => { mounted = false; };
  }, [currentAqi, dispersionPotential, city, cleanestWindow]);

  const getStatusBadge = (status: RoutineSlot['recommendedStatus']) => {
    switch (status) {
      case 'Optimal':
        return {
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
          icon: CheckCircle,
          label: 'Optimal Window'
        };
      case 'Caution':
        return {
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
          icon: AlertTriangle,
          label: 'Caution / Mask Required'
        };
      case 'Avoid':
      default:
        return {
          bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
          icon: XCircle,
          label: 'Hazardous / Stay Indoors'
        };
    }
  };

  const getCategoryIcon = (cat: RoutineSlot['category']) => {
    switch (cat) {
      case 'exercise': return Activity;
      case 'school': return GraduationCap;
      case 'commute': return Briefcase;
      case 'outdoor_work': return Sun;
      default: return Moon;
    }
  };

  const filteredSlots = selectedFilter === 'all' 
    ? slots 
    : slots.filter(s => s.category === selectedFilter);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-teal-500/10 via-brand-500/10 to-transparent border border-brand-200 dark:border-brand-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-brand-500 text-white uppercase tracking-wider">
                Module 2
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Hourly Forecast & MoHFW Health Advisories
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Location-Aware Smart Daily Routine
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
              Diurnal boundary layer dynamics cause surface air quality to vary through the day. Activity recommendations below are dynamically generated from today's hourly forecast and MoHFW health guidance.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
            <div className="text-xs text-slate-400 font-semibold uppercase">Lowest PM2.5 Forecast Window</div>
            <div className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">
              {cleanestWindow}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Atmospheric Dispersion: {dispersionPotential}
            </div>
          </div>
        </div>

        {diurnalSummary && (
          <div className="mt-4 pt-4 border-t border-brand-200/60 dark:border-brand-800/40 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-600 shrink-0" />
            <span>{diurnalSummary}</span>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Activities' },
          { id: 'exercise', label: 'Exercise & Cardio' },
          { id: 'school', label: 'School Drop & Transit' },
          { id: 'commute', label: 'Office Commute' },
          { id: 'outdoor_work', label: 'Safest Outdoor Window' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedFilter === f.id
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Routine Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSlots.map((slot, idx) => {
          const status = getStatusBadge(slot.recommendedStatus);
          const StatusIcon = status.icon;
          const CategoryIcon = getCategoryIcon(slot.category);

          return (
            <div
              key={idx}
              className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all border border-slate-200 dark:border-slate-800"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400">
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {slot.activity}
                      </h3>
                      <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{slot.timeWindow}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border flex items-center gap-1 ${status.bg}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{status.label}</span>
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 mb-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Atmospheric Dispersion Rationale
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {slot.scientificReasoning}
                  </p>
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Actions
                  </div>
                  {slot.actionableGuidance.map((guide, gIdx) => (
                    <div key={gIdx} className="text-xs text-slate-700 dark:text-slate-200 font-medium flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                      <span>{guide}</span>
                    </div>
                  ))}
                </div>

                {slot.publicHealthGuideline && (
                  <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200 font-medium">
                    {slot.publicHealthGuideline}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Model Predicted AQI:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{slot.expectedAqiRange}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
