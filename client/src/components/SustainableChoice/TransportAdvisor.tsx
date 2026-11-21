import React, { useState, useEffect } from 'react';
import { TransportMode } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Compass, 
  Bike, 
  Bus, 
  Train, 
  Car, 
  Zap, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface Props {
  currentAqi: number;
}

export const TransportAdvisor: React.FC<Props> = ({ currentAqi }) => {
  const [modes, setModes] = useState<TransportMode[]>([]);
  const [cleanCooking, setCleanCooking] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'transport' | 'cooking'>('transport');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchModes = async () => {
      try {
        const data = await ApiService.getTransportModes();
        if (mounted) {
          setModes(data.modes);
          setCleanCooking(data.cleanEnergyOptions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchModes();
    return () => { mounted = false; };
  }, []);

  const getAqiSensitivity = (modeId: string) => {
    if (currentAqi > 200) {
      if (modeId === 'bicycle' || modeId === 'walking') {
        return {
          status: 'Restricted / High Risk',
          color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
          advice: 'Vigorous aerobic exertion significantly elevates minute ventilation and deep pulmonary particle intake (typically 2–4x resting minute ventilation depending on exertion rate, WHO Air Quality Guidelines 2021). Switch to Metro Rail or avoid heavy outdoor cardio during severe smog episodes.'
        };
      }
      if (modeId === 'petrol_two_wheeler' || modeId === 'electric_two_wheeler') {
        return {
          status: 'N95 Respirator Required',
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
          advice: 'Open riders breathe localized tailpipe emissions directly behind diesel trucks. Wear a certified N95 with continuous nose wire seal.'
        };
      }
      if (modeId === 'metro_rail') {
        return {
          status: 'Top Recommended Transit',
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
          advice: 'Zero street pollution + air-conditioned carriages with multi-stage filtration protect riders from ambient street smog.'
        };
      }
    }

    return {
      status: 'Suitable',
      color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
      advice: 'Normal precautions apply. Prefer mass transit to decongest urban corridors.'
    };
  };

  const getModeIcon = (id: string) => {
    switch (id) {
      case 'metro_rail': return Train;
      case 'city_bus': return Bus;
      case 'bicycle': return Bike;
      case 'electric_two_wheeler':
      case 'electric_car': return Zap;
      default: return Car;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent border border-blue-200 dark:border-blue-800/60">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white uppercase tracking-wider">
            Module 4
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Sourced Lifecycle & Health Comparison
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Sustainable Choice Advisor
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
          Compare private vehicles, mass transit, active mobility, and clean household energy options. Receive real-time recommendations tailored to today's local pollution index.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('transport')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transport'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Urban Mobility & Commute Modes
        </button>
        <button
          onClick={() => setActiveTab('cooking')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cooking'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Clean Cooking & Energy Alternatives
        </button>
      </div>

      {/* Transport Tab */}
      {activeTab === 'transport' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modes.map((mode) => {
            const Icon = getModeIcon(mode.id);
            const sensitivity = getAqiSensitivity(mode.id);

            return (
              <div
                key={mode.id}
                className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:border-blue-400 transition-all border border-slate-200 dark:border-slate-800"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sensitivity.color}`}>
                      {sensitivity.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {mode.name}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {mode.emissionFactorGCo2PerPassKm ?? mode.emissionFactorGCo2ePerPassKm}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {mode.factorUnit || 'g CO₂ / passenger-km'}
                    </span>
                    {mode.assumedOccupancy && (
                      <span className="ml-auto text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {mode.vehicleKmFactorGCo2 
                          ? `${mode.vehicleKmFactorGCo2} g/veh-km ÷ ${mode.assumedOccupancy} pass` 
                          : `Occupancy: ${mode.assumedOccupancy} pass`}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2 leading-relaxed">
                    {mode.suitabilityRule}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <span className="font-bold text-blue-600 dark:text-blue-400">Current AQI Advisory: </span>
                    {sensitivity.advice}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    Source: {mode.sourceDocument ? `${mode.organization} (${mode.publicationYear}) - ${mode.sourceDocument}` : mode.source}
                  </div>
                  {mode.calculationNotes && (
                    <div className="text-slate-400 italic">
                      Methodology: {mode.calculationNotes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cooking Tab */}
      {activeTab === 'cooking' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cleanCooking.map((item, idx) => (
            <div
              key={idx}
              className={`glass-card p-5 rounded-2xl flex flex-col justify-between border ${
                item.category === 'clean' 
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20' 
                  : (item.category === 'polluting' ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800')
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.category === 'clean'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : (item.category === 'polluting' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800')
                  }`}>
                    {item.category} Energy
                  </span>
                  <Flame className={`w-4 h-4 ${item.category === 'clean' ? 'text-emerald-500' : 'text-rose-500'}`} />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {item.fuel}
                </h3>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-500">Indoor Emissions: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.indoorPm25Emissions}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Thermal Efficiency: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.co2Efficiency}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-medium pt-1">
                    {item.healthImpact}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-brand-700 dark:text-brand-300">
                {item.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
