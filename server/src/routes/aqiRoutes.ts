import { Router, Request, Response } from 'express';
import { OpenMeteoService } from '../services/openMeteoService.js';
import { CpcbService, CPCB_BENCHMARK_STATIONS } from '../services/cpcbService.js';
import { OpenAqService } from '../services/openAqService.js';
import { AqiReading } from '../types/aqi.js';

const router = Router();

/**
 * GET /api/aqi/search?q=delhi
 */
router.get('/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  if (!query || query.trim().length < 2) {
    res.json({ success: true, results: [] });
    return;
  }

  try {
    const results = await OpenMeteoService.searchCities(query);
    const enriched = results.map(city => {
      const benchmark = CpcbService.findStationByCity(city.name);
      return {
        ...city,
        hasOfficialStation: Boolean(benchmark),
        stationName: benchmark?.stationName
      };
    });

    res.json({ success: true, results: enriched });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search cities', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * GET /api/aqi/current?lat=28.61&lon=77.20&city=Delhi&source=model|benchmark
 * Prioritizes live Open-Meteo CAMS forecast unless live CPCB key is provided or benchmark is requested
 */
router.get('/current', async (req: Request, res: Response) => {
  const latStr = req.query.lat as string;
  const lonStr = req.query.lon as string;
  const city = (req.query.city as string) || 'Delhi';
  const requestedSource = req.query.source as string; // 'model' | 'benchmark'

  let lat = latStr ? parseFloat(latStr) : 28.6139;
  let lon = lonStr ? parseFloat(lonStr) : 77.2090;

  if (isNaN(lat) || isNaN(lon)) {
    lat = 28.6139;
    lon = 77.2090;
  }

  try {
    let reading: AqiReading | null = null;

    // 1. If user explicitly requested historical benchmark snapshot:
    if (requestedSource === 'benchmark') {
      const benchmark = CpcbService.findStationByCity(city);
      if (benchmark) {
        reading = await CpcbService.getBenchmarkSnapshot(benchmark);
        res.json({ success: true, data: reading });
        return;
      }
    }

    // 2. Check for authenticated live CPCB data.gov.in integration:
    if (CpcbService.isLiveCpcbConfigured()) {
      const liveCpcb = await CpcbService.fetchLiveCpcbData(city);
      if (liveCpcb) {
        res.json({ success: true, data: liveCpcb });
        return;
      }
    }

    // 3. Primary live path: High-resolution Copernicus CAMS & Open-Meteo atmospheric model
    reading = await OpenMeteoService.getAirQuality(lat, lon, city);
    res.json({ success: true, data: reading });
  } catch (error) {
    console.error('Error in /api/aqi/current:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Unable to retrieve air quality data',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/aqi/stations
 * List all historical benchmark monitoring stations with DEMO labels
 */
router.get('/stations', (_req: Request, res: Response) => {
  res.json({
    success: true,
    liveCpcbConfigured: CpcbService.isLiveCpcbConfigured(),
    stations: CPCB_BENCHMARK_STATIONS.map(s => ({
      id: s.id,
      city: s.city,
      stationName: s.stationName,
      state: s.state,
      latitude: s.latitude,
      longitude: s.longitude,
      agency: s.agency,
      recordedSnapshotDate: s.recordedSnapshotDate,
      benchmarkPm2_5: s.benchmarkPm2_5,
      benchmarkPm10: s.benchmarkPm10,
      classification: 'DEMO / REFERENCE BENCHMARK'
    }))
  });
});

/**
 * GET /api/aqi/openaq-status
 * Report OpenAQ v3 integration status
 */
router.get('/openaq-status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    integration: OpenAqService.getIntegrationStatus()
  });
});

export default router;
