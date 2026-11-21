import { Router, Request, Response } from 'express';

const router = Router();

export interface IndoorGuideItem {
  id: string;
  title: string;
  tier: 'Free / Zero-Cost' | 'Low-Cost' | 'Higher-Budget';
  category: 'cleaning' | 'ventilation' | 'filtration' | 'source_control';
  summary: string;
  steps: string[];
  scientificBasis: string;
  source: string;
  cautions?: string[];
}

const INDOOR_GUIDELINES: IndoorGuideItem[] = [
  {
    id: 'wet_mopping_vs_sweeping',
    title: 'Wet Mopping & Damp Microfiber Wiping (Avoid Dry Sweeping)',
    tier: 'Free / Zero-Cost',
    category: 'cleaning',
    summary: 'Dry broom sweeping aerosolizes settled fine particulate matter and allergens into the residential breathing zone.',
    steps: [
      'Use a damp microfiber cloth for dusting furniture, countertops, and electronics.',
      'Wet-mop tiled and stone floors twice daily using clean water or mild biodegradable detergent.',
      'Allow mopped surfaces to air dry without dry sweeping or using feather dusters during smog episodes.'
    ],
    scientificBasis: 'Aerosol resuspension studies (e.g., Ferro et al., 2004, Indoor Air; US EPA Indoor Environments Division) demonstrate that mechanical dry sweeping rapidly resuspends coarse and fine particulate matter into the occupant breathing zone, whereas wet cleaning techniques physically bind dust to the liquid phase without airborne resuspension.',
    source: 'US EPA "Air Cleaners and Air Filters in the Home" (EPA 402-F-08-004) & WHO Guidelines for Indoor Air Quality'
  },
  {
    id: 'ventilation_timing',
    title: 'Solar-Timed Diurnal Ventilation',
    tier: 'Free / Zero-Cost',
    category: 'ventilation',
    summary: 'Coordinate window opening with peak daytime atmospheric mixing hours to avoid nocturnal ground smog.',
    steps: [
      'Keep street-facing windows and exterior doors sealed during night and early morning hours.',
      'If indoor CO2 concentrations rise, open windows on interior courtyard sides briefly (15–20 minutes) during the forecasted peak mixing window.',
      'Apply rolled towels or silicone draft stoppers at the base of entrance doors.'
    ],
    scientificBasis: 'Diurnal boundary layer dynamics establish that solar heating warms the earth surface, elevating the mixing layer and diluting surface particulate density compared to nocturnal inversion conditions (Central Pollution Control Board urban air dispersion data).',
    source: 'Central Pollution Control Board (CPCB) Urban Meteorology & Atmospheric Dispersion Principles'
  },
  {
    id: 'kitchen_smoke_control',
    title: 'Cooking Smoke & Incense Combustion Control',
    tier: 'Free / Zero-Cost',
    category: 'source_control',
    summary: 'Cooking emissions, tadka frying, and incense burning generate high localized concentrations of fine combustion aerosols indoors.',
    steps: [
      'Activate kitchen exhaust fans 2 minutes prior to heating cooking oil and allow to run for 5 minutes after cooking completes.',
      'Keep kitchen doors closed to prevent oil aerosols from migrating into bedrooms and living areas.',
      'Eliminate indoor combustion of incense sticks (agarbatti), camphor, and mosquito coils; switch to electric diffusers or LED lamps.'
    ],
    scientificBasis: 'Combustion of solid incense, coils, and unvented cooking oils releases significant quantities of respirable PM2.5, carbon monoxide, polycyclic aromatic hydrocarbons (PAHs), and formaldehyde directly into indoor air (WHO Guidelines for Household Fuel Combustion).',
    source: 'WHO Guidelines for Indoor Air Quality: Household Fuel Combustion (2014)'
  },
  {
    id: 'corsi_rosenthal_box',
    title: 'DIY Corsi-Rosenthal Box Air Cleaner',
    tier: 'Low-Cost',
    category: 'filtration',
    summary: 'A proven, open-source high-CADR air cleaner constructed from four MERV-13 pleated filters and a standard 20-inch box fan.',
    steps: [
      'Tape 4 MERV-13 pleated furnace filters into a square perimeter with arrows pointing inward toward the center.',
      'Affix a cardboard square at the bottom to seal the base.',
      'Position a 20-inch box fan on top oriented to blow air upward, sealing all perimeter seams with duct tape.',
      'Operate in central living rooms or bedrooms.'
    ],
    scientificBasis: 'Chamber testing by UC Davis Air Quality Research Center and US EPA demonstrates that a 4-filter MERV-13 Corsi-Rosenthal cube typically achieves Clean Air Delivery Rates (CADR) of 150 to 250 CFM for PM2.5, delivering high CADR per unit cost compared to commercial consumer units.',
    source: 'UC Davis Air Quality Research Center / US EPA Research on Low-Cost Air Cleaning Technologies',
    cautions: ['Ensure filters are certified MERV-13 or higher to effectively capture sub-micron particulate matter.']
  },
  {
    id: 'door_window_weatherstripping',
    title: 'Silicone Weatherstripping & Infiltration Seals',
    tier: 'Low-Cost',
    category: 'ventilation',
    summary: 'Seal exterior sliding window tracks and door gaps to suppress outdoor-to-indoor smog infiltration.',
    steps: [
      'Clean window sliding tracks and apply self-adhesive D-shape silicone or EPDM foam gaskets.',
      'Attach aluminum/rubber brush sweeps to the base of exterior doors.',
      'Inspect split-AC sleeve penetrations through exterior walls and seal gaps with silicone sealant.'
    ],
    scientificBasis: 'Envelope infiltration studies indicate that unsealed perimeter fenestrations allow substantial passive transport of outdoor ambient aerosols into indoor residential air during elevated smog events (ASHRAE Standard 62.2).',
    source: 'ASHRAE Standard 62.2 / Building America Envelope Sealing Protocols'
  },
  {
    id: 'true_hepa_purifiers',
    title: 'Certified True HEPA (H13/H14) Mechanical Purifiers',
    tier: 'Higher-Budget',
    category: 'filtration',
    summary: 'Pure mechanical filtration using certified True HEPA media and activated carbon beds without chemical byproducts.',
    steps: [
      'Select purifiers certified to EN 1822 or ISO 29463 (True HEPA H13 traps >= 99.95% of 0.3 micron particles).',
      'Size by CADR: Clean Air Delivery Rate (CFM) should equal at least 2/3 of the room floor area (sq ft) for standard 8-ft ceilings.',
      'Ensure the unit incorporates granular activated carbon to capture gaseous nitrogen dioxide and volatile organic compounds.',
      'Operate continuously on auto or medium mode in occupied bedrooms.'
    ],
    scientificBasis: 'Mechanical HEPA filtration relies on physical impaction, interception, and Brownian diffusion to capture fine and ultrafine particles without generating secondary chemical byproducts (Association of Home Appliance Manufacturers Standards).',
    source: 'AHAM AC-1 Standard / US EPA Indoor Environments Division',
    cautions: [
      'CRITICAL SAFETY WARNING: Do NOT operate air cleaners with uncertified ionizers, ozone generators, or plasma features turned ON. Choose pure mechanical filtration.'
    ]
  }
];

export const OZONE_SAFETY_ALERT = {
  warningTitle: 'CRITICAL SAFETY DIRECTIVE: Avoid Ozone-Generating Air Cleaners',
  hazardSummary: 'Ozone (O3) is a powerful, toxic pulmonary irritant that oxidizes mucosal lining, exacerbates asthma and COPD, and reacts with common household VOCs to generate secondary hazardous chemical byproducts.',
  prohibitedTechnologies: [
    'Direct Ozone Generators (often falsely marketed as "activated oxygen", "mountain air", or "energized air")',
    'Bipolar Ionizers and Electrostatic Precipitators without verified zero-ozone emissions certification (UL 2998 or CARB certified < 0.005 ppm)',
    'Uncertified Photocatalytic Oxidation (PCO) devices that produce ozone and formaldehyde byproducts'
  ],
  regulatoryCitations: [
    'US EPA (EPA 402-K-00-002): "Ozone Generators that are Sold as Air Cleaners - There is no safe level of ozone in occupied indoor spaces."',
    'California Air Resources Board (CARB Regulation § 94800): Prohibits sales of indoor air cleaning devices that emit ozone concentrations exceeding 0.050 ppm.',
    'World Health Organization (WHO): Highlights ground-level and indoor ozone as a major respiratory and cardiovascular toxicant.'
  ],
  recommendedAlternative: 'Always select mechanical True HEPA filtration with an activated carbon stage. Pure mechanical filtration emits ZERO ozone and produces zero chemical byproducts.'
};

/**
 * GET /api/indoor/guide
 */
router.get('/guide', (_req: Request, res: Response) => {
  res.json({
    success: true,
    guidelines: INDOOR_GUIDELINES,
    ozoneAlert: OZONE_SAFETY_ALERT,
    quickSummary: 'Evidence-based indoor defense: 1. Wet-mop surfaces (avoid dry sweeping); 2. Seal envelope drafts; 3. Use certified mechanical True HEPA filters with appropriate CADR; 4. Strictly avoid ozone-generating cleaners.'
  });
});

/**
 * POST /api/indoor/cadr-calc
 * Calculate required Clean Air Delivery Rate (CADR) for a room
 */
router.post('/cadr-calc', (req: Request, res: Response) => {
  const roomLengthFt = Number(req.body.roomLengthFt) || 12;
  const roomWidthFt = Number(req.body.roomWidthFt) || 12;
  const ceilingHeightFt = Number(req.body.ceilingHeightFt) || 10;
  const targetAch = Number(req.body.targetAirChangesPerHour) || 4;

  const areaSqFt = roomLengthFt * roomWidthFt;
  const volumeCuFt = areaSqFt * ceilingHeightFt;
  // CADR (CFM) = (Volume in cu ft * ACH) / 60 min
  const requiredCadrCfm = Math.round((volumeCuFt * targetAch) / 60);
  const requiredCadrM3h = Math.round(requiredCadrCfm * 1.699);

  res.json({
    success: true,
    roomDimensions: {
      lengthFt: roomLengthFt,
      widthFt: roomWidthFt,
      heightFt: ceilingHeightFt,
      areaSqFt,
      volumeCuFt
    },
    targetAirChangesPerHour: targetAch,
    recommendedCadrCfm: requiredCadrCfm,
    recommendedCadrM3h: requiredCadrM3h,
    ruleOfThumb: 'As a general guideline (AHAM AC-1 Standard), your purifier CADR (in CFM) should equal at least 2/3 of the room area in square feet for an 8-foot ceiling.'
  });
});

export default router;
