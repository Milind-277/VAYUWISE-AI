import axios from 'axios';
import { 
  AqiReading, 
  CityLocation, 
  HourlyForecastPoint, 
  DailyForecastPoint, 
  PollutantBreakdown,
  WeatherContext,
  LowestPm25WindowForecast,
  CleanestWindowForecast 
} from '../types/aqi.js';
import { 
  calculateOfficialCpcbAqi, 
  calculateModelEstimatedIndex, 
  getCategoryFromAqi 
} from '../utils/cpcbCalculator.js';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export class OpenMeteoService {
  private static GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  private static AIR_QUALITY_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  private static WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Search cities by name using Open-Meteo Geocoding API
   */
  public static async searchCities(query: string): Promise<CityLocation[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const response = await axios.get<{ results?: GeocodingResult[] }>(this.GEOCODING_BASE_URL, {
        params: {
          name: query.trim(),
          count: 8,
          language: 'en',
          format: 'json'
        },
        timeout: 6000
      });

      if (!response.data.results || response.data.results.length === 0) {
        return [];
      }

      return response.data.results.map(item => ({
        name: item.name,
        state: item.admin1,
        country: item.country,
        latitude: item.latitude,
        longitude: item.longitude,
        hasOfficialStation: false
      }));
    } catch (error) {
      console.warn('Open-Meteo geocoding search failed, using fallback list:', error instanceof Error ? error.message : String(error));
      const fallbackList = [
        { name: 'Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, hasOfficialStation: false },
        { name: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, hasOfficialStation: false },
        { name: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, hasOfficialStation: false },
        { name: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567, hasOfficialStation: false },
        { name: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, hasOfficialStation: false },
        { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462, hasOfficialStation: false }
      ];
      return fallbackList.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
    }
  }

  /**
   * Fetch Air Quality and Diurnal Atmospheric Dispersion Data from Open-Meteo & Copernicus CAMS
   */
  public static async getAirQuality(lat: number, lon: number, cityName: string = 'Current Location', stateName?: string): Promise<AqiReading> {
    try {
      const aqiPromise = axios.get(this.AIR_QUALITY_BASE_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi',
          timezone: 'auto',
          forecast_days: 7
        },
        timeout: 8000
      });

      const weatherPromise = axios.get(this.WEATHER_BASE_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m',
          hourly: 'boundary_layer_height',
          timezone: 'auto',
          forecast_days: 2
        },
        timeout: 8000
      }).catch(() => null);

      const [aqiRes, weatherRes] = await Promise.all([aqiPromise, weatherPromise]);
      const hourlyData = aqiRes.data.hourly;

      if (!hourlyData || !hourlyData.time || hourlyData.time.length === 0) {
        throw new Error('Incomplete data returned from Open-Meteo Air Quality API');
      }

      const now = new Date();
      let currentIndex = 0;
      for (let i = 0; i < hourlyData.time.length; i++) {
        const itemTime = new Date(hourlyData.time[i]);
        if (itemTime <= now) {
          currentIndex = i;
        } else {
          break;
        }
      }

      const currentPm25 = hourlyData.pm2_5 ? Number(hourlyData.pm2_5[currentIndex] ?? 0) : 0;
      const currentPm10 = hourlyData.pm10 ? Number(hourlyData.pm10[currentIndex] ?? 0) : 0;
      const currentNo2 = hourlyData.nitrogen_dioxide ? Number(hourlyData.nitrogen_dioxide[currentIndex] ?? 0) : 0;
      const currentSo2 = hourlyData.sulphur_dioxide ? Number(hourlyData.sulphur_dioxide[currentIndex] ?? 0) : 0;
      const currentO3 = hourlyData.ozone ? Number(hourlyData.ozone[currentIndex] ?? 0) : 0;
      const rawCoUg = hourlyData.carbon_monoxide ? Number(hourlyData.carbon_monoxide[currentIndex] ?? 0) : 0;
      const currentCoMg = Number((rawCoUg / 1000).toFixed(2));

      const pollutants: PollutantBreakdown = {
        pm2_5: {
          value: Number(currentPm25.toFixed(1)),
          unit: 'µg/m³',
          averagingHours: 24,
          hoursMonitored: 1, // instantaneous model hourly snapshot
          isObserved: false
        },
        pm10: {
          value: Number(currentPm10.toFixed(1)),
          unit: 'µg/m³',
          averagingHours: 24,
          hoursMonitored: 1,
          isObserved: false
        },
        no2: {
          value: Number(currentNo2.toFixed(1)),
          unit: 'µg/m³',
          averagingHours: 24,
          hoursMonitored: 1,
          isObserved: false
        },
        so2: {
          value: Number(currentSo2.toFixed(1)),
          unit: 'µg/m³',
          averagingHours: 24,
          hoursMonitored: 1,
          isObserved: false
        },
        o3: {
          value: Number(currentO3.toFixed(1)),
          unit: 'µg/m³',
          averagingHours: 8,
          hoursMonitored: 1,
          isObserved: false
        },
        co: {
          value: currentCoMg,
          unit: 'mg/m³',
          averagingHours: 8,
          hoursMonitored: 1,
          isObserved: false
        }
      };

      // Strict CPCB criteria evaluation:
      // Single hourly model point fails regulatory 24-hr/16-hr requirement
      const cpcbValidation = calculateOfficialCpcbAqi(pollutants, {
        isRegulatoryObservedStation: false,
        defaultHoursMonitored: 1
      });

      // Calculate model-estimated equivalent index
      const modelResult = calculateModelEstimatedIndex(pollutants);

      if (pollutants.pm2_5) pollutants.pm2_5.subIndex = modelResult.subIndices['pm2_5'];
      if (pollutants.pm10) pollutants.pm10.subIndex = modelResult.subIndices['pm10'];
      if (pollutants.no2) pollutants.no2.subIndex = modelResult.subIndices['no2'];
      if (pollutants.so2) pollutants.so2.subIndex = modelResult.subIndices['so2'];
      if (pollutants.o3) pollutants.o3.subIndex = modelResult.subIndices['o3'];
      if (pollutants.co) pollutants.co.subIndex = modelResult.subIndices['co'];

      // Hourly Forecast (24 hours) & Search for Today's Cleanest Window dynamically
      const hourlyForecast: HourlyForecastPoint[] = [];
      const maxHours = Math.min(24, hourlyData.time.length - currentIndex);

      let minDaytimePm25 = Infinity;
      let cleanestWindowStartHour = 13;
      let cleanestWindowEndHour = 15;

      for (let offset = 0; offset < maxHours; offset++) {
        const idx = currentIndex + offset;
        const timeStr = hourlyData.time[idx];
        const dateObj = new Date(timeStr);
        const hour = dateObj.getHours();

        const p25 = hourlyData.pm2_5 ? Number(hourlyData.pm2_5[idx] ?? 0) : 0;
        const p10 = hourlyData.pm10 ? Number(hourlyData.pm10[idx] ?? 0) : 0;
        const no2 = hourlyData.nitrogen_dioxide ? Number(hourlyData.nitrogen_dioxide[idx] ?? 0) : 0;
        const o3 = hourlyData.ozone ? Number(hourlyData.ozone[idx] ?? 0) : 0;
        const coUg = hourlyData.carbon_monoxide ? Number(hourlyData.carbon_monoxide[idx] ?? 0) : 0;
        const so2 = hourlyData.sulphur_dioxide ? Number(hourlyData.sulphur_dioxide[idx] ?? 0) : 0;

        const subRes = calculateModelEstimatedIndex({
          pm2_5: { value: p25, unit: 'µg/m³', averagingHours: 24, isObserved: false },
          pm10: { value: p10, unit: 'µg/m³', averagingHours: 24, isObserved: false }
        });

        // Track minimum daytime PM2.5 (between 10 AM and 5 PM)
        if (hour >= 10 && hour <= 17 && p25 < minDaytimePm25) {
          minDaytimePm25 = p25;
          cleanestWindowStartHour = hour;
          cleanestWindowEndHour = Math.min(23, hour + 2);
        }

        let recommendation = 'Moderate atmospheric dispersion active.';
        if (hour >= 5 && hour <= 9) {
          recommendation = 'Early morning: reduced vertical mixing traps surface traffic exhaust. Minimize outdoor cardio.';
        } else if (hour >= 12 && hour <= 16) {
          recommendation = 'Solar heating enhances boundary layer mixing height. Optimal window for necessary outdoor errands.';
        } else if (hour >= 18 && hour <= 22) {
          recommendation = 'Evening rush-hour traffic emissions + cooling surface layer. Keep windows closed.';
        }

        hourlyForecast.push({
          time: timeStr,
          hour,
          aqi: subRes.modelIndex,
          category: subRes.category,
          pm2_5: Number(p25.toFixed(1)),
          pm10: Number(p10.toFixed(1)),
          no2: Number(no2.toFixed(1)),
          o3: Number(o3.toFixed(1)),
          co: Number((coUg / 1000).toFixed(2)),
          so2: Number(so2.toFixed(1)),
          recommendation
        });
      }

      // Format dynamic Lowest PM2.5 Window (Concentration & Time Window only; no short-duration CPCB AQI calculated)
      const formatHour = (h: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${displayH}:00 ${period}`;
      };

      const predictedPm25Val = Number((minDaytimePm25 === Infinity ? 65 : minDaytimePm25).toFixed(1));
      const lowestPm25Window: LowestPm25WindowForecast = {
        timeWindow: `${formatHour(cleanestWindowStartHour)} – ${formatHour(cleanestWindowEndHour)}`,
        predictedPm25: predictedPm25Val,
        rationale: `Dynamically calculated from today's 24-hr CAMS model forecast: surface PM2.5 particulate density reaches its lowest daytime level between ${formatHour(cleanestWindowStartHour)} and ${formatHour(cleanestWindowEndHour)} due to diurnal solar convective boundary layer mixing.`,
        limitations: 'Model-derived forecast of PM2.5 concentration only. Ground conditions may fluctuate based on local traffic and localized emissions. Gaseous pollutants (NO2, O3) are not evaluated in this short-duration particulate window.'
      };

      // Daily Forecast (7 days aggregation)
      const dailyForecast: DailyForecastPoint[] = [];
      const totalDays = 7;
      const hoursPerDay = 24;

      for (let day = 0; day < totalDays; day++) {
        const startIdx = day * hoursPerDay;
        const endIdx = Math.min(startIdx + hoursPerDay, hourlyData.time.length);
        if (startIdx >= hourlyData.time.length) break;

        const dayTimes = hourlyData.time.slice(startIdx, endIdx);
        const dayPm25 = (hourlyData.pm2_5 || []).slice(startIdx, endIdx);

        if (dayPm25.length === 0) continue;

        const dayAqis = dayPm25.map((p: number) => {
          const res = calculateModelEstimatedIndex({
            pm2_5: { value: p, unit: 'µg/m³', averagingHours: 24, isObserved: false }
          });
          return res.modelIndex;
        });

        const avgAqi = Math.round(dayAqis.reduce((a: number, b: number) => a + b, 0) / dayAqis.length);
        const maxAqi = Math.max(...dayAqis);
        const minAqi = Math.min(...dayAqis);

        const dDate = new Date(dayTimes[0]);
        const dayName = dDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dateFormatted = dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const cat = getCategoryFromAqi(avgAqi);

        let summary = 'Moderate atmospheric dispersion expected.';
        if (avgAqi > 300) {
          summary = 'Severe particulate density expected. Strict indoor filtration recommended.';
        } else if (avgAqi > 200) {
          summary = 'Poor air quality. Limit strenuous outdoor exertion.';
        } else if (avgAqi > 100) {
          summary = 'Moderate air quality. Sensitive individuals should wear N95 during rush hours.';
        }

        dailyForecast.push({
          date: dateFormatted,
          dayName,
          avgAqi,
          maxAqi,
          minAqi,
          category: cat,
          dominantPollutant: 'PM2.5',
          summary
        });
      }

      // Weather & Atmospheric Dispersion Potential
      const currentTemp = weatherRes?.data?.current?.temperature_2m ?? 24;
      const currentHumidity = weatherRes?.data?.current?.relative_humidity_2m ?? 60;
      const currentWind = weatherRes?.data?.current?.wind_speed_10m ?? 8;
      const currentWindDir = weatherRes?.data?.current?.wind_direction_10m ?? 180;

      let boundaryHeight = 500;
      if (weatherRes?.data?.hourly?.boundary_layer_height && weatherRes.data.hourly.boundary_layer_height[currentIndex]) {
        boundaryHeight = Math.round(weatherRes.data.hourly.boundary_layer_height[currentIndex]);
      }

      // Atmospheric Dispersion Potential Indicator
      let dispersionPotential: 'Favorable' | 'Moderate' | 'Poor' | 'Very Poor' = 'Moderate';
      if (boundaryHeight < 180 || (currentWind < 4 && currentTemp < 15)) {
        dispersionPotential = 'Very Poor';
      } else if (boundaryHeight < 350 || currentWind < 6) {
        dispersionPotential = 'Poor';
      } else if (boundaryHeight > 800 && currentWind > 10) {
        dispersionPotential = 'Favorable';
      }

      const weather: WeatherContext = {
        temperature: currentTemp,
        humidity: currentHumidity,
        windSpeed: currentWind,
        windDirection: currentWindDir,
        boundaryLayerHeight: boundaryHeight,
        dispersionPotential,
        dispersionQualifier: 'Atmospheric dispersion potential estimated from planetary boundary layer height and surface wind speed. Direct vertical temperature inversion soundings (dT/dz) not measured.'
      };

      const reading: AqiReading = {
        city: cityName,
        state: stateName,
        country: 'India',
        coordinates: {
          latitude: lat,
          longitude: lon
        },
        timestamp: new Date().toISOString(),
        aqi: modelResult.modelIndex,
        officialCpcbAqi: cpcbValidation.officialAqi, // null for instantaneous model forecast
        modelEstimatedIndex: modelResult.modelIndex,
        category: modelResult.category,
        dominantPollutant: modelResult.dominantPollutant,
        dataSource: 'MODEL_FORECAST',
        sourceName: 'Open-Meteo European/Copernicus Atmospheric Model (CAMS)',
        isOfficialObservation: false,
        meetsCpcbCriteria: cpcbValidation.isValid,
        cpcbStatusMessage: cpcbValidation.statusMessage,
        methodology: 'High-resolution Copernicus CAMS regional ensemble forecast. Mapped to Indian CPCB breakpoint sub-indices for comparative reference.',
        disclaimer: 'Data Source Attribution: Atmospheric model forecast from Open-Meteo and Copernicus CAMS. This is NOT an official CPCB continuous regulatory station observation.',
        pollutants,
        hourlyForecast,
        dailyForecast,
        weather,
        lowestPm25Window,
        cleanestWindowToday: lowestPm25Window
      };

      return reading;
    } catch (error) {
      console.error('Error fetching Open-Meteo air quality:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}
