import { describe, it, expect, beforeEach } from 'vitest';
import { chatRequestSchema, actionPlanRequestSchema, geminiRateLimiter } from '../routes/aiRoutes.js';
import { isOriginAllowed } from '../index.js';
import { GeminiService } from '../services/geminiService.js';
import { AqiReading } from '../types/aqi.js';

describe('Security & Production API Hardening Suite', () => {

  describe('1. Gemini Chat Input Validation', () => {
    it('accepts valid chat requests within 1,000 characters', () => {
      const validPayload = {
        message: 'How should my family plan outdoor activities during morning smog in Delhi?',
        history: [{ role: 'user', content: 'Hello' }],
        language: 'en'
      };
      const result = chatRequestSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe(validPayload.message);
      }
    });

    it('rejects empty or whitespace-only chat messages with validation error', () => {
      const emptyPayload = { message: '    \n\t   ' };
      const result = chatRequestSchema.safeParse(emptyPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.errors.map(e => e.message);
        expect(errorMessages).toContain('A non-empty message string is required');
      }
    });

    it('rejects non-string message types with validation error', () => {
      const invalidTypePayload = { message: 99999 };
      const result = chatRequestSchema.safeParse(invalidTypePayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.errors.map(e => e.message);
        expect(errorMessages.some(m => m.includes('string'))).toBe(true);
      }
    });

    it('rejects chat messages exceeding 1,000 characters', () => {
      const longMessage = 'X'.repeat(1001);
      const result = chatRequestSchema.safeParse({ message: longMessage });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.errors.map(e => e.message);
        expect(errorMessages).toContain('Message cannot exceed 1,000 characters');
      }
    });

    it('accepts chat messages with exactly 1,000 characters', () => {
      const maxMessage = 'A'.repeat(1000);
      const result = chatRequestSchema.safeParse({ message: maxMessage });
      expect(result.success).toBe(true);
    });

    it('rejects conversation histories exceeding 20 messages to prevent token flooding', () => {
      const oversizedHistory = Array.from({ length: 25 }, (_, i) => ({
        role: 'user' as const,
        content: `Message ${i}`
      }));
      const result = chatRequestSchema.safeParse({
        message: 'Valid query',
        history: oversizedHistory
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.errors.map(e => e.message);
        expect(errorMessages).toContain('History cannot exceed 20 messages');
      }
    });
  });

  describe('2. Action Plan Input Validation', () => {
    it('accepts valid action-plan requests with realistic AQI context', () => {
      const validPayload = {
        aqiContext: { aqi: 240, city: 'Delhi', category: 'Poor' },
        profileConsent: {
          consentGranted: true,
          hasInfantOrChild: true,
          hasAsthmaOrRespiratory: false,
          residenceFloor: 4
        },
        language: 'en'
      };
      const result = actionPlanRequestSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects invalid payloads with malformed consent floor numbers (> 100)', () => {
      const invalidPayload = {
        profileConsent: {
          residenceFloor: 250 // Exceeds realistic ceiling of 100
        }
      };
      const result = actionPlanRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('3. Production CORS Security', () => {
    beforeEach(() => {
      process.env.CLIENT_URL = 'https://vayuwise-production.onrender.com,https://cleanair.org';
      process.env.RENDER_EXTERNAL_URL = 'https://vayuwise-ai.onrender.com';
    });

    it('allows same-origin or curl requests (undefined origin)', () => {
      expect(isOriginAllowed(undefined)).toBe(true);
    });

    it('allows local development origins (http://localhost:5173)', () => {
      expect(isOriginAllowed('http://localhost:5173')).toBe(true);
      expect(isOriginAllowed('http://127.0.0.1:5173')).toBe(true);
      expect(isOriginAllowed('http://localhost:5000')).toBe(true);
    });

    it('allows explicitly configured CLIENT_URL production origins', () => {
      expect(isOriginAllowed('https://vayuwise-production.onrender.com')).toBe(true);
      expect(isOriginAllowed('https://cleanair.org')).toBe(true);
    });

    it('allows Render external URL (RENDER_EXTERNAL_URL)', () => {
      expect(isOriginAllowed('https://vayuwise-ai.onrender.com')).toBe(true);
    });

    it('rejects unauthorized third-party origins', () => {
      expect(isOriginAllowed('https://malicious-phishing-site.com')).toBe(false);
      expect(isOriginAllowed('http://unauthorized-domain.org')).toBe(false);
      expect(isOriginAllowed('https://fakevayuwise.com')).toBe(false);
    });
  });

  describe('4. Rate Limiting Middleware Across Gemini Endpoints', () => {
    it('enforces shared 10 req/min limit and triggers HTTP 429 on the 11th request', async () => {
      const testIp = '198.51.100.42'; // Unique test IP to avoid cross-test interference
      
      const createMockReq = (url: string) => ({
        ip: testIp,
        url,
        method: 'POST',
        headers: {},
        app: { get: () => 1 } // Simulates app.get('trust proxy')
      });

      let statusReceived = 200;
      let jsonPayload: any = null;

      const createMockRes = () => {
        const res: any = {
          setHeader: () => {},
          getHeader: () => undefined,
          status: (code: number) => {
            statusReceived = code;
            return res;
          },
          send: (data: any) => {
            jsonPayload = data;
            return res;
          },
          json: (data: any) => {
            jsonPayload = data;
            return res;
          }
        };
        return res;
      };

      // Issue 10 requests under the limit across both endpoints
      for (let i = 0; i < 7; i++) {
        let nextCalled = false;
        await new Promise<void>((resolve) => {
          geminiRateLimiter(createMockReq('/api/ai/chat') as any, createMockRes() as any, () => {
            nextCalled = true;
            resolve();
          });
        });
        expect(nextCalled).toBe(true);
      }

      for (let i = 0; i < 3; i++) {
        let nextCalled = false;
        await new Promise<void>((resolve) => {
          geminiRateLimiter(createMockReq('/api/ai/action-plan') as any, createMockRes() as any, () => {
            nextCalled = true;
            resolve();
          });
        });
        expect(nextCalled).toBe(true);
      }

      // The 11th request MUST be rate limited with HTTP 429
      let nextCalledOn11th = false;
      await new Promise<void>((resolve) => {
        const mockRes = createMockRes();
        geminiRateLimiter(createMockReq('/api/ai/chat') as any, mockRes as any, () => {
          nextCalledOn11th = true;
          resolve();
        });
        setTimeout(resolve, 50);
      });

      expect(nextCalledOn11th).toBe(false);
      expect(statusReceived).toBe(429);
      expect(jsonPayload?.error).toBe('Too Many Requests');
      expect(jsonPayload?.message).toContain('10 requests per minute');
    });
  });

  describe('5. Safe Error Handling & Deterministic Fallback', () => {
    it('GeminiService fallback action plan generates structured, valid plan without external API key', async () => {
      const mockAqi: AqiReading = {
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        coordinates: { latitude: 28.6139, longitude: 77.2090 },
        timestamp: new Date().toISOString(),
        aqi: 220,
        officialCpcbAqi: null,
        modelEstimatedIndex: 220,
        category: 'Poor',
        dominantPollutant: 'PM2_5',
        dataSource: 'MODEL_FORECAST',
        sourceName: 'Copernicus CAMS via Open-Meteo',
        isOfficialObservation: false,
        meetsCpcbCriteria: false,
        cpcbStatusMessage: 'Insufficient data for official CPCB NAQI',
        methodology: 'Model dispersion estimate',
        disclaimer: 'Model forecast proxy',
        pollutants: {},
        hourlyForecast: [],
        dailyForecast: [],
        weather: {
          temperature: 18,
          humidity: 65,
          windSpeed: 4,
          dispersionPotential: 'Poor',
          dispersionQualifier: 'Surface temperature inversion risk.'
        }
      };

      const plan = await GeminiService.generateActionPlan(mockAqi, { consentGranted: true });
      expect(plan).toBeDefined();
      expect(plan.city).toBe('Delhi');
      expect(plan.currentAqi).toBe(220);
      expect(plan.morningWindow).toBeDefined();
      expect(plan.commutePlan).toBeDefined();
      expect(plan.indoorAirPlan).toBeDefined();
      expect(plan.eveningRoutine).toBeDefined();
      expect(plan.cautionaryNotes.length).toBeGreaterThan(0);
      // Confirm cautionary notes contain ozone warning
      expect(plan.cautionaryNotes.some(n => n.toLowerCase().includes('ozone'))).toBe(true);
    });
  });
});
