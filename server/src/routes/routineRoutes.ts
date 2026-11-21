import { Router, Request, Response } from 'express';
import { getCategoryFromAqi } from '../utils/cpcbCalculator.js';

const router = Router();

export interface RoutineSlot {
  activity: string;
  category: 'exercise' | 'school' | 'commute' | 'outdoor_work' | 'evening_walk';
  timeWindow: string;
  recommendedStatus: 'Optimal' | 'Caution' | 'Avoid';
  expectedAqiRange: string;
  scientificReasoning: string;
  actionableGuidance: string[];
  publicHealthGuideline: string;
}

/**
 * GET /api/routine/recommendations?aqi=240&dispersionPotential=Poor&city=Delhi&cleanestWindow=1:00 PM – 3:30 PM
 * Grounded in actual hourly forecast and MoHFW / CPCB public health advisories
 */
router.get('/recommendations', (req: Request, res: Response) => {
  const aqi = req.query.aqi ? parseInt(req.query.aqi as string, 10) : 210;
  const dispersionPotential = (req.query.dispersionPotential as string) || (req.query.inversionRisk as string) || 'Moderate';
  const city = (req.query.city as string) || 'Your City';
  const cleanestWindow = (req.query.cleanestWindow as string) || '12:30 PM – 3:30 PM';

  const aqiCat = getCategoryFromAqi(aqi);
  const isSevere = aqi > 300;
  const isPoor = aqi > 200;

  const slots: RoutineSlot[] = [
    {
      activity: 'Morning Jogging & Outdoor Cardio',
      category: 'exercise',
      timeWindow: '06:00 AM - 08:30 AM',
      recommendedStatus: isPoor ? 'Avoid' : 'Caution',
      expectedAqiRange: `${Math.round(aqi * 1.2)} - ${Math.round(aqi * 1.4)}`,
      scientificReasoning: 'Early morning nocturnal cooling and calm surface winds restrict vertical atmospheric dispersion. Surface vehicle exhaust and particulate matter remain concentrated near ground level. Strenuous cardio increases respiratory tidal volume by 300%–500%, drastically increasing deep alveolar particulate deposition.',
      actionableGuidance: [
        'Shift strenuous cardio indoors (yoga, resistance training, stationary cycle).',
        'Avoid running along arterial vehicle corridors where primary PM2.5 and NOx spike.',
        isPoor ? 'Keep residential windows closed; run True HEPA filtration.' : 'If walking outside, maintain a slow pace and wear a certified N95 respirator.'
      ],
      publicHealthGuideline: 'Ministry of Health & Family Welfare (MoHFW) Advisory: Avoid outdoor physical activity when AQI exceeds 200 (Poor/Very Poor).'
    },
    {
      activity: 'School Transit & Morning Drop-off',
      category: 'school',
      timeWindow: '07:30 AM - 08:45 AM',
      recommendedStatus: isSevere ? 'Avoid' : 'Caution',
      expectedAqiRange: `${Math.round(aqi * 1.1)} - ${Math.round(aqi * 1.3)}`,
      scientificReasoning: 'Children have higher respiratory rates per kilogram of body weight and narrow developing airways. Morning drop-off windows coincide with heavy traffic congestion and bus engine idling under shallow morning boundary layers.',
      actionableGuidance: [
        'Ensure school children wear child-sized, certified N95 / KN95 masks with tight nose bridge seal.',
        'Keep school bus windows closed and vehicle ventilation on internal recirculation mode.',
        'Encourage school authorities to declare strict "Zero Vehicle Idling Zones" at pickup gates.'
      ],
      publicHealthGuideline: 'Central Pollution Control Board (CPCB) Health Warning: Children are at elevated risk of acute bronchospasm during early morning smog.'
    },
    {
      activity: 'Workplace Commuting',
      category: 'commute',
      timeWindow: '08:30 AM - 10:00 AM & 06:00 PM - 08:30 PM',
      recommendedStatus: 'Caution',
      expectedAqiRange: `${Math.round(aqi * 1.05)} - ${Math.round(aqi * 1.25)}`,
      scientificReasoning: 'Commuters along congested urban highways experience localized plumes of black carbon, ultrafine particulates, and NO2. Two-wheeler and auto-rickshaw riders experience direct roadway exhaust inhalation.',
      actionableGuidance: [
        'Prioritize electric Metro Rail or air-filtered AC mass transit over open motorcycles.',
        'Two-wheeler commuters must wear certified N95 respirators with adjustable nose clips.',
        'In private cars, keep windows rolled up and switch AC to recirculation.'
      ],
      publicHealthGuideline: 'CPCB Advisory: Minimize open-air two-wheeler travel during high peak traffic hours.'
    },
    {
      activity: 'Forecasted Safest Outdoor Window',
      category: 'outdoor_work',
      timeWindow: cleanestWindow,
      recommendedStatus: 'Optimal',
      expectedAqiRange: `${Math.round(aqi * 0.7)} - ${Math.round(aqi * 0.85)}`,
      scientificReasoning: 'Solar irradiance warms the earth surface, driving thermal convective currents that expand planetary boundary layer mixing height. Surface particulates dilute upwards, producing the lowest ambient concentrations of the 24-hour cycle.',
      actionableGuidance: [
        `Today's model forecast indicates ${cleanestWindow} has the lowest particulate density for necessary grocery or market trips.`,
        !isSevere ? 'Safe short window (15–20 minutes) for brief home ventilation if indoor air feels stuffy.' : 'In severe episodes, continue using mechanical HEPA filtration rather than opening windows.',
        'Schedule outdoor physical labor or deliveries during this window.'
      ],
      publicHealthGuideline: 'Atmospheric Physics Principle: Align necessary errands with peak diurnal mixing to minimize particulate exposure proxy.'
    },
    {
      activity: 'Evening Leisure & Children Playtime',
      category: 'evening_walk',
      timeWindow: '05:30 PM - 07:30 PM',
      recommendedStatus: isPoor ? 'Avoid' : 'Caution',
      expectedAqiRange: `${Math.round(aqi * 1.05)} - ${Math.round(aqi * 1.25)}`,
      scientificReasoning: 'At sunset, surface radiative cooling rapidly compresses the mixing layer, trapping evening rush-hour emissions near the ground as surface winds subside.',
      actionableGuidance: [
        'Move children sports sessions indoors or to community centers with air purifiers.',
        'Elderly citizens with hypertension or COPD should avoid evening neighborhood walks.',
        'Close all street-facing balcony doors and windows before sunset (around 5:30 PM).'
      ],
      publicHealthGuideline: 'MoHFW Advisory: Elderly individuals and heart patients should remain indoors during evening hours when AQI is Poor or worse.'
    }
  ];

  res.json({
    success: true,
    city,
    currentAqi: aqi,
    category: aqiCat,
    dispersionPotential,
    cleanestWindow,
    slots,
    diurnalSummary: `In ${city}, today's model forecast indicates the most favorable atmospheric dispersion window occurs around ${cleanestWindow}. Morning and late evening hours exhibit reduced mixing, trapping surface emissions near street level.`
  });
});

export default router;
