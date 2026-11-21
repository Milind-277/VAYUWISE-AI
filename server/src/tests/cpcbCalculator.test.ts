import { describe, it, expect } from 'vitest';
import { 
  calculateSubIndex, 
  calculateOfficialCpcbAqi, 
  calculateModelEstimatedIndex, 
  getCategoryFromAqi, 
  CPCB_BREAKPOINTS 
} from '../utils/cpcbCalculator.js';
import { 
  calculateAvoidedCo2e, 
  calculateExposureProxy, 
  TRANSPORT_MODES 
} from '../utils/emissionFactors.js';

describe('CPCB AQI Calculator and Official Methodology', () => {
  it('correctly maps AQI values to official CPCB categories', () => {
    expect(getCategoryFromAqi(30)).toBe('Good');
    expect(getCategoryFromAqi(75)).toBe('Satisfactory');
    expect(getCategoryFromAqi(150)).toBe('Moderate');
    expect(getCategoryFromAqi(250)).toBe('Poor');
    expect(getCategoryFromAqi(350)).toBe('Very Poor');
    expect(getCategoryFromAqi(450)).toBe('Severe');
  });

  it('calculates PM2.5 sub-index accurately using linear interpolation', () => {
    // Breakpoint: 0-30 -> 0-50
    const resLow = calculateSubIndex('pm2_5', 15);
    expect(resLow).not.toBeNull();
    expect(resLow?.subIndex).toBe(25);
    expect(resLow?.category).toBe('Good');

    // Breakpoint: 31-60 -> 51-100
    const resMod = calculateSubIndex('pm2_5', 45);
    expect(resMod).not.toBeNull();
    expect(resMod?.category).toBe('Satisfactory');

    // Breakpoint: 121-250 -> 301-400
    const resHigh = calculateSubIndex('pm2_5', 200);
    expect(resHigh?.category).toBe('Very Poor');
  });

  it('rejects official CPCB AQI when fewer than 3 pollutants are monitored', () => {
    const singlePollutant = {
      pm2_5: { value: 180, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 24, isObserved: true }
    };
    const res = calculateOfficialCpcbAqi(singlePollutant, { isRegulatoryObservedStation: true });
    expect(res.isValid).toBe(false);
    expect(res.officialAqi).toBeNull();
    expect(res.statusMessage).toBe('Insufficient data to calculate official CPCB AQI.');
  });

  it('rejects official CPCB AQI when PM2.5 or PM10 is missing even with 3 gaseous pollutants', () => {
    const gaseousOnly = {
      no2: { value: 75, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 24, isObserved: true },
      so2: { value: 30, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 24, isObserved: true },
      co: { value: 1.5, unit: 'mg/m³', averagingHours: 8, hoursMonitored: 24, isObserved: true }
    };
    const res = calculateOfficialCpcbAqi(gaseousOnly, { isRegulatoryObservedStation: true });
    expect(res.isValid).toBe(false);
    expect(res.officialAqi).toBeNull();
    expect(res.statusMessage).toBe('Insufficient data to calculate official CPCB AQI.');
  });

  it('enforces CPCB Section 4.0 data sufficiency: rejects pollutant sub-index when monitored hours < 16h', () => {
    // 3 pollutants with PM2.5, but monitored duration is only 12 hours (fails CPCB 16-hour minimum requirement)
    const insufficientHours = {
      pm2_5: { value: 150, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 12, isObserved: true },
      pm10: { value: 260, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 12, isObserved: true },
      no2: { value: 65, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 12, isObserved: true }
    };
    const res = calculateOfficialCpcbAqi(insufficientHours, { isRegulatoryObservedStation: true });
    expect(res.isValid).toBe(false);
    expect(res.officialAqi).toBeNull();
    expect(res.statusMessage).toBe('Insufficient data to calculate official CPCB AQI.');
  });

  it('enforces 16-hour requirement on 8-hour metrics (CO/O3): rejects CO with only 8 hours of data (no 6-hour exception)', () => {
    // PM2.5 and PM10 have 24 hours, but CO has only 8 hours (less than CPCB 16-hour sufficiency requirement)
    const partialCo = {
      pm2_5: { value: 120, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 24, isObserved: true },
      pm10: { value: 180, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 24, isObserved: true },
      co: { value: 2.5, unit: 'mg/m³', averagingHours: 8, hoursMonitored: 8, isObserved: true } // fails 16h rule
    };
    const res = calculateOfficialCpcbAqi(partialCo, { isRegulatoryObservedStation: true });
    // CO is excluded because hoursMonitored < 16, leaving only 2 valid pollutants (PM2.5, PM10) -> fails 3-pollutant rule
    expect(res.isValid).toBe(false);
    expect(res.officialAqi).toBeNull();
    expect(res.statusMessage).toBe('Insufficient data to calculate official CPCB AQI.');
  });

  it('successfully calculates Official CPCB AQI with valid 24-hr and 8-hr averages meeting 16-hour rule', () => {
    const fullValid = {
      pm2_5: { value: 150, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 24, isObserved: true },
      pm10: { value: 260, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 24, isObserved: true },
      no2: { value: 65, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 18, isObserved: true },
      co: { value: 1.8, unit: 'mg/m³', averagingHours: 8, hoursMonitored: 16, isObserved: true } // >= 16h meets CPCB rule
    };
    const res = calculateOfficialCpcbAqi(fullValid, { isRegulatoryObservedStation: true });
    expect(res.isValid).toBe(true);
    expect(res.officialAqi).toBeGreaterThan(200);
    expect(res.statusMessage).toContain('Meets official CPCB criteria');
  });

  it('calculates Model Estimated Index for instantaneous forecast snapshots without claiming official CPCB status', () => {
    const modelSnapshot = {
      pm2_5: { value: 95, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 1, isObserved: false },
      pm10: { value: 160, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 1, isObserved: false }
    };
    const res = calculateModelEstimatedIndex(modelSnapshot);
    expect(res.modelIndex).toBeGreaterThan(100);
    expect(res.dominantPollutant).toBe('PM2_5');
    expect(res.statusMessage).toContain('Model-derived forecast index');
  });
});

describe('Impact Simulator, Sourced Emission Factors & Exposure Proxy', () => {
  it('calculates avoided transport CO2 based on India GHG Program factors with explicit occupancy', () => {
    const result = calculateAvoidedCo2e({
      distanceKm: 15,
      baselineMode: 'petrol_car', // 127.5 g CO2/pass-km (153g / 1.2 pass, India GHG Program 2015)
      alternativeMode: 'city_bus', // 15.2 g CO2/pass-km (0.015161 kg/pax-km, India GHG Program 2015)
      tripsPerWeek: 10
    });

    expect(result.baselineCo2eGramsPerTrip).toBe(1913);
    expect(result.alternativeCo2eGramsPerTrip).toBe(228);
    expect(result.avoidedCo2eGramsPerTrip).toBe(1685);
    expect(result.avoidedCo2eKgPerWeek).toBe(16.9);
    expect(result.percentageReduction).toBe(88);
    expect(result.assumptions.length).toBeGreaterThan(2);
    expect(result.sources[0]).toContain('India GHG Program');
    expect(result.sources[1]).toContain('India GHG Program');
  });

  it('correctly maps motorcycle <125cc and <200cc categories with distinct 10% uplift and 1.0 solo occupancy', () => {
    // Motorcycle <125cc: 0.0290 kg base * 1.10 uplift = 0.0319 kg/km = 31.9 g CO2/pass-km (@ 1.0 occupancy)
    const moto125 = calculateAvoidedCo2e({
      distanceKm: 10,
      baselineMode: 'petrol_two_wheeler',
      alternativeMode: 'city_bus',
      tripsPerWeek: 1
    });
    expect(moto125.baselineCo2eGramsPerTrip).toBe(319);
    expect(moto125.baselineModeName).toContain('<125cc');

    // Motorcycle <200cc: 0.0417 kg base * 1.10 uplift = 0.0458 kg/km = 45.8 g CO2/pass-km (@ 1.0 occupancy)
    const moto200 = calculateAvoidedCo2e({
      distanceKm: 10,
      baselineMode: 'petrol_two_wheeler_200cc',
      alternativeMode: 'city_bus',
      tripsPerWeek: 1
    });
    expect(moto200.baselineCo2eGramsPerTrip).toBe(458);
    expect(moto200.baselineModeName).toContain('<200cc');

    // Confirm assumptions document distinct 10% two-wheeler uplift and 1.0 solo occupancy
    expect(moto125.assumptions.some(a => a.includes('10% two-wheeler uplift') && a.includes('8% four-wheeler uplift'))).toBe(true);
  });

  it('verifies illustrative Metro MRTS traction assumptions and CEA v22.0 national grid context', () => {
    const metroCalc = calculateAvoidedCo2e({
      distanceKm: 20,
      baselineMode: 'petrol_car',
      alternativeMode: 'metro_rail',
      tripsPerWeek: 5
    });

    // Metro traction intensity 0.030 kWh/pax-km * 0.675 kg CO2/kWh = 20.25 -> 20.3 g CO2/pax-km
    // Alternative grams = 20 * 20.3 = 406 g
    expect(metroCalc.alternativeCo2eGramsPerTrip).toBe(406);
    expect(metroCalc.alternativeModeName).toContain('Illustrative Traction Grid Estimate');

    // Verify assumptions disclose CEA grid factor is a national power sector average, not a metro-specific factor
    expect(metroCalc.assumptions.some(a => a.includes('national weighted-average power sector grid emission factor') && a.includes('NOT a metro-specific factor'))).toBe(true);
    // Verify traction-only assumption disclosure (excluding station operations and lifecycle)
    expect(metroCalc.assumptions.some(a => a.includes('illustrative benchmark assumption') && a.includes('train traction electricity only'))).toBe(true);
  });

  it('verifies representative EV energy consumption assumptions and operational variability disclosures', () => {
    const evCalc = calculateAvoidedCo2e({
      distanceKm: 10,
      baselineMode: 'petrol_car',
      alternativeMode: 'electric_two_wheeler',
      tripsPerWeek: 5
    });

    // 0.025 kWh/km * 675 g CO2/kWh = 16.875 -> 16.9 g CO2/pass-km
    expect(evCalc.alternativeCo2eGramsPerTrip).toBe(169);
    expect(evCalc.assumptions.some(a => a.includes('representative assumptions') && a.includes('actual energy varies by vehicle model'))).toBe(true);
  });

  it('keeps primary concentration-time exposure proxy independent of mask filtration', () => {
    // Testing the exact smoke test scenario: baseline 200 ug/m3 for 2h vs optimized 60 ug/m3 for 1h
    const result = calculateExposureProxy({
      baselineConcentrationUgM3: 200,
      baselineDurationHours: 2,
      optimizedConcentrationUgM3: 60,
      optimizedDurationHours: 1,
      hasN95Mask: true
    });

    // Primary ambient proxy MUST be independent of mask filtration:
    // Baseline = 200 * 2 = 400 ug*h/m3
    // Optimized = 60 * 1 = 60 ug*h/m3 (NOT 3!)
    // Avoided = 400 - 60 = 340 ug*h/m3
    // Reduction = (340 / 400) * 100 = 85% (NOT 99%!)
    expect(result.baselineAmbientProxy).toBe(400);
    expect(result.optimizedAmbientProxy).toBe(60);
    expect(result.avoidedAmbientProxy).toBe(340);
    expect(result.ambientReductionPercentage).toBe(85);

    // Primary aliases remain aligned with ambient proxy
    expect(result.baselineIndex).toBe(400);
    expect(result.optimizedIndex).toBe(60);
    expect(result.reductionPercentage).toBe(85);

    // Separate illustrative mask scenario provides disclosed theoretical filtration
    expect(result.illustrativeMaskScenario).toBeDefined();
    expect(result.illustrativeMaskScenario?.nominalFiltrationEfficiency).toBe(0.95);
    expect(result.illustrativeMaskScenario?.illustrativeFilteredProxy).toBe(3); // 60 * 0.05 * 1 = 3
    expect(result.illustrativeMaskScenario?.illustrativeCombinedReductionPercentage).toBe(99);
    expect(result.illustrativeMaskScenario?.assumptions.length).toBe(3);
    expect(result.illustrativeMaskScenario?.fitLimitations).toContain('appropriate model');
    expect(result.illustrativeMaskScenario?.clinicalDisclaimer).toContain('Never claim a guaranteed medical');
  });

  it('verifies explicit non-medical disclaimers on exposure proxy', () => {
    const result = calculateExposureProxy({
      baselineConcentrationUgM3: 150,
      baselineDurationHours: 1,
      optimizedConcentrationUgM3: 50,
      optimizedDurationHours: 1
    });

    expect(result.disclaimer).toContain('does NOT measure internalized physiological pulmonary deposition');
    expect(result.disclaimer).toContain('guarantee medical/clinical outcomes');
  });
});
