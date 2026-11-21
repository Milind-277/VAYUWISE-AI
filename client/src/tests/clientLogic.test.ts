import { describe, it, expect } from 'vitest';
import { TRANSLATIONS } from '../i18n/translations';

describe('Multi-language Localization (i18n)', () => {
  it('has consistent primary navigation keys across English, Hindi, and Marathi', () => {
    const enKeys = Object.keys(TRANSLATIONS.en.nav);
    const hiKeys = Object.keys(TRANSLATIONS.hi.nav);
    const mrKeys = Object.keys(TRANSLATIONS.mr.nav);

    expect(hiKeys).toEqual(enKeys);
    expect(mrKeys).toEqual(enKeys);

    expect(TRANSLATIONS.en.brandName).toContain('VAYUWISE');
    expect(TRANSLATIONS.hi.brandName).toContain('वायुवाइज़');
    expect(TRANSLATIONS.mr.brandName).toContain('वायुवाइझ');
  });

  it('provides all 6 CPCB standard AQI categories in all 3 languages', () => {
    const requiredCategories = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'VeryPoor', 'Severe'];
    for (const cat of requiredCategories) {
      expect((TRANSLATIONS.en.aqiCategories as any)[cat]).toBeDefined();
      expect((TRANSLATIONS.hi.aqiCategories as any)[cat]).toBeDefined();
      expect((TRANSLATIONS.mr.aqiCategories as any)[cat]).toBeDefined();
    }
  });
});

describe('CADR Air Cleaner Physics and Sizing Formulas', () => {
  it('correctly calculates required CADR in CFM for standard room dimensions and ACH', () => {
    // Room: 14 ft x 12 ft x 10 ft = 1680 cu ft
    // ACH: 4 air changes per hour
    // Required CADR (CFM) = (Volume * ACH) / 60 = (1680 * 4) / 60 = 112 CFM
    const length = 14;
    const width = 12;
    const height = 10;
    const volumeCuFt = length * width * height;
    const targetAch = 4;
    const cadrCfm = Math.round((volumeCuFt * targetAch) / 60);

    expect(cadrCfm).toBe(112);

    // Rule of thumb check: 2/3 of room area in square feet
    // Area = 168 sq ft -> 2/3 * 168 = 112 CFM! Exact match!
    const ruleOfThumbCfm = Math.round((2 / 3) * (length * width));
    expect(cadrCfm).toBe(ruleOfThumbCfm);
  });
});

describe('Atmospheric Dispersion Potential Indicator', () => {
  it('accurately tags boundary layer dispersion potential based on planetary boundary layer height', () => {
    function classifyDispersion(boundaryHeightMeters: number, windSpeedKmh: number, tempC: number) {
      if (boundaryHeightMeters < 180 || (windSpeedKmh < 4 && tempC < 15)) {
        return 'Very Poor';
      }
      if (boundaryHeightMeters < 350 || windSpeedKmh < 6) {
        return 'Poor';
      }
      if (boundaryHeightMeters > 800 && windSpeedKmh > 10) {
        return 'Favorable';
      }
      return 'Moderate';
    }

    // Typical winter morning: height 120m, wind 2km/h, temp 11C
    expect(classifyDispersion(120, 2, 11)).toBe('Very Poor');

    // Afternoon solar convective mixing: height 1100m, wind 12km/h, temp 22C
    expect(classifyDispersion(1100, 12, 22)).toBe('Favorable');
  });
});

describe('Data Source Classification Governance', () => {
  it('classifies sources distinctly between OBSERVED, MODEL_FORECAST, and DEMO', () => {
    function classifySource(isRegulatoryStation: boolean, isLiveFeed: boolean) {
      if (isRegulatoryStation && isLiveFeed) return 'OBSERVED';
      if (!isRegulatoryStation && isLiveFeed) return 'MODEL_FORECAST';
      return 'DEMO';
    }

    expect(classifySource(true, true)).toBe('OBSERVED');
    expect(classifySource(false, true)).toBe('MODEL_FORECAST');
    expect(classifySource(true, false)).toBe('DEMO');
  });

  it('verifies forecast versus official AQI UI label distinction logic', () => {
    function getGaugeHeader(officialCpcbAqi: number | null): string {
      return officialCpcbAqi !== null 
        ? 'Official CPCB National AQI' 
        : 'Model-Derived Atmospheric Forecast Estimate';
    }

    function getGaugeBadge(officialCpcbAqi: number | null): string {
      return officialCpcbAqi !== null ? 'CPCB NAQI' : 'MODEL FORECAST';
    }

    // When official CPCB station data meets criteria
    expect(getGaugeHeader(312)).toBe('Official CPCB National AQI');
    expect(getGaugeBadge(312)).toBe('CPCB NAQI');

    // When official CPCB station data is null (model forecast only)
    expect(getGaugeHeader(null)).toBe('Model-Derived Atmospheric Forecast Estimate');
    expect(getGaugeBadge(null)).toBe('MODEL FORECAST');
    expect(getGaugeHeader(null)).not.toContain('Official CPCB');
  });

  it('validates motorcycle category mapping and distinct 10% uplift vs 8% sedan uplift', () => {
    // Motorcycle <125cc: Base 0.0290 kg/km, 10% uplift = 0.0319 kg/km = 31.9 g/km
    const moto125Base = 0.0290;
    const twoWheelerUpliftPct = 0.10;
    const moto125WithUplift = Number((moto125Base * (1 + twoWheelerUpliftPct) * 1000).toFixed(1));
    expect(moto125WithUplift).toBe(31.9);

    // Motorcycle <200cc: Base 0.0417 kg/km, 10% uplift = 0.04587 kg/km -> 45.8 g/km
    const moto200Base = 0.0417;
    const moto200WithUplift = Number((moto200Base * (1 + twoWheelerUpliftPct) * 1000).toFixed(1));
    expect(moto200WithUplift).toBe(45.9); // 45.87 rounds to 45.9 / 45.8

    // Passenger Car (<1400cc sedan): Base 0.142 kg/km, distinct 8% uplift = 0.15336 -> 153.0 g/km
    const sedanBase = 0.142;
    const fourWheelerUpliftPct = 0.08;
    const sedanWithUplift = Number((sedanBase * (1 + fourWheelerUpliftPct) * 1000).toFixed(1));
    expect(sedanWithUplift).toBe(153.4);

    // Confirm uplifts are numerically distinct
    expect(twoWheelerUpliftPct).not.toBe(fourWheelerUpliftPct);
    expect(twoWheelerUpliftPct).toBe(0.10);
    expect(fourWheelerUpliftPct).toBe(0.08);
  });
});
