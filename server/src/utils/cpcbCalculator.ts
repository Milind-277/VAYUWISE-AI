import { AqiCategory, PollutantBreakdown } from '../types/aqi.js';

/**
 * CPCB National Air Quality Index (NAQI) calculation utility
 * Implements the official methodology published by Central Pollution Control Board (CPCB),
 * Ministry of Environment, Forest and Climate Change, Government of India.
 * Reference: "How Ambient Air Quality Index (AQI) is Calculated in India", CPCB, Oct 2014.
 * 
 * Official CPCB Regulatory Rules:
 * 1. Sub-index calculation: Linear interpolation between concentration breakpoints.
 * 2. CPCB NAQI requires at least 3 pollutants to be monitored, out of which
 *    one MUST be either PM2.5 or PM10.
 * 3. Averaging Times: 24-hourly average for PM2.5, PM10, NO2, SO2, NH3, Pb; 8-hourly average for CO and O3.
 * 4. Data Sufficiency Requirement (CPCB Oct 2014, Section 4.0):
 *    "A minimum of 16 hours of data is considered necessary to calculate the sub-index."
 *    This 16-hour minimum applies across all pollutants for calculating the sub-index.
 *    No unofficial 6-hour exception is applied.
 * 5. If minimum criteria are not met, official CPCB AQI MUST NOT be calculated.
 *    Instead, the system displays: "Insufficient data to calculate official CPCB AQI."
 */

export interface BreakpointRange {
  bLow: number;
  bHigh: number;
  iLow: number;
  iHigh: number;
  category: AqiCategory;
}

// Official CPCB Breakpoints Table
export const CPCB_BREAKPOINTS: Record<string, BreakpointRange[]> = {
  pm2_5: [
    { bLow: 0, bHigh: 30, iLow: 0, iHigh: 50, category: 'Good' },
    { bLow: 31, bHigh: 60, iLow: 51, iHigh: 100, category: 'Satisfactory' },
    { bLow: 61, bHigh: 90, iLow: 101, iHigh: 200, category: 'Moderate' },
    { bLow: 91, bHigh: 120, iLow: 201, iHigh: 300, category: 'Poor' },
    { bLow: 121, bHigh: 250, iLow: 301, iHigh: 400, category: 'Very Poor' },
    { bLow: 251, bHigh: 500, iLow: 401, iHigh: 500, category: 'Severe' }
  ],
  pm10: [
    { bLow: 0, bHigh: 50, iLow: 0, iHigh: 50, category: 'Good' },
    { bLow: 51, bHigh: 100, iLow: 51, iHigh: 100, category: 'Satisfactory' },
    { bLow: 101, bHigh: 250, iLow: 101, iHigh: 200, category: 'Moderate' },
    { bLow: 251, bHigh: 350, iLow: 201, iHigh: 300, category: 'Poor' },
    { bLow: 351, bHigh: 430, iLow: 301, iHigh: 400, category: 'Very Poor' },
    { bLow: 431, bHigh: 600, iLow: 401, iHigh: 500, category: 'Severe' }
  ],
  no2: [
    { bLow: 0, bHigh: 40, iLow: 0, iHigh: 50, category: 'Good' },
    { bLow: 41, bHigh: 80, iLow: 51, iHigh: 100, category: 'Satisfactory' },
    { bLow: 81, bHigh: 180, iLow: 101, iHigh: 200, category: 'Moderate' },
    { bLow: 181, bHigh: 280, iLow: 201, iHigh: 300, category: 'Poor' },
    { bLow: 281, bHigh: 400, iLow: 301, iHigh: 400, category: 'Very Poor' },
    { bLow: 401, bHigh: 600, iLow: 401, iHigh: 500, category: 'Severe' }
  ],
  so2: [
    { bLow: 0, bHigh: 40, iLow: 0, iHigh: 50, category: 'Good' },
    { bLow: 41, bHigh: 80, iLow: 51, iHigh: 100, category: 'Satisfactory' },
    { bLow: 81, bHigh: 380, iLow: 101, iHigh: 200, category: 'Moderate' },
    { bLow: 381, bHigh: 800, iLow: 201, iHigh: 300, category: 'Poor' },
    { bLow: 801, bHigh: 1600, iLow: 301, iHigh: 400, category: 'Very Poor' },
    { bLow: 1601, bHigh: 2000, iLow: 401, iHigh: 500, category: 'Severe' }
  ],
  co: [
    { bLow: 0, bHigh: 1.0, iLow: 0, iHigh: 50, category: 'Good' },
    { bLow: 1.1, bHigh: 2.0, iLow: 51, iHigh: 100, category: 'Satisfactory' },
    { bLow: 2.1, bHigh: 10.0, iLow: 101, iHigh: 200, category: 'Moderate' },
    { bLow: 10.1, bHigh: 17.0, iLow: 201, iHigh: 300, category: 'Poor' },
    { bLow: 17.1, bHigh: 34.0, iLow: 301, iHigh: 400, category: 'Very Poor' },
    { bLow: 34.1, bHigh: 50.0, iLow: 401, iHigh: 500, category: 'Severe' }
  ],
  o3: [
    { bLow: 0, bHigh: 50, iLow: 0, iHigh: 50, category: 'Good' },
    { bLow: 51, bHigh: 100, iLow: 51, iHigh: 100, category: 'Satisfactory' },
    { bLow: 101, bHigh: 168, iLow: 101, iHigh: 200, category: 'Moderate' },
    { bLow: 169, bHigh: 208, iLow: 201, iHigh: 300, category: 'Poor' },
    { bLow: 209, bHigh: 748, iLow: 301, iHigh: 400, category: 'Very Poor' },
    { bLow: 749, bHigh: 1000, iLow: 401, iHigh: 500, category: 'Severe' }
  ]
};

export function getCategoryFromAqi(aqi: number): AqiCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

/**
 * Calculates sub-index for a specific pollutant concentration using linear interpolation
 * Formula: I = I_low + ((I_high - I_low) / (B_high - B_low)) * (C - B_low)
 */
export function calculateSubIndex(pollutant: string, concentration: number): { subIndex: number; category: AqiCategory } | null {
  const breakpoints = CPCB_BREAKPOINTS[pollutant.toLowerCase()];
  if (!breakpoints || concentration < 0) return null;

  for (const bp of breakpoints) {
    if (concentration >= bp.bLow && concentration <= bp.bHigh) {
      const subIndex = Math.round(
        bp.iLow + ((bp.iHigh - bp.iLow) / (bp.bHigh - bp.bLow)) * (concentration - bp.bLow)
      );
      return { subIndex: Math.min(500, Math.max(0, subIndex)), category: bp.category };
    }
  }

  const lastBp = breakpoints[breakpoints.length - 1];
  if (concentration > lastBp.bHigh) {
    return { subIndex: 500, category: 'Severe' };
  }

  return null;
}

export interface CpcbOfficialValidationResult {
  isValid: boolean;
  officialAqi: number | null;
  dominantPollutant: string;
  category: AqiCategory;
  subIndices: Record<string, number>;
  statusMessage: string;
}

/**
 * Strictly calculates Official CPCB NAQI.
 * Enforces:
 * 1. >= 3 monitored pollutants with valid sub-indices.
 * 2. At least one criteria pollutant must be particulate (PM2.5 or PM10).
 * 3. Minimum 16 hours of monitored data for calculating any pollutant sub-index
 *    (CPCB NAQI Oct 2014, Section 4.0 Data Sufficiency).
 *    Averaging periods: 24-hr for PM2.5, PM10, NO2, SO2; 8-hr for CO, O3.
 * If criteria are not met, returns officialAqi: null and "Insufficient data to calculate official CPCB AQI."
 */
export function calculateOfficialCpcbAqi(
  pollutants: PollutantBreakdown,
  options: { isRegulatoryObservedStation?: boolean; defaultHoursMonitored?: number } = {}
): CpcbOfficialValidationResult {
  const subIndices: Record<string, number> = {};
  let dominantPollutant = 'pm2_5';
  let maxSubIndex = 0;
  let hasParticulate = false;
  let validPollutantCount = 0;

  for (const [key, detail] of Object.entries(pollutants)) {
    if (!detail || typeof detail.value !== 'number') continue;

    // Check minimum monitored hours per CPCB data sufficiency rule (minimum 16 hours)
    const hoursMonitored = detail.hoursMonitored ?? options.defaultHoursMonitored ?? (detail.isObserved ? 24 : 1);
    const requiredHours = 16; // CPCB Section 4.0: minimum 16 hours of data necessary to calculate sub-index

    if (hoursMonitored < requiredHours) {
      continue; // Skip pollutant if insufficient hours of continuous data
    }

    const res = calculateSubIndex(key, detail.value);
    if (res !== null) {
      subIndices[key] = res.subIndex;
      validPollutantCount++;

      if (key === 'pm2_5' || key === 'pm10') {
        hasParticulate = true;
      }

      if (res.subIndex > maxSubIndex) {
        maxSubIndex = res.subIndex;
        dominantPollutant = key;
      }
    }
  }

  const meetsCriteria = validPollutantCount >= 3 && hasParticulate && Boolean(options.isRegulatoryObservedStation);

  if (!meetsCriteria) {
    return {
      isValid: false,
      officialAqi: null,
      dominantPollutant: dominantPollutant.toUpperCase(),
      category: getCategoryFromAqi(maxSubIndex || 0),
      subIndices,
      statusMessage: 'Insufficient data to calculate official CPCB AQI.'
    };
  }

  return {
    isValid: true,
    officialAqi: maxSubIndex,
    dominantPollutant: dominantPollutant.toUpperCase(),
    category: getCategoryFromAqi(maxSubIndex),
    subIndices,
    statusMessage: `Meets official CPCB criteria (${validPollutantCount} monitored pollutants with regulatory averaging).`
  };
}

/**
 * Calculates a Model-Derived Equivalent Index from available Open-Meteo CAMS forecast data.
 * Always explicitly labelled as a model estimate, never an official CPCB observation.
 */
export function calculateModelEstimatedIndex(pollutants: PollutantBreakdown): {
  modelIndex: number;
  dominantPollutant: string;
  category: AqiCategory;
  subIndices: Record<string, number>;
  statusMessage: string;
} {
  const subIndices: Record<string, number> = {};
  let dominantPollutant = 'pm2_5';
  let maxSubIndex = 0;

  for (const [key, detail] of Object.entries(pollutants)) {
    if (!detail || typeof detail.value !== 'number') continue;
    const res = calculateSubIndex(key, detail.value);
    if (res !== null) {
      subIndices[key] = res.subIndex;
      if (res.subIndex > maxSubIndex) {
        maxSubIndex = res.subIndex;
        dominantPollutant = key;
      }
    }
  }

  return {
    modelIndex: maxSubIndex,
    dominantPollutant: dominantPollutant.toUpperCase(),
    category: getCategoryFromAqi(maxSubIndex),
    subIndices,
    statusMessage: 'Model-derived forecast index mapped to CPCB sub-index breakpoints. Note: Official CPCB AQI requires 24-hr regulatory station monitoring.'
  };
}
