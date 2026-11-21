export type DataSourceType = 'OBSERVED' | 'MODEL_FORECAST' | 'ESTIMATED' | 'DEMO';

export type AqiCategory = 
  | 'Good' 
  | 'Satisfactory' 
  | 'Moderate' 
  | 'Poor' 
  | 'Very Poor' 
  | 'Severe';

export interface PollutantDetail {
  value: number;
  unit: string;
  subIndex?: number | null;
  category?: AqiCategory;
  averagingHours: number;
  hoursMonitored?: number;
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
  time: string;
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
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  boundaryLayerHeight?: number;
  dispersionPotential: 'Favorable' | 'Moderate' | 'Poor' | 'Very Poor';
  dispersionQualifier: string;
}

export interface LowestPm25WindowForecast {
  timeWindow: string; // e.g. '2:00 PM – 4:00 PM'
  predictedPm25: number; // e.g. 58.7 µg/m³
  rationale: string;
  limitations: string;
}

// Backwards-compatible alias
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
  aqi: number; // Displayed index
  officialCpcbAqi: number | null; // NULL if criteria not met
  modelEstimatedIndex: number;
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
  cleanestWindowToday?: LowestPm25WindowForecast;
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

export interface RoutineSlot {
  activity: string;
  category: 'exercise' | 'school' | 'commute' | 'outdoor_work' | 'evening_walk';
  timeWindow: string;
  recommendedStatus: 'Optimal' | 'Caution' | 'Avoid';
  expectedAqiRange: string;
  scientificReasoning: string;
  actionableGuidance: string[];
  publicHealthGuideline?: string;
}

export interface FamilyProfileConsent {
  consentGranted: boolean;
  hasInfantOrChild?: boolean;
  hasElderly?: boolean;
  hasAsthmaOrRespiratory?: boolean;
  commuteMode?: string;
}

export interface DailyFamilyActionPlan {
  status: 'success' | 'fallback';
  generatedAt: string;
  city: string;
  currentAqi: number;
  category: string;
  sourceAttribution: string;
  modelUsed?: string;
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

export interface TransportMode {
  id: string;
  name: string;
  category: 'private_vehicle' | 'public_transit' | 'active_transit' | 'shared_ride';
  emissionFactorGCo2PerPassKm?: number;
  emissionFactorGCo2ePerPassKm: number;
  emissionMetric?: 'CO2' | 'CO2e';
  vehicleKmFactorGCo2?: number;
  factorUnit?: string;
  assumedOccupancy?: number;
  sourceDocument?: string;
  publicationYear?: number;
  organization?: string;
  source: string;
  calculationNotes?: string;
  suitabilityRule: string;
}

export interface Co2eCalculationResult {
  baselineCo2eGramsPerTrip: number;
  alternativeCo2eGramsPerTrip: number;
  avoidedCo2eGramsPerTrip: number;
  avoidedCo2eKgPerWeek: number;
  avoidedCo2eKgPerYear: number;
  percentageReduction: number;
  baselineModeName: string;
  alternativeModeName: string;
  formula: string;
  emissionMetric?: string;
  assumptions: string[];
  sources: string[];
}

export interface IllustrativeMaskScenario {
  nominalFiltrationEfficiency: number;
  illustrativeFilteredProxy: number;
  illustrativeCombinedReductionPercentage: number;
  assumptions: string[];
  fitLimitations: string;
  clinicalDisclaimer: string;
}

export interface ExposureProxyResult {
  baselineAmbientProxy?: number;
  optimizedAmbientProxy?: number;
  avoidedAmbientProxy?: number;
  ambientReductionPercentage?: number;

  baselineIndex: number;
  optimizedIndex: number;
  avoidedIndex: number;
  reductionPercentage: number;
  formula: string;
  unit: string;
  disclaimer: string;
  illustrativeMaskScenario?: IllustrativeMaskScenario;
}

export interface CommunityPledge {
  id: string;
  title: string;
  description: string;
  category: 'transit' | 'awareness' | 'household' | 'reporting';
  co2SavingsEstimateKgPerWeek?: number;
  participantsCount: number;
  badge: string;
}
