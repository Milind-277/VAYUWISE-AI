import { GoogleGenAI } from '@google/genai';
import { AqiReading } from '../types/aqi.js';

export interface FamilyProfileConsent {
  consentGranted: boolean;
  hasInfantOrChild?: boolean;
  hasElderly?: boolean;
  hasAsthmaOrRespiratory?: boolean;
  hasHeartCondition?: boolean;
  commuteMode?: string;
  residenceFloor?: number;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface DailyFamilyActionPlan {
  status: 'success' | 'fallback';
  generatedAt: string;
  city: string;
  currentAqi: number;
  category: string;
  sourceAttribution: string;
  modelUsed: string;
  summaryGuidance: string;
  morningWindow: {
    recommendedTime: string;
    advice: string;
    ventilationStatus: 'Keep Windows Closed' | 'Ventilate With Filter' | 'Safe To Open';
  };
  commutePlan: {
    safeTravelMode: string;
    ppeRecommendation: string;
    notes: string;
  };
  indoorAirPlan: {
    purificationSetting: string;
    cookingPrecaution: string;
    cleaningTechnique: string;
  };
  eveningRoutine: {
    outdoorSafety: string;
    childrenElderlyProtocol: string;
  };
  cautionaryNotes: string[];
}

export class GeminiService {
  private static client: GoogleGenAI | null = null;

  public static getPrimaryModel(): string {
    return process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
  }

  /**
   * Verified model candidate cascade in priority order
   */
  private static getModelCascade(): string[] {
    const configured = this.getPrimaryModel();
    const fallbacks = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash'];
    const unique = [configured, ...fallbacks.filter(m => m !== configured)];
    return unique;
  }

  private static getClient(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!this.client && key) {
      try {
        this.client = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI client:', err);
      }
    }
    return this.client;
  }

  public static isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY?.trim();
    return Boolean(key && key.length > 5);
  }

  /**
   * Attempts generation through the model cascade (handling 503 spikes or 404 deprecations)
   */
  private static async generateWithCascade(prompt: string): Promise<{ text: string; modelUsed: string }> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Gemini API client is not configured.');
    }

    const models = this.getModelCascade();
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: prompt
        });

        const reply = response.text?.trim();
        if (reply) {
          return { text: reply, modelUsed: `Google Gemini (${model})` };
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        console.warn(`[GeminiService] Attempt with model '${model}' failed: ${msg}. Cascading to next candidate...`);
      }
    }

    throw lastError || new Error('All candidate Gemini models failed.');
  }

  /**
   * Sanitizes and minimizes data sent to Gemini to uphold privacy standards
   */
  private static buildMinimalContext(aqiData: AqiReading, profileConsent?: FamilyProfileConsent) {
    const minimal: Record<string, unknown> = {
      location: aqiData.city,
      currentAqi: aqiData.aqi,
      category: aqiData.category,
      dominantPollutant: aqiData.dominantPollutant,
      dataSourceType: aqiData.dataSource,
      pm2_5_ugm3: aqiData.pollutants.pm2_5?.value,
      pm10_ugm3: aqiData.pollutants.pm10?.value,
      weather: {
        temp_c: aqiData.weather.temperature,
        humidity_pct: aqiData.weather.humidity,
        wind_kmh: aqiData.weather.windSpeed,
        dispersionPotential: aqiData.weather.dispersionPotential
      }
    };

    if (profileConsent?.consentGranted) {
      minimal.vulnerabilities = {
        hasYoungChildren: profileConsent.hasInfantOrChild ?? false,
        hasElderlyFamily: profileConsent.hasElderly ?? false,
        hasRespiratoryRisk: profileConsent.hasAsthmaOrRespiratory ?? false,
        commuteMode: profileConsent.commuteMode ?? 'public'
      };
    } else {
      minimal.vulnerabilities = 'No direct identifiers or family profile flags shared (anonymized mode)';
    }

    return minimal;
  }

  /**
   * Context-Aware Chat Assistant
   */
  public static async chatWithAssistant(
    message: string,
    history: ChatMessage[],
    aqiData: AqiReading,
    profileConsent?: FamilyProfileConsent,
    language: 'en' | 'hi' | 'mr' = 'en'
  ): Promise<{ response: string; modelUsed: string; isAiGenerated: boolean }> {
    const languageInstruction = language === 'hi' 
      ? 'Reply in clear, compassionate Hindi (Devanagari script).' 
      : language === 'mr' 
      ? 'Reply in clear, compassionate Marathi (Devanagari script).' 
      : 'Reply in clear, empathetic, and scientifically grounded English.';

    const systemPrompt = `You are VAYUWISE AI, an expert, caring, and scientifically grounded Clean-Air Companion for urban families.
Your mission is to help families navigate severe winter smog and urban air pollution with actionable, practical advice.

CRITICAL SAFETY & INTEGRITY RULES:
1. Always ground advice in the provided real-time AQI and weather context.
2. If specific data is missing, transparently acknowledge it rather than inventing numbers.
3. Indoor clean-air guidance must align with WHO and US EPA IAQ standards:
   - Recommend True HEPA filtration and DIY Corsi-Rosenthal boxes.
   - EXPLICIT WARNING: Never recommend or approve ozone-generating air purifiers, ionizers, or uncertified photocatalytic cleaners that produce ozone, as ozone is a severe lung irritant.
   - Advise wet-mopping instead of dry-sweeping to prevent resuspending particulate matter.
   - Advise running kitchen exhaust during cooking and avoiding incense/agarbatti and mosquito coils during high smog.
4. Outdoor routine guidance:
   - Cold morning ground temperatures and low boundary layer mixing trap vehicle exhaust near the surface. Recommend postponing vigorous exercise until the midday sun expands the boundary layer.
5. Masks: Certified N95 / FFP2 masks with a proper tight facial seal offer effective particulate filtration. Surgical or cloth masks do NOT filter sub-micron PM2.5.
6. Language rule: ${languageInstruction}
7. Tone: Warm, reassuring, actionable, and strictly evidence-backed without catastrophic fear-mongering or false medical cures.`;

    const contextPayload = JSON.stringify(this.buildMinimalContext(aqiData, profileConsent));

    if (this.isConfigured()) {
      try {
        const fullPrompt = `${systemPrompt}

CURRENT GROUND TRUTH ENVIRONMENTAL CONTEXT:
${contextPayload}

USER QUESTION:
${message}`;

        const result = await this.generateWithCascade(fullPrompt);
        return {
          response: result.text,
          modelUsed: result.modelUsed,
          isAiGenerated: true
        };
      } catch (err) {
        console.warn('[GeminiService] Remote generation cascade failed, reverting to local clean-air rules engine:', err);
      }
    }

    // Graceful Rule-Based Clean-Air Intelligence Fallback
    const fallbackResponse = this.generateRuleBasedChatResponse(message, aqiData, profileConsent, language);
    return {
      response: fallbackResponse,
      modelUsed: 'VayuWise Local Clean-Air Rules Engine (Offline Fallback)',
      isAiGenerated: false
    };
  }

  /**
   * Generates a Personalized Daily Family Action Plan with Structured Schema
   */
  public static async generateActionPlan(
    aqiData: AqiReading,
    profileConsent?: FamilyProfileConsent,
    language: 'en' | 'hi' | 'mr' = 'en'
  ): Promise<DailyFamilyActionPlan> {
    const context = this.buildMinimalContext(aqiData, profileConsent);

    if (this.isConfigured()) {
      try {
        const prompt = `You are VAYUWISE AI. Based on the following urban air quality context, generate a personalized, structured Daily Clean-Air Action Plan for a family.

Environmental Data:
${JSON.stringify(context, null, 2)}

Produce a valid JSON object matching the following structure exactly (do not enclose in markdown code fences if possible, or use standard json format):
{
  "summaryGuidance": "A 2-sentence empathetic overview of today's air quality and family priority.",
  "morningWindow": {
    "recommendedTime": "Optimal morning window or stay indoors note",
    "advice": "Actionable advice for morning activities and school drops",
    "ventilationStatus": "Keep Windows Closed"
  },
  "commutePlan": {
    "safeTravelMode": "Metro rail, bus, or sealed car recommend",
    "ppeRecommendation": "N95/FFP2 recommendation details",
    "notes": "Route or timing tip"
  },
  "indoorAirPlan": {
    "purificationSetting": "HEPA setting recommendation",
    "cookingPrecaution": "Kitchen exhaust and smoke reduction",
    "cleaningTechnique": "Wet mopping vs dry sweeping"
  },
  "eveningRoutine": {
    "outdoorSafety": "Evening exercise or play guidance",
    "childrenElderlyProtocol": "Protection protocol for vulnerable members"
  },
  "cautionaryNotes": [
    "Strict warning against ozone air cleaners",
    "Avoid incense/mosquito coils"
  ]
}`;

        const result = await this.generateWithCascade(prompt);
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            status: 'success',
            generatedAt: new Date().toISOString(),
            city: aqiData.city,
            currentAqi: aqiData.aqi,
            category: aqiData.category,
            sourceAttribution: `${aqiData.sourceName} (${aqiData.dataSource})`,
            modelUsed: result.modelUsed,
            summaryGuidance: parsed.summaryGuidance || 'Keep vulnerable family members protected indoors during peak morning smog hours.',
            morningWindow: {
              recommendedTime: parsed.morningWindow?.recommendedTime || '11:30 AM - 1:30 PM',
              advice: parsed.morningWindow?.advice || 'Avoid outdoor jogging before 9:00 AM due to surface emission trapping.',
              ventilationStatus: parsed.morningWindow?.ventilationStatus || 'Keep Windows Closed'
            },
            commutePlan: {
              safeTravelMode: parsed.commutePlan?.safeTravelMode || 'Metro Rail or High-Occupancy AC Transit',
              ppeRecommendation: parsed.commutePlan?.ppeRecommendation || 'Certified N95 / FFP2 mask with continuous facial seal',
              notes: parsed.commutePlan?.notes || 'Avoid two-wheeler commutes during morning rush hour.'
            },
            indoorAirPlan: {
              purificationSetting: parsed.indoorAirPlan?.purificationSetting || 'Continuous medium speed True HEPA air filtration',
              cookingPrecaution: parsed.indoorAirPlan?.cookingPrecaution || 'Run kitchen exhaust fan and cover pans to reduce fine cooking aerosols',
              cleaningTechnique: parsed.indoorAirPlan?.cleaningTechnique || 'Damp micro-fiber cloth and wet mopping only'
            },
            eveningRoutine: {
              outdoorSafety: parsed.eveningRoutine?.outdoorSafety || 'Move children indoor playtime; avoid roadside parks after sunset',
              childrenElderlyProtocol: parsed.eveningRoutine?.childrenElderlyProtocol || 'Keep rescue inhalers accessible; keep windows sealed as nocturnal cooling traps emissions'
            },
            cautionaryNotes: parsed.cautionaryNotes || [
              'Never use ozone-generating air purifiers or uncertified ionizers.',
              'Avoid burning incense (agarbatti) or mosquito coils indoors.'
            ]
          };
        }
      } catch (err) {
        console.warn('[GeminiService] Remote action plan generation failed, using local rule-based plan:', err);
      }
    }

    // High-Quality Rule-Based Action Plan
    return this.generateRuleBasedActionPlan(aqiData, profileConsent);
  }

  /**
   * Rule-based action plan for offline / fallback scenarios
   */
  private static generateRuleBasedActionPlan(aqiData: AqiReading, profileConsent?: FamilyProfileConsent): DailyFamilyActionPlan {
    const aqi = aqiData.aqi;
    const isSevere = aqi > 300;
    const isPoor = aqi > 200;
    const hasVulnerable = profileConsent?.hasInfantOrChild || profileConsent?.hasElderly || profileConsent?.hasAsthmaOrRespiratory;

    let summary = `Air Quality in ${aqiData.city} is currently ${aqiData.category} (Index: ${aqi}). `;
    if (isSevere) {
      summary += 'Atmospheric ventilation is constrained. Prioritize indoor True HEPA filtration and restrict non-essential outdoor transit.';
    } else if (isPoor) {
      summary += 'Particulate levels are elevated. Plan outdoor travel during midday hours and ensure certified N95 respirators for high-traffic corridors.';
    } else {
      summary += 'Air quality is manageable. Ventilate during favorable midday hours and use mass transit to keep urban emissions low.';
    }

    return {
      status: 'fallback',
      generatedAt: new Date().toISOString(),
      city: aqiData.city,
      currentAqi: aqi,
      category: aqiData.category,
      sourceAttribution: `${aqiData.sourceName} (${aqiData.dataSource})`,
      modelUsed: 'VayuWise Local Clean-Air Rules Engine (Offline Fallback)',
      summaryGuidance: summary,
      morningWindow: {
        recommendedTime: isPoor ? '12:00 PM - 3:30 PM (Solar mixing window)' : '10:00 AM - 4:00 PM',
        advice: isSevere 
          ? 'Morning surface boundary layers trap vehicle exhaust at ground level. Move children sports indoors and cancel early morning outdoor jogs.'
          : 'Cold morning air holds concentrated particulate matter. Postpone outdoor fitness until after 9:30 AM.',
        ventilationStatus: isSevere ? 'Keep Windows Closed' : (isPoor ? 'Keep Windows Closed' : 'Ventilate With Filter')
      },
      commutePlan: {
        safeTravelMode: 'Metro Rail or Electric Transit with Sealed Cabin',
        ppeRecommendation: isPoor 
          ? 'Certified N95 / FFP2 mask with adjustable nose clip (cloth masks do not filter sub-micron PM2.5)' 
          : 'N95 mask recommended for two-wheeler commuters and roadside pedestrians',
        notes: 'Keep vehicle windows sealed with air recirculation turned ON in heavy traffic.'
      },
      indoorAirPlan: {
        purificationSetting: isSevere 
          ? 'True HEPA (H13/H14) running continuously on High/Turbo in bedrooms' 
          : 'True HEPA or DIY Corsi-Rosenthal Box on medium speed',
        cookingPrecaution: 'Switch on kitchen exhaust 2 minutes before cooking. Keep kitchen door closed to protect living areas.',
        cleaningTechnique: 'Wet-mop floors twice daily. Strictly avoid dry broom sweeping which aerosolizes settled particulate matter.'
      },
      eveningRoutine: {
        outdoorSafety: isPoor 
          ? 'Cooling evening temperatures reduce vertical mixing. Keep doors closed by 6:00 PM.' 
          : 'Limit evening park visits near major arterial traffic roads.',
        childrenElderlyProtocol: hasVulnerable
          ? 'Children and elderly with respiratory sensitivity should remain in purified indoor spaces; keep prescribed maintenance inhalers handy.'
          : 'Avoid vigorous evening running along traffic roads; indoor yoga or light exercise recommended.'
      },
      cautionaryNotes: [
        'WARNING: Avoid ozone-generating air purifiers, ionizers, and uncertified UV-PCO cleaners that emit ozone (a toxic pulmonary irritant).',
        'Avoid indoor burning of incense sticks (agarbatti), camphor, or mosquito coils which can elevate indoor PM2.5 significantly.',
        'Data grounded in metrics from ' + aqiData.sourceName
      ]
    };
  }

  /**
   * Rule-based conversational fallback
   */
  private static generateRuleBasedChatResponse(
    message: string,
    aqiData: AqiReading,
    profileConsent?: FamilyProfileConsent,
    language: 'en' | 'hi' | 'mr' = 'en'
  ): string {
    const q = message.toLowerCase();
    const city = aqiData.city;
    const aqi = aqiData.aqi;
    const category = aqiData.category;

    if (language === 'hi') {
      if (q.includes('mask') || q.includes('मास्क')) {
        return `वर्तमान में ${city} में वायु गुणवत्ता सूचकांक ${aqi} (${category}) है। PM2.5 के सूक्ष्म कणों से बचाव के लिए केवल प्रमाणित N95 या FFP2 मास्क का उपयोग करें। सामान्य कपड़े या सर्जिकल मास्क सूक्ष्म धुएं को नहीं रोक पाते।`;
      }
      return `${city} में वर्तमान वायु गुणवत्ता ${category} स्तर (AQI: ${aqi}) पर है। सुबह की ठंड में सतही प्रदूषण जमीन के पास जमा रहता है, इसलिए सुबह की सैर दोपहर 12 से 3 बजे के बीच करें। घर में गीला पोछा लगाएं और ओजोन बनाने वाले एयर प्यूरीफायर से बचें।`;
    }

    if (language === 'mr') {
      if (q.includes('mask') || q.includes('मास्क')) {
        return `${city} मध्ये सध्या AQI ${aqi} (${category}) आहे. PM2.5 कणांपासून संरक्षणासाठी केवळ प्रमाणित N95 किंवा FFP2 मास्क वापरा. साधे कापडी मास्क हे सूक्ष्म प्रदूषण रोखू शकत नाहीत.`;
      }
      return `${city} मधील हवेची गुणवत्ता सध्या ${category} (AQI: ${aqi}) आहे। सकाळच्या थंडीत हवेतील प्रदूषण जमिनीजवळ साचते, त्यामुळे बाहेरील व्यायाम दुपारच्या वेळी करणे सुरक्षित राहील। घरामध्ये ओला बोळा (Wet mopping) वापरा.`;
    }

    if (q.includes('mask') || q.includes('n95')) {
      return `For current air quality in ${city} (AQI: ${aqi}, ${category}), standard surgical and cloth masks are ineffective because sub-micron PM2.5 easily bypasses them. **Always use a certified N95, KN95, or FFP2 respirator** that forms a snug seal over your nose and mouth without gaps.`;
    }

    if (q.includes('purifier') || q.includes('hepa') || q.includes('filter')) {
      return `When choosing an indoor air purifier for ${city}:
1. **Choose True HEPA (H13 or H14)** mechanical filtration combined with an activated carbon filter for VOCs and odors.
2. **CADR (Clean Air Delivery Rate)** should match your room size: Clean Air Delivery Rate (CFM) >= 2/3 of room square footage.
3. **CRITICAL WARNING**: Strictly avoid ionizers, ozone generators, and plasma air cleaners. Ozone is a recognized lung toxin that exacerbates asthma and damages airway tissue per US EPA and WHO warnings.
4. **Budget Alternative**: A DIY Corsi-Rosenthal box using a standard box fan and four MERV-13 filters delivers comparable filtration at a fraction of the cost.`;
    }

    if (q.includes('exercise') || q.includes('walk') || q.includes('run') || q.includes('jog')) {
      return `In ${city} today (AQI: ${aqi}, ${category}):
- **Early Morning (6:00 AM - 9:00 AM)** is typically high risk. Nocturnal radiative cooling and calm winds trap vehicular exhaust and smoke close to ground level.
- **Vigorous outdoor exercise increases your minute ventilation rate 3-5 times**, drawing particulate matter deeper into pulmonary airways.
- **Safest Outdoor Window**: Plan outdoor walks during midday hours when solar heating expands the atmospheric boundary layer and dilutes surface pollution.`;
    }

    return `VayuWise Clean-Air Companion (Current Data for ${city}):
- **Air Quality**: AQI ${aqi} (${category}) | Dominant Pollutant: ${aqiData.dominantPollutant}
- **Data Source**: ${aqiData.sourceName} (${aqiData.dataSource})
- **Immediate Family Action**:
  1. Keep windows closed during early morning and late evening rush hours.
  2. Perform wet mopping instead of dry sweeping to prevent resuspending settled dust.
  3. If commuting through traffic corridors, wear a well-fitted N95 respirator.
  4. Avoid burning incense sticks, camphor, or mosquito coils indoors.`;
  }
}
