import { Router, Request, Response } from 'express';
import { 
  calculateAvoidedCo2e, 
  calculateExposureProxy, 
  TRANSPORT_MODES, 
  Co2eCalculationInput, 
  ExposureProxyInput 
} from '../utils/emissionFactors.js';

const router = Router();

export interface CleanCookingOption {
  fuel: string;
  category: 'clean' | 'intermediate' | 'polluting';
  indoorPm25Emissions: string;
  co2Efficiency: string;
  healthImpact: string;
  recommendation: string;
}

const CLEAN_ENERGY_OPTIONS: CleanCookingOption[] = [
  {
    fuel: 'Electric Induction Cooktop',
    category: 'clean',
    indoorPm25Emissions: '0 µg/m³ direct indoor emissions',
    co2Efficiency: '85-90% thermal efficiency (highest)',
    healthImpact: 'Eliminates household indoor combustion entirely; zero NO2, CO, or PM2.5 emitted inside kitchen.',
    recommendation: 'Top recommendation for urban apartments; safer, faster, and completely clean breathing zone.'
  },
  {
    fuel: 'Piped Natural Gas (PNG) / LPG Cylinder',
    category: 'clean',
    indoorPm25Emissions: 'Low particulate emissions (<15 µg/m³ with good burner maintenance)',
    co2Efficiency: '50-55% thermal efficiency',
    healthImpact: 'Significantly cleaner than biomass; minor NO2 and unburned methane emissions. Kitchen exhaust fan essential.',
    recommendation: 'Widely accessible transition fuel. Always keep kitchen window cracked or exhaust fan running.'
  },
  {
    fuel: 'Traditional Biomass / Wood / Cow Dung Chulha',
    category: 'polluting',
    indoorPm25Emissions: 'Severe (>2,000 to 5,000 µg/m³ peak during fire start)',
    co2Efficiency: '10-15% thermal efficiency (severe energy loss)',
    healthImpact: 'Primary cause of household air pollution, chronic obstructive pulmonary disease (COPD), and childhood pneumonia.',
    recommendation: 'Urgent priority to replace with PMUY (Pradhan Mantri Ujjwala Yojana) LPG or induction stoves.'
  }
];

/**
 * GET /api/simulator/modes
 * Returns available transport modes with emission factors and sources
 */
router.get('/modes', (_req: Request, res: Response) => {
  res.json({
    success: true,
    modes: Object.values(TRANSPORT_MODES),
    cleanEnergyOptions: CLEAN_ENERGY_OPTIONS
  });
});

/**
 * POST /api/simulator/calculate-co2
 * Calculate avoided CO2e based on distance and baseline/alternative mode
 */
router.post('/calculate-co2', (req: Request, res: Response) => {
  const { distanceKm, baselineMode, alternativeMode, tripsPerWeek } = req.body;

  const dist = Number(distanceKm);
  const trips = Number(tripsPerWeek) || 10;

  if (isNaN(dist) || dist <= 0) {
    res.status(400).json({ success: false, error: 'Valid positive distanceKm is required' });
    return;
  }

  const input: Co2eCalculationInput = {
    distanceKm: dist,
    baselineMode: baselineMode || 'petrol_car',
    alternativeMode: alternativeMode || 'metro_rail',
    tripsPerWeek: trips
  };

  const result = calculateAvoidedCo2e(input);
  res.json({ success: true, result });
});

/**
 * POST /api/simulator/exposure-proxy
 * Calculate outdoor PM2.5 concentration-time exposure proxy
 */
router.post('/exposure-proxy', (req: Request, res: Response) => {
  const { 
    baselineConcentrationUgM3, 
    baselineDurationHours, 
    optimizedConcentrationUgM3, 
    optimizedDurationHours,
    hasN95Mask 
  } = req.body;

  const baseConc = Number(baselineConcentrationUgM3);
  const baseDur = Number(baselineDurationHours);
  const optConc = Number(optimizedConcentrationUgM3);
  const optDur = Number(optimizedDurationHours);

  if (isNaN(baseConc) || isNaN(baseDur) || isNaN(optConc) || isNaN(optDur)) {
    res.status(400).json({ success: false, error: 'Valid numerical inputs are required for exposure calculation' });
    return;
  }

  const input: ExposureProxyInput = {
    baselineConcentrationUgM3: baseConc,
    baselineDurationHours: baseDur,
    optimizedConcentrationUgM3: optConc,
    optimizedDurationHours: optDur,
    hasN95Mask: Boolean(hasN95Mask),
    maskEfficiencyFactor: hasN95Mask ? 0.95 : undefined
  };

  const result = calculateExposureProxy(input);
  res.json({ success: true, result });
});

export default router;
