import axios from 'axios';

export interface OpenAqLocation {
  id: number;
  name: string;
  locality?: string;
  timezone: string;
  country: {
    code: string;
    name: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  sensors: Array<{
    id: number;
    name: string;
    parameter: {
      id: number;
      name: string;
      units: string;
      displayName: string;
    };
  }>;
}

export class OpenAqService {
  private static BASE_URL = 'https://api.openaq.org/v3';

  public static isApiKeyConfigured(): boolean {
    const key = process.env.OPENAQ_API_KEY?.trim();
    return Boolean(key && key.length > 5);
  }

  /**
   * Status and metadata describing the OpenAQ integration level
   */
  public static getIntegrationStatus() {
    return {
      status: 'partially_integrated',
      tier: this.isApiKeyConfigured() ? 'Authenticated Key Tier' : 'Public Community Tier',
      description: 'OpenAQ provides supplementary community and sensor station data. Regulatory continuous CAAQMS stations and Copernicus CAMS models are prioritized for official index reporting.',
      apiUrl: this.BASE_URL
    };
  }

  /**
   * Query nearby monitoring locations via OpenAQ v3 API
   */
  public static async getLocationsNear(lat: number, lon: number, radiusKm: number = 25): Promise<OpenAqLocation[]> {
    try {
      const headers: Record<string, string> = {};
      const key = process.env.OPENAQ_API_KEY?.trim();
      if (key) {
        headers['X-API-Key'] = key;
      }

      const response = await axios.get<{ results: OpenAqLocation[] }>(`${this.BASE_URL}/locations`, {
        params: {
          coordinates: `${lat},${lon}`,
          radius: radiusKm * 1000,
          limit: 5
        },
        headers,
        timeout: 6000
      });

      return response.data?.results || [];
    } catch (err) {
      console.warn('[OpenAqService] Query to OpenAQ v3 API failed or rate-limited:', err instanceof Error ? err.message : String(err));
      return [];
    }
  }
}
