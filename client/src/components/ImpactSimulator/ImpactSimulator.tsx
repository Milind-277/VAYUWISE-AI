import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { Co2eCalculationResult, ExposureProxyResult } from '../../types';
import { 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Leaf, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  BookOpen 
} from 'lucide-react';

interface Props {
  currentAqi: number;
  currentPm25: number;
}

export const ImpactSimulator: React.FC<Props> = ({ currentAqi, currentPm25 }) => {
  // CO2e Simulator State
  const [distanceKm, setDistanceKm] = useState<number>(18);
  const [baselineMode, setBaselineMode] = useState<string>('petrol_car');
  const [alternativeMode, setAlternativeMode] = useState<string>('metro_rail');
  const [tripsPerWeek, setTripsPerWeek] = useState<number>(10);
  const [co2Result, setCo2Result] = useState<Co2eCalculationResult | null>(null);
  const [co2Loading, setCo2Loading] = useState(false);

  // Exposure Proxy Simulator State
  const [baselineConc, setBaselineConc] = useState<number>(currentPm25 > 0 ? Math.round(currentPm25 * 1.3) : 220);
  const [baselineHours, setBaselineHours] = useState<number>(1.5);
  const [optConc, setOptConc] = useState<number>(currentPm25 > 0 ? Math.round(currentPm25 * 0.7) : 80);
  const [optHours, setOptHours] = useState<number>(1.0);
  const [hasN95Mask, setHasN95Mask] = useState<boolean>(true);
  const [exposureResult, setExposureResult] = useState<ExposureProxyResult | null>(null);
  const [exposureLoading, setExposureLoading] = useState(false);

  // Recalculate CO2e on input changes
  useEffect(() => {
    let active = true;
    const calcCo2 = async () => {
      setCo2Loading(true);
      try {
        const res = await ApiService.calculateAvoidedCo2e(distanceKm, baselineMode, alternativeMode, tripsPerWeek);
        if (active) setCo2Result(res);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setCo2Loading(false);
      }
    };
    calcCo2();
    return () => { active = false; };
  }, [distanceKm, baselineMode, alternativeMode, tripsPerWeek]);

  // Recalculate Exposure Proxy on input changes
  useEffect(() => {
    let active = true;
    const calcExposure = async () => {
      setExposureLoading(true);
      try {
        const res = await ApiService.calculateExposureProxy(baselineConc, baselineHours, optConc, optHours, hasN95Mask);
        if (active) setExposureResult(res);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setExposureLoading(false);
      }
    };
    calcExposure();
    return () => { active = false; };
  }, [baselineConc, baselineHours, optConc, optHours, hasN95Mask]);

  return (
    <div className="space-y-6">
      
      {/* Module Banner */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-200 dark:border-amber-800/60">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white uppercase tracking-wider">
            Module 5
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Sourced Physics & Emissions Math
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          What-If Environmental Impact Simulator
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
          Quantify the concrete environmental and exposure outcomes of your family choices. All calculations are grounded in published emission factors from the India GHG Program (2015) and Central Electricity Authority (CEA) Baseline Database Version 22.0. No unsupported claims.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SIMULATOR 1: Transport CO2e Avoidance */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Transport CO₂e Avoided Calculator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Model emissions avoided by shifting from private vehicles to mass transit
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Baseline Mode</label>
                  <select
                    value={baselineMode}
                    onChange={(e) => setBaselineMode(e.target.value)}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="petrol_car">Private Petrol Sedan (&lt;1400cc, India GHG Program)</option>
                    <option value="diesel_car">Private Diesel Sedan (&lt;1600cc, India GHG Program)</option>
                    <option value="petrol_two_wheeler">Motorcycle (&lt;125cc, 10% uplift, India GHG Program)</option>
                    <option value="petrol_two_wheeler_200cc">Motorcycle (&lt;200cc, 10% uplift, India GHG Program)</option>
                    <option value="cng_auto">CNG Auto-Rickshaw (3-Wheeler, India GHG Program)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Sustainable Alternative</label>
                  <select
                    value={alternativeMode}
                    onChange={(e) => setAlternativeMode(e.target.value)}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="city_bus">Intracity Public Bus (SRTU Fleet Mix, India GHG Program)</option>
                    <option value="metro_rail">Metro Rail (Electric MRTS, Illustrative Traction Estimate)</option>
                    <option value="electric_two_wheeler">Electric Two-Wheeler (EV Scooter, CEA v22.0 Grid)</option>
                    <option value="bicycle">Bicycle / Walking (Zero Emissions)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">One-Way Distance: {distanceKm} km</label>
                  <input
                    type="range"
                    min={2}
                    max={50}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full mt-2 accent-brand-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Trips per Week: {tripsPerWeek}</label>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={tripsPerWeek}
                    onChange={(e) => setTripsPerWeek(Number(e.target.value))}
                    className="w-full mt-2 accent-brand-600"
                  />
                </div>
              </div>
            </div>

            {/* Results Display */}
            {co2Result && (
              <div className="mt-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Emissions Avoided
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                    {co2Result.percentageReduction}% Reduction
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Per Trip</div>
                    <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {co2Result.avoidedCo2eGramsPerTrip} g
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Weekly Total</div>
                    <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {co2Result.avoidedCo2eKgPerWeek} kg
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Annual Impact</div>
                    <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {co2Result.avoidedCo2eKgPerYear} kg
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium pt-1">
                  Formula: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">{co2Result.formula}</code>
                </div>

                {/* Sourced Assumptions & Citations Table */}
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 text-[10px] space-y-1 text-slate-600 dark:text-slate-400">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Published References & Occupancy Assumptions:
                  </div>
                  {co2Result.assumptions?.map((assump, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span className="text-emerald-600 dark:text-emerald-400">•</span>
                      <span>{assump}</span>
                    </div>
                  ))}
                  <div className="pt-1 text-[9px] text-slate-500 italic">
                    Sources: {co2Result.sources?.join(' | ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            Emission Factor Sources: India GHG Program (2015, Road Transport Technical Paper v1.0); Central Electricity Authority (CEA) CO2 Baseline Database v22.0 (August 2026, 0.675 kg CO2/kWh weighted average grid factor).
          </div>
        </div>

        {/* SIMULATOR 2: Outdoor PM2.5 Concentration-Time Exposure Proxy */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Outdoor PM2.5 Concentration-Time Exposure Proxy
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Primary ambient concentration-time duration index between morning stagnation and afternoon dispersion
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50">
                  <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase mb-1">
                    Morning Window (Inversion Peak)
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold">PM2.5: {baselineConc} µg/m³</span>
                      <input
                        type="range"
                        min={50}
                        max={450}
                        value={baselineConc}
                        onChange={(e) => setBaselineConc(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold">Duration: {baselineHours} hrs</span>
                      <input
                        type="range"
                        min={0.5}
                        max={4}
                        step={0.5}
                        value={baselineHours}
                        onChange={(e) => setBaselineHours(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50">
                  <div className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase mb-1">
                    Optimized Midday Window
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold">PM2.5: {optConc} µg/m³</span>
                      <input
                        type="range"
                        min={30}
                        max={250}
                        value={optConc}
                        onChange={(e) => setOptConc(Number(e.target.value))}
                        className="w-full accent-teal-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold">Duration: {optHours} hrs</span>
                      <input
                        type="range"
                        min={0.5}
                        max={4}
                        step={0.5}
                        value={optHours}
                        onChange={(e) => setOptHours(Number(e.target.value))}
                        className="w-full accent-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mask Checkbox (Clearly Separated Illustrative Scenario) */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasN95Mask}
                  onChange={(e) => setHasN95Mask(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Include Separate Illustrative N95 Mask Scenario (Disclosed 95% lab-media filter assumptions)
                </span>
              </label>
            </div>

            {/* Results Display */}
            {exposureResult && (
              <div className="mt-5 space-y-3">
                {/* Primary Ambient Exposure Proxy (Independent of Mask) */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      Primary Ambient Exposure Proxy (Unmasked)
                    </span>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                      {exposureResult.ambientReductionPercentage ?? exposureResult.reductionPercentage}% Ambient Index Reduction
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Baseline Morning</div>
                      <div className="text-base font-black text-rose-600 dark:text-rose-400 mt-0.5">
                        {exposureResult.baselineAmbientProxy ?? exposureResult.baselineIndex} <span className="text-[10px] text-slate-400">µg·h/m³</span>
                      </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Optimized Window</div>
                      <div className="text-base font-black text-teal-600 dark:text-teal-400 mt-0.5">
                        {exposureResult.optimizedAmbientProxy ?? exposureResult.optimizedIndex} <span className="text-[10px] text-slate-400">µg·h/m³</span>
                      </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Ambient Avoided</div>
                      <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {exposureResult.avoidedAmbientProxy ?? exposureResult.avoidedIndex} <span className="text-[10px] text-slate-400">µg·h/m³</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Formula: {exposureResult.formula}
                  </div>
                </div>

                {/* Separate Illustrative Mask Scenario (Only rendered if checkbox selected) */}
                {exposureResult.illustrativeMaskScenario && (
                  <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                        Separate Illustrative Lab-Media Filter Scenario
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100">
                        Theoretical Lab Media: ~{exposureResult.illustrativeMaskScenario.illustrativeCombinedReductionPercentage}%
                      </span>
                    </div>

                    <div className="text-xs text-indigo-950 dark:text-indigo-200">
                      Illustrative Filtered Proxy: <span className="font-bold">{exposureResult.illustrativeMaskScenario.illustrativeFilteredProxy} µg·h/m³</span> (vs baseline {exposureResult.baselineAmbientProxy ?? exposureResult.baselineIndex} µg·h/m³)
                    </div>

                    <div className="text-[10px] text-indigo-800 dark:text-indigo-300 space-y-1 pt-1">
                      <div className="font-semibold">Explicit Assumptions & Fit Limitations:</div>
                      {exposureResult.illustrativeMaskScenario.assumptions.map((assump, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{assump}</span>
                        </div>
                      ))}
                      <div className="text-amber-800 dark:text-amber-300 font-medium pt-1">
                        ⚠ Real-World Caveat: {exposureResult.illustrativeMaskScenario.fitLimitations}
                      </div>
                    </div>
                  </div>
                )}

                {/* Explicit Non-Medical Disclaimer */}
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-amber-200 dark:border-amber-900 text-[10px] text-amber-900 dark:text-amber-200 font-medium leading-relaxed flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{exposureResult.disclaimer}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            Methodology: Concentration-time exposure proxy based on WHO Air Quality Guidelines (2021). Never claimed as an internalized biological lung dose or guaranteed clinical medical benefit.
          </div>
        </div>

      </div>

    </div>
  );
};
