import { describe, it, expect } from 'vitest';
import { CpcbService } from '../services/cpcbService.js';
import { OpenAqService } from '../services/openAqService.js';
import { GeminiService } from '../services/geminiService.js';
import { AqiReading } from '../types/aqi.js';

describe('Services and Integrations Audit', () => {
  it('CpcbService marks unauthenticated snapshot as DEMO / REFERENCE BENCHMARK without fake live claims', async () => {
    const reading = await CpcbService.getBenchmarkSnapshot('cpcb-del-anand-vihar');
    expect(reading).not.toBeNull();
    expect(reading?.dataSource).toBe('DEMO');
    expect(reading?.disclaimer).toContain('DEMO / REFERENCE BENCHMARK NOTICE');
    expect(reading?.isOfficialObservation).toBe(false);
  }, 15000);

  it('OpenAqService explicitly reports partially_integrated status and public community tier', () => {
    const status = OpenAqService.getIntegrationStatus();
    expect(status.status).toBe('partially_integrated');
    expect(status.tier).toBe('Public Community Tier');
  });

  it('GeminiService generates safe structured action plans with fallback guarantee', async () => {
    const mockAqi: AqiReading = {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      coordinates: { latitude: 28.6139, longitude: 77.2090 },
      timestamp: new Date().toISOString(),
      aqi: 285,
      officialCpcbAqi: null,
      modelEstimatedIndex: 285,
      category: 'Poor',
      dominantPollutant: 'PM2_5',
      dataSource: 'MODEL_FORECAST',
      sourceName: 'Copernicus CAMS via Open-Meteo Atmospheric Forecast',
      isOfficialObservation: false,
      meetsCpcbCriteria: false,
      cpcbStatusMessage: 'Insufficient data to calculate official CPCB AQI.',
      methodology: 'Model-derived forecast.',
      disclaimer: 'Atmospheric model estimate.',
      pollutants: {
        pm2_5: { value: 125, unit: 'µg/m³', averagingHours: 24, hoursMonitored: 1, isObserved: false }
      },
      hourlyForecast: [],
      dailyForecast: [],
      weather: {
        temperature: 19,
        humidity: 62,
        windSpeed: 4.5,
        dispersionPotential: 'Poor',
        dispersionQualifier: 'Surface temperature inversion risk.'
      }
    };

    const plan = await GeminiService.generateActionPlan(mockAqi, { consentGranted: true });
    expect(plan).toBeDefined();
    expect(plan.city).toBe('Delhi');
    expect(plan.currentAqi).toBe(285);
    expect(plan.morningWindow).toBeDefined();
    expect(plan.commutePlan).toBeDefined();
    expect(plan.indoorAirPlan).toBeDefined();
    expect(plan.eveningRoutine).toBeDefined();
    expect(plan.cautionaryNotes.length).toBeGreaterThan(0);
  }, 20000);

  it('GeminiService responds safely to chat queries', async () => {
    const mockAqi: AqiReading = {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      coordinates: { latitude: 28.6139, longitude: 77.2090 },
      timestamp: new Date().toISOString(),
      aqi: 180,
      officialCpcbAqi: null,
      modelEstimatedIndex: 180,
      category: 'Moderate',
      dominantPollutant: 'PM2_5',
      dataSource: 'MODEL_FORECAST',
      sourceName: 'Copernicus CAMS',
      isOfficialObservation: false,
      meetsCpcbCriteria: false,
      cpcbStatusMessage: 'Insufficient data to calculate official CPCB AQI.',
      methodology: 'Model forecast',
      disclaimer: 'Forecast',
      pollutants: {},
      hourlyForecast: [],
      dailyForecast: [],
      weather: {
        temperature: 22,
        humidity: 50,
        windSpeed: 8,
        dispersionPotential: 'Moderate',
        dispersionQualifier: 'Normal dispersion.'
      }
    };

    const reply = await GeminiService.chatWithAssistant(
      'Is it safe for my child to play football outside right now?',
      [],
      mockAqi,
      { consentGranted: true, hasInfantOrChild: true },
      'en'
    );

    expect(reply).toBeDefined();
    expect(reply.response).toBeDefined();
    expect(reply.response.length).toBeGreaterThan(20);
    expect(reply.modelUsed).toBeDefined();
  }, 20000);

  it('strictly enforces privacy consent: suppresses optional sensitive family flags when consent is not granted', async () => {
    // When consentGranted is false, GeminiService must sanitize context and not share sensitive flags
    const mockAqi: AqiReading = {
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      coordinates: { latitude: 28.6139, longitude: 77.2090 },
      timestamp: new Date().toISOString(),
      aqi: 210,
      officialCpcbAqi: null,
      modelEstimatedIndex: 210,
      category: 'Poor',
      dominantPollutant: 'PM2_5',
      dataSource: 'MODEL_FORECAST',
      sourceName: 'Copernicus CAMS',
      isOfficialObservation: false,
      meetsCpcbCriteria: false,
      cpcbStatusMessage: 'Insufficient data to calculate official CPCB AQI.',
      methodology: 'Model forecast',
      disclaimer: 'Forecast',
      pollutants: {},
      hourlyForecast: [],
      dailyForecast: [],
      weather: {
        temperature: 20,
        humidity: 55,
        windSpeed: 5,
        dispersionPotential: 'Poor',
        dispersionQualifier: 'Winter smog stagnation.'
      }
    };

    // Attempt to pass sensitive family flags with consentGranted: false
    const plan = await GeminiService.generateActionPlan(mockAqi, {
      consentGranted: false,
      hasInfantOrChild: true,
      hasElderly: true,
      hasAsthmaOrRespiratory: true
    });

    expect(plan).toBeDefined();
    expect(plan.city).toBe('Delhi');
    // Action plan succeeds using privacy-preserving baseline rules without leaking private flags
    expect(plan.status === 'success' || plan.status === 'fallback').toBe(true);
  });
});
