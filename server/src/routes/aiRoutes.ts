import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { GeminiService, FamilyProfileConsent, ChatMessage } from '../services/geminiService.js';
import { OpenMeteoService } from '../services/openMeteoService.js';
import { AqiReading } from '../types/aqi.js';

const router = Router();

/**
 * Shared in-memory rate limiter for Gemini-backed AI endpoints.
 * Restricts callers to 10 requests per minute per IP address across all AI endpoints.
 *
 * NOTE ON ARCHITECTURE:
 * This rate limiter stores hit counters in Node.js process memory.
 * On multi-instance deployments (e.g. horizontally autoscaled clusters), counters
 * are local to each container instance rather than distributed (e.g. via Redis).
 * For single-instance Render Web Services, this provides robust, zero-dependency protection.
 */
export const geminiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // 10 requests per minute per IP
  standardHeaders: true, // Returns standard RateLimit-* headers
  legacyHeaders: false, // Disables deprecated X-RateLimit-* headers
  statusCode: 429,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'You have exceeded the clean-air AI assistant rate limit of 10 requests per minute. Please pause and try again in a moment.'
  },
  skip: (req) => process.env.NODE_ENV === 'test' && req.headers['x-bypass-ratelimit-test'] === 'true'
});

// Zod Validation Schemas
export const chatRequestSchema = z.object({
  message: z
    .string({ required_error: 'A message string is required', invalid_type_error: 'Message must be a string' })
    .trim()
    .min(1, 'A non-empty message string is required')
    .max(1000, 'Message cannot exceed 1,000 characters'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model', 'system']),
        content: z.string().max(2000)
      })
    )
    .max(20, 'History cannot exceed 20 messages')
    .optional(),
  aqiContext: z.record(z.any()).optional(),
  profileConsent: z
    .object({
      consentGranted: z.boolean().optional(),
      hasInfantOrChild: z.boolean().optional(),
      hasElderly: z.boolean().optional(),
      hasAsthmaOrRespiratory: z.boolean().optional(),
      hasHeartCondition: z.boolean().optional(),
      commuteMode: z.string().max(50).optional(),
      residenceFloor: z.number().int().min(0).max(100).optional()
    })
    .optional(),
  language: z.enum(['en', 'hi', 'mr']).optional()
});

export const actionPlanRequestSchema = z.object({
  aqiContext: z.record(z.any()).optional(),
  profileConsent: z
    .object({
      consentGranted: z.boolean().optional(),
      hasInfantOrChild: z.boolean().optional(),
      hasElderly: z.boolean().optional(),
      hasAsthmaOrRespiratory: z.boolean().optional(),
      hasHeartCondition: z.boolean().optional(),
      commuteMode: z.string().max(50).optional(),
      residenceFloor: z.number().int().min(0).max(100).optional()
    })
    .optional(),
  language: z.enum(['en', 'hi', 'mr']).optional()
});

/**
 * GET /api/ai/status
 * Check if Gemini API is configured
 */
router.get('/status', (_req: Request, res: Response) => {
  const isConfigured = GeminiService.isConfigured();
  res.json({
    success: true,
    isConfigured,
    model: GeminiService.getPrimaryModel(),
    fallbackAvailable: true,
    rateLimit: '10 requests per minute per IP',
    privacyNotice: 'No direct identifiers are transmitted. Optional sensitive family profile flags are shared with Gemini only after explicit consent.'
  });
});

/**
 * POST /api/ai/chat
 * Context-aware chat with Gemini (Rate limited & Validated)
 */
router.post('/chat', geminiRateLimiter, async (req: Request, res: Response) => {
  const parseResult = chatRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: parseResult.error.errors.map(e => e.message).join(', ')
    });
    return;
  }

  const { message, history, aqiContext, profileConsent, language } = parseResult.data;

  try {
    let aqiData: AqiReading;
    if (aqiContext && aqiContext.aqi) {
      aqiData = aqiContext as AqiReading;
    } else {
      aqiData = await OpenMeteoService.getAirQuality(28.6139, 77.2090, 'Delhi');
    }

    const isConsentGranted = Boolean(profileConsent?.consentGranted);
    const consent: FamilyProfileConsent = {
      consentGranted: isConsentGranted,
      hasInfantOrChild: isConsentGranted ? profileConsent?.hasInfantOrChild : undefined,
      hasElderly: isConsentGranted ? profileConsent?.hasElderly : undefined,
      hasAsthmaOrRespiratory: isConsentGranted ? profileConsent?.hasAsthmaOrRespiratory : undefined,
      commuteMode: isConsentGranted ? profileConsent?.commuteMode : undefined
    };

    const result = await GeminiService.chatWithAssistant(
      message,
      (history as ChatMessage[]) || [],
      aqiData,
      consent,
      language || 'en'
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in /api/ai/chat:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      success: false,
      error: 'Failed to process AI chat message',
      message: 'The clean-air assistant encountered an unexpected error. Please try again shortly.'
    });
  }
});

/**
 * POST /api/ai/action-plan
 * Generate personalized structured clean-air action plan (Rate limited & Validated)
 */
router.post('/action-plan', geminiRateLimiter, async (req: Request, res: Response) => {
  const parseResult = actionPlanRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: parseResult.error.errors.map(e => e.message).join(', ')
    });
    return;
  }

  const { aqiContext, profileConsent, language } = parseResult.data;

  try {
    let aqiData: AqiReading;
    if (aqiContext && aqiContext.aqi) {
      aqiData = aqiContext as AqiReading;
    } else {
      aqiData = await OpenMeteoService.getAirQuality(28.6139, 77.2090, 'Delhi');
    }

    const isConsentGranted = Boolean(profileConsent?.consentGranted);
    const consent: FamilyProfileConsent = {
      consentGranted: isConsentGranted,
      hasInfantOrChild: isConsentGranted ? profileConsent?.hasInfantOrChild : undefined,
      hasElderly: isConsentGranted ? profileConsent?.hasElderly : undefined,
      hasAsthmaOrRespiratory: isConsentGranted ? profileConsent?.hasAsthmaOrRespiratory : undefined,
      commuteMode: isConsentGranted ? profileConsent?.commuteMode : undefined
    };

    const plan = await GeminiService.generateActionPlan(
      aqiData,
      consent,
      language || 'en'
    );

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error in /api/ai/action-plan:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      success: false,
      error: 'Failed to generate personalized action plan',
      message: 'The clean-air planner encountered an unexpected error. Please try again shortly.'
    });
  }
});

export default router;
