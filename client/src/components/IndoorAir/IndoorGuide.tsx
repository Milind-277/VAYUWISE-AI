import React, { useState } from 'react';
import { ApiService } from '../../services/api';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Calculator, 
  HelpCircle, 
  CheckCircle2, 
  Wind, 
  Flame, 
  Home, 
  Layers, 
  Info, 
  Sparkles 
} from 'lucide-react';

export const IndoorGuide: React.FC = () => {
  const [activeTier, setActiveTier] = useState<'free' | 'low' | 'high' | 'cadr'>('free');

  // CADR Calculator state
  const [roomLength, setRoomLength] = useState<number>(14);
  const [roomWidth, setRoomWidth] = useState<number>(12);
  const [ceilingHeight, setCeilingHeight] = useState<number>(10);
  const [targetAch, setTargetAch] = useState<number>(4);
  const [cadrResult, setCadrResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  const handleCalculateCadr = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);
    try {
      const res = await ApiService.calculateCadr(roomLength, roomWidth, ceilingHeight, targetAch);
      setCadrResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Banner */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-200 dark:border-emerald-800/60">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white uppercase tracking-wider">
            Module 3
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            WHO & US EPA Evidence-Based IAQ Guidelines
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Indoor Clean-Air Shield & HEPA Architecture
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
          During winter inversion episodes, indoor PM2.5 can reach 60%–80% of outdoor levels unless active source control and filtration are applied. Follow our tiered evidence-based measures.
        </p>
      </div>

      {/* CRITICAL OZONE HAZARD WARNING BOX */}
      <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 dark:border-rose-700 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-200 dark:bg-rose-800 rounded-xl text-rose-900 dark:text-rose-100 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-300" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-rose-950 dark:text-rose-100">
                CRITICAL WARNING: Never Use Ozone-Generating Air Cleaners
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100 uppercase tracking-wider">
                US EPA & WHO Mandate
              </span>
            </div>
            
            <p className="text-xs text-rose-900 dark:text-rose-200 font-medium leading-relaxed">
              Ozone (<span className="font-bold">O₃</span>) is a toxic pulmonary irritant that oxidizes mucosal membranes in human lungs. Many devices falsely marketed as "ionic fresheners", "air energizers", or uncertified photocatalytic cleaners emit hazardous levels of ozone that worsen asthma and create secondary toxic chemical byproducts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-xs text-rose-950 dark:text-rose-100 font-medium">
              <div className="flex items-start gap-1.5">
                <span className="text-rose-600 dark:text-rose-400 font-bold">✕ PROHIBITED:</span>
                <span>Direct ozone generators, uncertified ionizers, and plasma purifiers.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ SAFE CHOICE:</span>
                <span>Certified mechanical True HEPA (H13/H14) + Activated Carbon filters only.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Switcher Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTier('free')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTier === 'free'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Tier 1: Free & Zero-Cost Measures</span>
        </button>

        <button
          onClick={() => setActiveTier('low')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTier === 'low'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tier 2: Low-Cost DIY Solutions</span>
        </button>

        <button
          onClick={() => setActiveTier('high')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTier === 'high'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Tier 3: True HEPA Selection</span>
        </button>

        <button
          onClick={() => setActiveTier('cadr')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTier === 'cadr'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Interactive CADR Sizing Tool</span>
        </button>
      </div>

      {/* Tier 1: Free Measures */}
      {activeTier === 'free' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 w-fit mb-3">
                <Wind className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Wet Mopping Only (Avoid Dry Sweeping)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                Dry broom sweeping and feather dusting aerosolize settled fine particulate matter and allergens back into the breathing zone. Wet mopping binds dust to the liquid phase so it can be removed without airborne resuspension.
              </p>
              <div className="mt-3 space-y-1 text-xs text-slate-700 dark:text-slate-200 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Use damp microfiber cloths for dusting.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mop twice daily during severe smog episodes.</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
              Scientific Reference: US EPA Indoor Air Quality Guidelines
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 w-fit mb-3">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Diurnal Smart Ventilation Timing
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                Keep all street-facing doors and windows sealed from 5:30 PM until 10:30 AM to block night inversion smog. If CO2 buildup causes sleepiness, ventilate briefly (15 min) strictly between 1:00 PM and 3:00 PM when solar convection dilutes outdoor pollution.
              </p>
              <div className="mt-3 space-y-1 text-xs text-slate-700 dark:text-slate-200 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Keep curtains and blinds closed at night.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ventilate from shaded inner courtyard side.</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
              Scientific Reference: IIT-Delhi Boundary Layer Microclimate Studies
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 w-fit mb-3">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Eliminate Incense & Unvented Cooking Smoke
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                Incense sticks (agarbatti), camphor, and mosquito coils release significant respirable particulate matter, carbon monoxide, and polycyclic aromatic hydrocarbons directly into enclosed living spaces. Switch to electric diffusers or LED lamps and run kitchen exhaust during cooking.
              </p>
              <div className="mt-3 space-y-1 text-xs text-slate-700 dark:text-slate-200 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Start kitchen exhaust 2 minutes before cooking.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Keep kitchen door closed to protect living rooms.</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
              Scientific Reference: WHO Guidelines for Household Combustion
            </div>
          </div>
        </div>
      )}

      {/* Tier 2: Low-Cost Solutions */}
      {activeTier === 'low' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          <div className="glass-card p-5 rounded-2xl">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 uppercase">
              Proven Open-Source Innovation
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              DIY Corsi-Rosenthal Box Air Cleaner
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              Developed by environmental engineers Richard Corsi and Jim Rosenthal, this low-cost air cleaner uses a standard 20-inch box fan and four MERV-13 furnace filters taped into a cube. Peer-reviewed tests prove it matches or outperforms commercial purifiers costing 5x as much.
            </p>

            <div className="mt-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
              <div className="font-bold text-brand-600 dark:text-brand-400">How to Assemble:</div>
              <div>1. Tape 4 MERV-13 filters into a square perimeter cube with arrows pointing inward.</div>
              <div>2. Tape a cardboard square on the bottom to seal the base.</div>
              <div>3. Place a 20" box fan on top facing upward and duct-tape all corners airtight.</div>
              <div>4. Delivers Clean Air Delivery Rate (CADR) of 180–240 CFM.</div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 uppercase">
              Draft Infiltration Control
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              Silicone Weatherstripping & Door Bottom Sweeps
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              Over 40% of outdoor smog infiltrates homes through gaps around aluminum sliding windows, balcony doors, and AC sleeve cuts. Self-adhesive silicone seals create an airtight thermal barrier.
            </p>

            <div className="mt-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
              <div className="font-bold text-brand-600 dark:text-brand-400">Implementation Steps:</div>
              <div>1. Clean window track rims with rubbing alcohol to remove grease.</div>
              <div>2. Apply D-shaped self-adhesive EPDM rubber or silicone tape along frame junctions.</div>
              <div>3. Fit screw-on or adhesive aluminum brush door sweeps to bottom of main entry doors.</div>
              <div>4. Seal AC pipe wall penetrations using expanding foam sealant.</div>
            </div>
          </div>
        </div>
      )}

      {/* Tier 3: True HEPA Selection */}
      {activeTier === 'high' && (
        <div className="glass-card p-6 rounded-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Certified Mechanical True HEPA (H13/H14) Purchase Criteria
            </h3>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            When investing in commercial indoor air purifiers, rely strictly on mechanical filter ratings certified to European Standard EN 1822 or ISO 29463. Do not be misled by marketing buzzwords like "HEPA-type" or "anti-microbial plasma".
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">Criterion 1</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">True HEPA H13 Media</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Must capture ≥ 99.95% of Most Penetrating Particle Size (0.3 µm). Standard cloth or foam filters do not stop sub-micron PM2.5.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">Criterion 2</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">Granular Activated Carbon</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                HEPA only traps solid particles. You need an activated carbon bed to adsorb toxic vehicular NO2, SO2, and volatile organic compounds (VOCs).
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">Criterion 3</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">Zero-Ozone Certification</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Check for California Air Resources Board (CARB) or UL 2998 certification verifying ozone emissions are undetectable (&lt; 0.005 ppm).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tier 4: Interactive CADR Sizing Tool */}
      {activeTier === 'cadr' && (
        <div className="glass-card p-6 rounded-2xl animate-in fade-in duration-200">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Clean Air Delivery Rate (CADR) Room Sizer
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
              Enter your room dimensions to calculate the exact Clean Air Delivery Rate (CADR) required to achieve 4–5 air changes per hour (ACH) during winter smog.
            </p>

            <form onSubmit={handleCalculateCadr} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Length (ft)</label>
                <input
                  type="number"
                  value={roomLength}
                  onChange={(e) => setRoomLength(Number(e.target.value))}
                  min={6}
                  max={60}
                  className="w-full mt-1 p-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Width (ft)</label>
                <input
                  type="number"
                  value={roomWidth}
                  onChange={(e) => setRoomWidth(Number(e.target.value))}
                  min={6}
                  max={60}
                  className="w-full mt-1 p-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Height (ft)</label>
                <input
                  type="number"
                  value={ceilingHeight}
                  onChange={(e) => setCeilingHeight(Number(e.target.value))}
                  min={7}
                  max={20}
                  className="w-full mt-1 p-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Target ACH</label>
                <select
                  value={targetAch}
                  onChange={(e) => setTargetAch(Number(e.target.value))}
                  className="w-full mt-1 p-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value={3}>3 (Normal Air)</option>
                  <option value={4}>4 (Recommended Smog)</option>
                  <option value={5}>5 (High Smog / Asthma)</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-4 mt-2">
                <button
                  type="submit"
                  disabled={calculating}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-md"
                >
                  {calculating ? 'Calculating...' : 'Calculate Required Purifier CADR'}
                </button>
              </div>
            </form>

            {cadrResult && (
              <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-2 animate-in zoom-in-95 duration-150">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                  Required Purifier Capacity:
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-emerald-900 dark:text-emerald-100">
                    {cadrResult.recommendedCadrCfm} CFM
                  </span>
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    ({cadrResult.recommendedCadrM3h} m³/hour)
                  </span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                  {cadrResult.ruleOfThumb}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Science Myth Buster */}
      <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-brand-600" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Evidence Reality Check: Do Houseplants Clean Winter Smog?
          </h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          While potted plants (Areca Palm, Snake Plant) provide psychological comfort and modest humidity, comprehensive peer-reviewed studies by the American Chemical Society demonstrate that potted plants have a near-zero filtration effect on high ambient PM2.5 concentrations. You would need 10 to 100 plants per square meter to equal the air exchange of a single mechanical True HEPA purifier. Never rely on plants alone during high smog.
        </p>
      </div>

    </div>
  );
};
