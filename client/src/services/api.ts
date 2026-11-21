import { 
  AqiReading, 
  CityLocation, 
  RoutineSlot, 
  FamilyProfileConsent, 
  DailyFamilyActionPlan, 
  TransportMode, 
  Co2eCalculationResult, 
  ExposureProxyResult
} from '../types';

const API_BASE = '/api';

export const ApiService = {
  /**
   * Search cities with geocoding
   */
  async searchCities(query: string): Promise<CityLocation[]> {
    const res = await fetch(`${API_BASE}/aqi/search?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    return json.results || [];
  },

  /**
   * Fetch current AQI reading (live model or historical benchmark)
   */
  async getAqiReading(lat?: number, lon?: number, city?: string, source?: 'model' | 'benchmark'): Promise<AqiReading> {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());
    if (city) params.append('city', city);
    if (source) params.append('source', source);

    const res = await fetch(`${API_BASE}/aqi/current?${params.toString()}`);
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to fetch AQI reading');
    }
    return json.data;
  },

  /**
   * Get benchmark stations
   */
  async getOfficialStations(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/aqi/stations`);
    const json = await res.json();
    return json.stations || [];
  },

  /**
   * Get OpenAQ integration status
   */
  async getOpenAqStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/aqi/openaq-status`);
    const json = await res.json();
    return json.integration;
  },

  /**
   * Get smart routine recommendations grounded in hourly forecast
   */
  async getRoutineRecommendations(aqi: number, dispersionPotential: string, city: string, cleanestWindow?: string): Promise<{ slots: RoutineSlot[]; diurnalSummary: string }> {
    const params = new URLSearchParams({
      aqi: aqi.toString(),
      dispersionPotential,
      city
    });
    if (cleanestWindow) params.append('cleanestWindow', cleanestWindow);

    const res = await fetch(`${API_BASE}/routine/recommendations?${params.toString()}`);
    const json = await res.json();
    return {
      slots: json.slots || [],
      diurnalSummary: json.diurnalSummary || ''
    };
  },

  /**
   * Get indoor clean-air guidelines and ozone alerts
   */
  async getIndoorGuide(): Promise<any> {
    const res = await fetch(`${API_BASE}/indoor/guide`);
    return await res.json();
  },

  /**
   * Calculate required CADR
   */
  async calculateCadr(roomLengthFt: number, roomWidthFt: number, ceilingHeightFt: number, targetAch: number = 4) {
    const res = await fetch(`${API_BASE}/indoor/cadr-calc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomLengthFt, roomWidthFt, ceilingHeightFt, targetAirChangesPerHour: targetAch })
    });
    return await res.json();
  },

  /**
   * Get transport modes
   */
  async getTransportModes(): Promise<{ modes: TransportMode[]; cleanEnergyOptions: any[] }> {
    const res = await fetch(`${API_BASE}/simulator/modes`);
    const json = await res.json();
    return {
      modes: json.modes || [],
      cleanEnergyOptions: json.cleanEnergyOptions || []
    };
  },

  /**
   * Calculate Avoided CO2e
   */
  async calculateAvoidedCo2e(distanceKm: number, baselineMode: string, alternativeMode: string, tripsPerWeek: number): Promise<Co2eCalculationResult> {
    const res = await fetch(`${API_BASE}/simulator/calculate-co2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distanceKm, baselineMode, alternativeMode, tripsPerWeek })
    });
    const json = await res.json();
    if (!json.success || !json.result) {
      throw new Error(json.error || 'Failed to calculate CO2e');
    }
    return json.result;
  },

  /**
   * Calculate Exposure Proxy
   */
  async calculateExposureProxy(
    baselineConcentrationUgM3: number,
    baselineDurationHours: number,
    optimizedConcentrationUgM3: number,
    optimizedDurationHours: number,
    hasN95Mask: boolean
  ): Promise<ExposureProxyResult> {
    const res = await fetch(`${API_BASE}/simulator/exposure-proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baselineConcentrationUgM3,
        baselineDurationHours,
        optimizedConcentrationUgM3,
        optimizedDurationHours,
        hasN95Mask
      })
    });
    const json = await res.json();
    if (!json.success || !json.result) {
      throw new Error(json.error || 'Failed to calculate exposure proxy');
    }
    return json.result;
  },

  /**
   * Chat with Gemini
   */
  async chatWithGemini(
    message: string,
    history: any[],
    aqiContext: AqiReading,
    profileConsent?: FamilyProfileConsent,
    language: string = 'en'
  ) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        aqiContext,
        profileConsent,
        language
      })
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'AI chat request failed');
    }
    return json.data;
  },

  /**
   * Generate Family Action Plan
   */
  async generateActionPlan(
    aqiContext: AqiReading,
    profileConsent?: FamilyProfileConsent,
    language: string = 'en'
  ): Promise<DailyFamilyActionPlan> {
    const res = await fetch(`${API_BASE}/ai/action-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aqiContext,
        profileConsent,
        language
      })
    });
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to generate action plan');
    }
    return json.data;
  },

  /**
   * Check Gemini API Status
   */
  async getAiStatus() {
    const res = await fetch(`${API_BASE}/ai/status`);
    return await res.json();
  },

  /**
   * Get Community Board data
   */
  async getCommunityBoard(): Promise<{ data: any; reportGuide: any }> {
    const res = await fetch(`${API_BASE}/community/board`);
    const json = await res.json();
    return {
      data: json.data,
      reportGuide: json.reportGuide
    };
  },

  /**
   * Join a community pledge
   */
  async joinPledge(pledgeId: string) {
    const res = await fetch(`${API_BASE}/community/pledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pledgeId })
    });
    return await res.json();
  },

  /**
   * Report an open burning incident
   */
  async reportIncident(city: string, locationName: string, incidentType: string) {
    const res = await fetch(`${API_BASE}/community/report-incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, locationName, incidentType })
    });
    return await res.json();
  }
};
