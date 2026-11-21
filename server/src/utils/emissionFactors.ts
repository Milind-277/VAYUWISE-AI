/**
 * Sourced Transport and Household Emission Factors
 * 
 * Primary Regulatory Sources:
 * - India GHG Program (WRI India, Confederation of Indian Industry [CII], Shakti Sustainable Energy Foundation, 2015):
 *   "India Specific Road Transport Emission Factors", Technical Paper Version 1.0.
 *   URL: https://indiaghgp.org/sites/default/files/Road%20Transport%20Technical%20Paper.pdf
 * - Central Electricity Authority (CEA), Ministry of Power, Government of India (August 2026):
 *   "CO2 Baseline Database for the Indian Power Sector", User Guide Version 22.0.
 *   URL: https://cea.nic.in/cdm-co2-baseline-view?lang=en&mappingId=234
 * - Intergovernmental Panel on Climate Change (IPCC):
 *   2006 IPCC Guidelines for National Greenhouse Gas Inventories & 2019 Refinement.
 * - Delhi Metro Rail Corporation (DMRC, 2022):
 *   Annual Sustainability and Carbon Disclosure Report (clarifying operational energy vs avoided emissions metrics).
 * - WHO Air Quality Guidelines (2021) & Household Fuel Combustion Protocols.
 */

export interface TransportMode {
  id: string;
  name: string;
  category: 'private_vehicle' | 'public_transit' | 'active_transit' | 'shared_ride';
  // Sourced emission factor in grams CO2 per passenger-kilometer (actual CO2, not synthetic CO2e)
  emissionFactorGCo2PerPassKm: number;
  emissionFactorGCo2ePerPassKm: number; // Backwards-compatible alias
  emissionMetric: 'CO2' | 'CO2e';
  vehicleKmFactorGCo2?: number; // Reported vehicle-km factor before occupancy division
  factorUnit: string;
  assumedOccupancy: number; // Average passenger occupancy used to convert vehicle-km to passenger-km
  sourceDocument: string;
  publicationYear: number;
  organization: string;
  source: string;
  calculationNotes: string;
  suitabilityRule: string;
}

export const TRANSPORT_MODES: Record<string, TransportMode> = {
  petrol_car: {
    id: 'petrol_car',
    name: 'Private Petrol Car (Sedan <1400cc, India GHG Program)',
    category: 'private_vehicle',
    emissionFactorGCo2PerPassKm: 127.5,
    emissionFactorGCo2ePerPassKm: 127.5,
    emissionMetric: 'CO2',
    vehicleKmFactorGCo2: 153.0,
    factorUnit: 'g CO2 / passenger-km',
    assumedOccupancy: 1.2,
    sourceDocument: 'India Specific Road Transport Emission Factors (Technical Paper Version 1.0, Table 2)',
    publicationYear: 2015,
    organization: 'India GHG Program (WRI India / CII / Shakti Sustainable Energy Foundation)',
    source: 'India GHG Program (2015): Sedan (<1400 cc) petrol base 0.142 kg CO2/km with recommended 8% congestion uplift = 0.153 kg CO2/km (153 g CO2/veh-km) ÷ 1.2 passenger occupancy = 127.5 g CO2/pass-km',
    calculationNotes: 'Reported as 153 g CO2/vehicle-km (actual CO2). Converted to passenger-km using an explicit commuter occupancy assumption of 1.2 passengers/vehicle (TERI / MoHUA Urban Mobility Data).',
    suitabilityRule: 'Highest per-person carbon footprint. Cabin filtration offers enclosed particulate protection, but vehicle directly drives roadway congestion and street exhaust.'
  },
  diesel_car: {
    id: 'diesel_car',
    name: 'Private Diesel Car (Sedan <1600cc, India GHG Program)',
    category: 'private_vehicle',
    emissionFactorGCo2PerPassKm: 117.5,
    emissionFactorGCo2ePerPassKm: 117.5,
    emissionMetric: 'CO2',
    vehicleKmFactorGCo2: 141.0,
    factorUnit: 'g CO2 / passenger-km',
    assumedOccupancy: 1.2,
    sourceDocument: 'India Specific Road Transport Emission Factors (Technical Paper Version 1.0, Table 2)',
    publicationYear: 2015,
    organization: 'India GHG Program (WRI India / CII / Shakti Sustainable Energy Foundation)',
    source: 'India GHG Program (2015): Sedan (<1600 cc) diesel base 0.131 kg CO2/km with recommended 8% congestion uplift = 0.141 kg CO2/km (141 g CO2/veh-km) ÷ 1.2 passenger occupancy = 117.5 g CO2/pass-km',
    calculationNotes: 'Reported as 141 g CO2/vehicle-km (actual CO2). Converted to passenger-km using an explicit commuter occupancy assumption of 1.2 passengers/vehicle.',
    suitabilityRule: 'High localized NOx and particulate matter exhaust. Significant carbon footprint; shifting to public transit recommended.'
  },
  petrol_two_wheeler: {
    id: 'petrol_two_wheeler',
    name: 'Motorcycle / Scooter (<125cc, India GHG Program)',
    category: 'private_vehicle',
    emissionFactorGCo2PerPassKm: 31.9,
    emissionFactorGCo2ePerPassKm: 31.9,
    emissionMetric: 'CO2',
    vehicleKmFactorGCo2: 31.9,
    factorUnit: 'g CO2 / passenger-km',
    assumedOccupancy: 1.0,
    sourceDocument: 'India Specific Road Transport Emission Factors (Technical Paper Version 1.0, Table 1 & Table 4)',
    publicationYear: 2015,
    organization: 'India GHG Program (WRI India / CII / Shakti Sustainable Energy Foundation)',
    source: 'India GHG Program (2015): Motorcycle (<125 cc) base 0.0290 kg CO2/km with 10% two-wheeler congestion uplift = 0.0319 kg CO2/km (31.9 g CO2/veh-km) @ 1.0 solo occupancy = 31.9 g CO2/pass-km',
    calculationNotes: 'Reported base factor is 0.0290 kg CO2/veh-km (29.0 g CO2/veh-km). Applying the India GHG Program recommended 10% two-wheeler operating condition uplift yields 0.0319 kg CO2/veh-km (31.9 g CO2/veh-km). Converted to passenger-km under an explicitly stated single-rider (1.0 person) commuter occupancy assumption. Note: The 10% two-wheeler uplift is distinct from the 8% four-wheeler passenger car uplift.',
    suitabilityRule: 'Substantially lower fuel and CO2 emissions than private solo cars, but rider experiences direct roadside inhalation of traffic exhaust. Certified respirator advised during high smog.'
  },
  petrol_two_wheeler_200cc: {
    id: 'petrol_two_wheeler_200cc',
    name: 'Motorcycle (<200cc, India GHG Program)',
    category: 'private_vehicle',
    emissionFactorGCo2PerPassKm: 45.8,
    emissionFactorGCo2ePerPassKm: 45.8,
    emissionMetric: 'CO2',
    vehicleKmFactorGCo2: 45.8,
    factorUnit: 'g CO2 / passenger-km',
    assumedOccupancy: 1.0,
    sourceDocument: 'India Specific Road Transport Emission Factors (Technical Paper Version 1.0, Table 1 & Table 4)',
    publicationYear: 2015,
    organization: 'India GHG Program (WRI India / CII / Shakti Sustainable Energy Foundation)',
    source: 'India GHG Program (2015): Motorcycle (<200 cc) base 0.0417 kg CO2/km with 10% two-wheeler congestion uplift = 0.0458 kg CO2/km (45.8 g CO2/veh-km) @ 1.0 solo occupancy = 45.8 g CO2/pass-km',
    calculationNotes: 'Reported base factor is 0.0417 kg CO2/veh-km (41.7 g CO2/veh-km). Applying the India GHG Program recommended 10% two-wheeler operating condition uplift yields 0.0458 kg CO2/veh-km (45.8 g CO2/veh-km). Converted to passenger-km under an explicitly stated single-rider (1.0 person) commuter occupancy assumption.',
    suitabilityRule: 'Higher fuel consumption than <125cc commuter category; open rider directly exposed to ambient roadside particulate smog.'
  },
  cng_auto: {
    id: 'cng_auto',
    name: 'CNG Auto-Rickshaw (3-Wheeler, India GHG Program)',
    category: 'shared_ride',
    emissionFactorGCo2PerPassKm: 71.8,
    emissionFactorGCo2ePerPassKm: 71.8,
    emissionMetric: 'CO2',
    vehicleKmFactorGCo2: 107.7,
    factorUnit: 'g CO2 / passenger-km',
    assumedOccupancy: 1.5,
    sourceDocument: 'India Specific Road Transport Emission Factors (Technical Paper Version 1.0, Section 3.2)',
    publicationYear: 2015,
    organization: 'India GHG Program',
    source: 'India GHG Program (2015): CNG 3-Wheeler factor 0.1077 kg CO2/km (107.7 g CO2/veh-km) ÷ 1.5 avg passengers = 71.8 g CO2/pass-km',
    calculationNotes: 'Based on CNG emission factor 2.692 kg CO2/kg CNG divided by standard 25 km/kg efficiency = 107.7 g CO2/veh-km. Converted using 1.5 average passengers in urban service.',
    suitabilityRule: 'Clean-burning gaseous fuel; lower greenhouse footprint than solo private cars. Open cabin requires personal respirator protection during severe smog episodes.'
  },
  city_bus: {
    id: 'city_bus',
    name: 'Intracity Public Bus (SRTU Fleet Mix, India GHG Program)',
    category: 'public_transit',
    emissionFactorGCo2PerPassKm: 15.2,
    emissionFactorGCo2ePerPassKm: 15.2,
    emissionMetric: 'CO2',
    factorUnit: 'g CO2 / passenger-km',
    assumedOccupancy: 35.0, // Indicative average occupancy underpinning SRTU operational passenger-km
    sourceDocument: 'India Specific Road Transport Emission Factors (Technical Paper Version 1.0, Table 8)',
    publicationYear: 2015,
    organization: 'India GHG Program (WRI India / CII / Shakti Sustainable Energy Foundation)',
    source: 'India GHG Program (2015): Intracity Bus factor reported directly as 0.015161 kg CO2/passenger-km = 15.2 g CO2/pass-km',
    calculationNotes: 'Reported directly on a passenger-km basis under State Road Transport Utility (SRTU) intracity bus methodology. Note: This applies strictly to intracity public bus fleets and is not a universal CNG bus factor.',
    suitabilityRule: 'Benchmark for urban road transit: over 85% lower per-passenger CO2 emissions than private petrol cars, with high road space efficiency.'
  },
  metro_rail: {
    id: 'metro_rail',
    name: 'Metro Rail (Electric MRTS, Illustrative Traction Grid Estimate)',
    category: 'public_transit',
    emissionFactorGCo2PerPassKm: 20.3,
    emissionFactorGCo2ePerPassKm: 20.3,
    emissionMetric: 'CO2',
    factorUnit: 'g CO2 / passenger-km',
    assumedOccupancy: 1200.0,
    sourceDocument: 'CEA CO2 Baseline Database v22.0 (August 2026) & Illustrative MRTS Traction Benchmark',
    publicationYear: 2026,
    organization: 'Central Electricity Authority (CEA) / Transit Energy Benchmark',
    source: 'Derived illustrative benchmark: Illustrative traction energy consumption (0.030 kWh/pass-km) × CEA Version 22.0 national weighted-average grid factor (0.675 kg CO2/kWh) = 20.3 g CO2/pass-km',
    calculationNotes: 'Direct combustion tailpipe emissions are 0 g CO2/pass-km. Indirect electricity footprint is calculated using the CEA Version 22.0 national power sector weighted-average grid emission factor (0.675 t CO2/MWh = 0.675 kg CO2/kWh for FY 2025-26). IMPORTANT: The CEA grid factor is a national power sector average, NOT a metro-specific emission factor. The 0.030 kWh/passenger-km figure is an illustrative benchmark assumption for train traction electricity only; it explicitly excludes full metro operational emissions (such as station lighting, ventilation, air conditioning, escalators, depot maintenance, and infrastructure lifecycle). Furthermore, DMRC 32.38 g/km published figure represents external avoided road traffic emissions, NOT metro emissions. India GHG Program (2015) explicitly states conventional railway factors do NOT apply to MRTS.',
    suitabilityRule: 'Zero direct street-level exhaust. Sealed air-conditioned carriages with multi-stage filtration protect passengers from ambient particulate smog.'
  },
  electric_two_wheeler: {
    id: 'electric_two_wheeler',
    name: 'Electric Two-Wheeler (EV Scooter, CEA v22.0 Grid)',
    category: 'private_vehicle',
    emissionFactorGCo2PerPassKm: 16.9,
    emissionFactorGCo2ePerPassKm: 16.9,
    emissionMetric: 'CO2',
    vehicleKmFactorGCo2: 16.9,
    factorUnit: 'g CO2 / passenger-km',
    assumedOccupancy: 1.0,
    sourceDocument: 'CO2 Baseline Database for the Indian Power Sector, User Guide Version 22.0 (August 2026) & EV Benchmark',
    publicationYear: 2026,
    organization: 'Central Electricity Authority (CEA) / Automotive EV Benchmarks',
    source: 'CEA v22.0 National Weighted-Average Grid Factor (0.675 kg CO2/kWh) × representative 0.025 kWh/km battery consumption = 16.9 g CO2/pass-km @ 1.0 occupancy',
    calculationNotes: 'Zero direct tailpipe emissions. Indirect electricity emissions calculated using CEA Version 22.0 national weighted-average grid emission factor (0.675 t CO2/MWh = 0.675 kg CO2/kWh for FY 2025-26). Battery electricity consumption of 0.025 kWh/km (25 Wh/km) is a representative assumption for urban commuter e-scooters under 1.0 solo occupancy. Actual energy usage varies by vehicle model, payload/rider weight, route topography, regenerative braking, battery temperature, and charging/conversion losses.',
    suitabilityRule: 'Zero direct tailpipe emissions. Rider must still wear certified respirator for ambient roadway smog protection.'
  },
  electric_car: {
    id: 'electric_car',
    name: 'Electric Car (EV Sedan, CEA v22.0 Grid)',
    category: 'private_vehicle',
    emissionFactorGCo2PerPassKm: 75.9,
    emissionFactorGCo2ePerPassKm: 75.9,
    emissionMetric: 'CO2',
    vehicleKmFactorGCo2: 91.1,
    factorUnit: 'g CO2 / passenger-km',
    assumedOccupancy: 1.2,
    sourceDocument: 'CO2 Baseline Database for the Indian Power Sector, User Guide Version 22.0 (August 2026) & EV Benchmark',
    publicationYear: 2026,
    organization: 'Central Electricity Authority (CEA) / Automotive EV Benchmarks',
    source: 'CEA v22.0 National Weighted-Average Grid Factor (0.675 kg CO2/kWh) × representative 0.135 kWh/km city cycle = 91.1 g CO2/veh-km ÷ 1.2 passengers = 75.9 g CO2/pass-km',
    calculationNotes: 'Zero direct tailpipe emissions. Indirect electricity emissions calculated using CEA Version 22.0 national weighted-average grid factor (0.675 kg CO2/kWh). Electricity consumption of 0.135 kWh/km (135 Wh/km) is a representative assumption for compact electric sedans in city driving cycles. Converted using explicit occupancy assumption of 1.2 passengers (91.1 g CO2/pass-km for solo driver). Actual energy usage varies by vehicle model, cabin heating/air-conditioning (HVAC) load, driving style, passenger payload, charging losses, and ambient temperature.',
    suitabilityRule: 'Zero direct street-level tailpipe exhaust; ~40% lower operational carbon than petrol cars on India national grid.'
  },
  bicycle: {
    id: 'bicycle',
    name: 'Bicycle / Non-Motorized Mobility',
    category: 'active_transit',
    emissionFactorGCo2PerPassKm: 0.0,
    emissionFactorGCo2ePerPassKm: 0.0,
    emissionMetric: 'CO2',
    factorUnit: 'g CO2 / passenger-km',
    assumedOccupancy: 1.0,
    sourceDocument: '2006 IPCC Guidelines for National Greenhouse Gas Inventories & India GHG Program',
    publicationYear: 2015,
    organization: 'IPCC / India GHG Program',
    source: 'IPCC / India GHG Program: Zero direct operational combustion emissions (0 g CO2/km)',
    calculationNotes: 'Non-motorized active transit.',
    suitabilityRule: 'Zero emissions. Caution: During Poor or Severe AQI (> 200), vigorous aerobic exertion elevates minute ventilation 2-4x; avoid heavy outdoor cycling in high smog.'
  },
  walking: {
    id: 'walking',
    name: 'Walking / Active Errand',
    category: 'active_transit',
    emissionFactorGCo2PerPassKm: 0.0,
    emissionFactorGCo2ePerPassKm: 0.0,
    emissionMetric: 'CO2',
    factorUnit: 'g CO2 / passenger-km',
    assumedOccupancy: 1.0,
    sourceDocument: '2006 IPCC Guidelines for National Greenhouse Gas Inventories & India GHG Program',
    publicationYear: 2015,
    organization: 'IPCC / India GHG Program',
    source: 'IPCC / India GHG Program: Zero direct operational combustion emissions (0 g CO2/km)',
    calculationNotes: 'Non-motorized active transit.',
    suitabilityRule: 'Zero emissions. Best for short neighborhood errands. Wear a certified N95 respirator if ambient AQI exceeds 150.'
  }
};

export interface Co2eCalculationInput {
  distanceKm: number;
  baselineMode: string;
  alternativeMode: string;
  tripsPerWeek: number;
}

export interface Co2eCalculationResult {
  baselineCo2eGramsPerTrip: number;
  alternativeCo2eGramsPerTrip: number;
  avoidedCo2eGramsPerTrip: number;
  avoidedCo2eKgPerWeek: number;
  avoidedCo2eKgPerYear: number;
  percentageReduction: number;
  baselineModeName: string;
  alternativeModeName: string;
  formula: string;
  emissionMetric: string;
  assumptions: string[];
  sources: string[];
}

/**
 * Calculates estimated avoided transport CO2.
 * Formula: Avoided CO2 = Distance (km) * (EF_baseline - EF_alternative)
 */
export function calculateAvoidedCo2e(input: Co2eCalculationInput): Co2eCalculationResult {
  const baseMode = TRANSPORT_MODES[input.baselineMode] || TRANSPORT_MODES.petrol_car;
  const altMode = TRANSPORT_MODES[input.alternativeMode] || TRANSPORT_MODES.city_bus;

  const baseFactor = baseMode.emissionFactorGCo2PerPassKm ?? baseMode.emissionFactorGCo2ePerPassKm;
  const altFactor = altMode.emissionFactorGCo2PerPassKm ?? altMode.emissionFactorGCo2ePerPassKm;

  const baselinePerTrip = Math.round(input.distanceKm * baseFactor);
  const altPerTrip = Math.round(input.distanceKm * altFactor);
  const avoidedPerTrip = Math.max(0, baselinePerTrip - altPerTrip);

  const weeklyAvoidedKg = Number(((avoidedPerTrip * input.tripsPerWeek) / 1000).toFixed(1));
  const annualAvoidedKg = Number(((weeklyAvoidedKg * 52)).toFixed(1));

  const percentageReduction = baselinePerTrip > 0
    ? Math.round(((baselinePerTrip - altPerTrip) / baselinePerTrip) * 100)
    : 0;

  return {
    baselineCo2eGramsPerTrip: baselinePerTrip,
    alternativeCo2eGramsPerTrip: altPerTrip,
    avoidedCo2eGramsPerTrip: avoidedPerTrip,
    avoidedCo2eKgPerWeek: weeklyAvoidedKg,
    avoidedCo2eKgPerYear: annualAvoidedKg,
    percentageReduction,
    baselineModeName: baseMode.name,
    alternativeModeName: altMode.name,
    formula: 'Estimated Avoided CO2 = Distance (km) * (EF_baseline - EF_alternative)',
    emissionMetric: 'CO2 (Direct Combustion + EV/MRTS Grid Factor)',
    assumptions: [
      `Baseline (${baseMode.name}): ${baseFactor} g CO2/pass-km (explicit occupancy assumption: ${baseMode.assumedOccupancy} pass/veh)`,
      `Alternative (${altMode.name}): ${altFactor} g CO2/pass-km (explicit occupancy assumption: ${altMode.assumedOccupancy} pass/veh)`,
      `Commute Pattern: ${input.distanceKm} km one-way over ${input.tripsPerWeek} trips per week (52 weeks/year)`,
      'Vehicle-km factors are converted to passenger-km only using explicit, visible passenger occupancy assumptions.',
      'The CEA Version 22.0 factor (0.675 kg CO2/kWh for FY 2025-26) is the national weighted-average power sector grid emission factor, NOT a metro-specific factor.',
      'The 0.030 kWh/passenger-km metro traction consumption is an illustrative benchmark assumption representing train traction electricity only, excluding station operations, lighting, HVAC, and lifecycle emissions.',
      'EV electricity consumption values (0.025 kWh/km for 2W, 0.135 kWh/km for car) are representative assumptions; actual energy varies by vehicle model, route, load, driving style, ambient temperature, and charging losses.',
      'Motorcycle factors reflect India GHG Program 10% two-wheeler uplift (distinct from 8% four-wheeler uplift) under an explicit 1.0 person solo-rider occupancy assumption.'
    ],
    sources: [
      `${baseMode.organization} (${baseMode.publicationYear}): ${baseMode.sourceDocument}`,
      `${altMode.organization} (${altMode.publicationYear}): ${altMode.sourceDocument}`
    ]
  };
}

export interface ExposureProxyInput {
  baselineConcentrationUgM3: number;
  baselineDurationHours: number;
  optimizedConcentrationUgM3: number;
  optimizedDurationHours: number;
  maskEfficiencyFactor?: number; // e.g. 0.95 for nominal laboratory N95 test media
  hasN95Mask?: boolean;
}

export interface IllustrativeMaskScenario {
  nominalFiltrationEfficiency: number; // e.g. 0.95
  illustrativeFilteredProxy: number; // ug * h / m3
  illustrativeCombinedReductionPercentage: number;
  assumptions: string[];
  fitLimitations: string;
  clinicalDisclaimer: string;
}

export interface ExposureProxyResult {
  // Primary ambient concentration-time exposure proxy (strictly INDEPENDENT of mask filtration)
  baselineAmbientProxy: number; // ug * h / m3
  optimizedAmbientProxy: number; // ug * h / m3
  avoidedAmbientProxy: number; // ug * h / m3
  ambientReductionPercentage: number;

  // Backwards-compatible aliases representing ambient metrics
  baselineIndex: number;
  optimizedIndex: number;
  avoidedIndex: number;
  reductionPercentage: number;

  formula: string;
  unit: string;
  disclaimer: string;

  // Separate illustrative mask scenario (clearly separated from ambient proxy)
  illustrativeMaskScenario?: IllustrativeMaskScenario;
}

/**
 * Calculates Outdoor PM2.5 Concentration-Time Exposure Proxy Index.
 * 
 * Formal Definition:
 * Primary Exposure Proxy Index = Ambient PM2.5 Concentration (ug/m3) * Exposure Duration (hours)
 * Unit: ug * h / m3
 * 
 * Scientific Integrity Disclaimers:
 * - This is an environmental concentration-time duration index, NOT an internalized physiological pulmonary dose.
 * - Physiological lung deposition depends on minute ventilation, airway morphology, breathing frequency, and individual lung health.
 * - Mask filtration is NEVER applied to the primary ambient proxy. A separate illustrative mask scenario is provided only when requested, with full disclosure of fit limitations and continuous wear assumptions.
 * - Real-world mask protection is NOT guaranteed and depends on appropriate model selection, airtight perimeter seal (no facial hair or nose-bridge gaps), and continuous correct use. Occupational benchmarks (such as OSHA APF 10) apply only to trained workers undergoing formal fit testing, not general community use.
 * - This calculation NEVER claims a guaranteed clinical outcome or medical benefit.
 */
export function calculateExposureProxy(input: ExposureProxyInput): ExposureProxyResult {
  // Primary ambient proxy: Concentration (ug/m3) * Duration (hours)
  const baselineAmbient = Math.round(input.baselineConcentrationUgM3 * input.baselineDurationHours);
  const optimizedAmbient = Math.round(input.optimizedConcentrationUgM3 * input.optimizedDurationHours);
  const avoidedAmbient = Math.max(0, baselineAmbient - optimizedAmbient);
  const ambientReductionPct = baselineAmbient > 0 ? Math.round((avoidedAmbient / baselineAmbient) * 100) : 0;

  const result: ExposureProxyResult = {
    baselineAmbientProxy: baselineAmbient,
    optimizedAmbientProxy: optimizedAmbient,
    avoidedAmbientProxy: avoidedAmbient,
    ambientReductionPercentage: ambientReductionPct,

    // Primary aliases remain purely ambient-driven
    baselineIndex: baselineAmbient,
    optimizedIndex: optimizedAmbient,
    avoidedIndex: avoidedAmbient,
    reductionPercentage: ambientReductionPct,

    formula: 'Primary Ambient Exposure Proxy = Ambient PM2.5 Concentration (µg/m³) × Duration (hours)',
    unit: 'µg·h/m³',
    disclaimer: 'Scientific Integrity Notice: The primary exposure proxy calculates ambient concentration-time exposure duration (µg·h/m³). It does NOT measure internalized physiological pulmonary deposition, tidal breathing volume, or guarantee medical/clinical outcomes.'
  };

  // If mask scenario is requested, compute as a strictly separate illustrative scenario
  const showMask = Boolean(input.hasN95Mask || (input.maskEfficiencyFactor !== undefined && input.maskEfficiencyFactor > 0));
  if (showMask) {
    const nominalEfficiency = input.maskEfficiencyFactor ?? 0.95;
    const filteredConcentration = input.optimizedConcentrationUgM3 * (1 - nominalEfficiency);
    const illustrativeFilteredProxy = Math.round(filteredConcentration * input.optimizedDurationHours);
    const combinedAvoided = Math.max(0, baselineAmbient - illustrativeFilteredProxy);
    const combinedReductionPct = baselineAmbient > 0 ? Math.round((combinedAvoided / baselineAmbient) * 100) : 0;

    result.illustrativeMaskScenario = {
      nominalFiltrationEfficiency: nominalEfficiency,
      illustrativeFilteredProxy,
      illustrativeCombinedReductionPercentage: combinedReductionPct,
      assumptions: [
        'Applies nominal 95% particulate filtration media efficiency (NIOSH 42 CFR 84 / EN 149 standard laboratory test conditions with non-oil aerosols).',
        'Assumes continuous, uninterrupted correct wearing with zero removal, unfastening, or touching during the entire outdoor exposure period.',
        'Assumes an airtight perimeter facial seal with 0% total inward leakage (no nasal bridge, cheek, or jawline edge bypass gaps).'
      ],
      fitLimitations: 'Important Limitation: The nominal 95% rating reflects laboratory filter media efficiency under sealed test conditions. It is NOT a guaranteed real-world protection rate for community or public wearers. Actual protection in real-world use depends entirely on selecting an appropriate model and size, achieving an airtight facial seal (no facial hair or nose-clip gaps), and maintaining continuous, correct use. Occupational assigned protection factors (such as OSHA APF 10) apply only to trained workers undergoing formal fit testing, not general community use where edge leakage significantly reduces effective particle reduction.',
      clinicalDisclaimer: 'Never claim a guaranteed medical, clinical, or physiological benefit. Ambient and filter proxies do not measure internalized lung dose, personal breathing volume, or biological health outcomes.'
    };
  }

  return result;
}
