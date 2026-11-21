export type DataSourceType = 'OBSERVED' | 'MODEL_FORECAST' | 'ESTIMATED' | 'DEMO';

export type AqiCategory = 
  | 'Good' 
  | 'Satisfactory' 
  | 'Moderate' 
  | 'Poor' 
  | 'Very Poor' 
  | 'Severe';

export interface PollutantDetail {
  value: number; // in ug/m3 (or mg/m3 for CO)
  unit: string;
  subIndex?: number | null;
  category?: AqiCategory;
  averagingHours: number; // 24 for PM2.5/PM10/NO2/SO2, 8 for CO/O3
  hoursMonitored?: number; // number of hours of continuous data
  isObserved: boolean;
}

export interface PollutantBreakdown {
  pm2_5?: PollutantDetail;
  pm10?: PollutantDetail;
  no2?: PollutantDetail;
  so2?: PollutantDetail;
  o3?: PollutantDetail;
  co?: PollutantDetail;
  nh3?: PollutantDetail;
  pb?: PollutantDetail;
}

export interface HourlyForecastPoint {
  time: string; // ISO string
  hour: number;
  aqi: number;
  category: AqiCategory;
  pm2_5: number;
  pm10: number;
  no2: number;
  o3: number;
  co: number;
  so2: number;
  recommendation?: string;
}

export interface DailyForecastPoint {
  date: string;
  dayName: string;
  avgAqi: number;
  maxAqi: number;
  minAqi: number;
  category: AqiCategory;
  dominantPollutant: string;
  summary: string;
}

export interface WeatherContext {
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection?: number; // degrees
  boundaryLayerHeight?: number; // meters (planetary boundary layer height)
  dispersionPotential: 'Favorable' | 'Moderate' | 'Poor' | 'Very Poor';
  dispersionQualifier: string;
}

export interface LowestPm25WindowForecast {
  timeWindow: string; // e.g. '2:00 PM – 4:00 PM'
  predictedPm25: number; // e.g. 58.7 µg/m³ (concentration only; no short-term CPCB AQI calculated)
  rationale: string;
  limitations: string;
}

// Backwards compatibility alias
export type CleanestWindowForecast = LowestPm25WindowForecast;

export interface AqiReading {
  city: string;
  state?: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  aqi: number; // Active displayed index (model estimate or official CPCB)
  officialCpcbAqi: number | null; // NULL if insufficient regulatory data
  modelEstimatedIndex: number; // Open-Meteo model-derived forecast index
  category: AqiCategory;
  dominantPollutant: string;
  dataSource: DataSourceType;
  sourceName: string;
  isOfficialObservation: boolean;
  meetsCpcbCriteria: boolean;
  cpcbStatusMessage: string;
  methodology: string;
  disclaimer: string;
  pollutants: PollutantBreakdown;
  hourlyForecast: HourlyForecastPoint[];
  dailyForecast: DailyForecastPoint[];
  weather: WeatherContext;
  lowestPm25Window?: LowestPm25WindowForecast;
  cleanestWindowToday?: LowestPm25WindowForecast; // Backwards-compatible alias
}

export interface CityLocation {
  name: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  hasOfficialStation: boolean;
  stationName?: string;
}
