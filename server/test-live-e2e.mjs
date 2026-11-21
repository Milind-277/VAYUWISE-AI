import axios from 'axios';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = 5005; // Use dedicated test port

console.log('--- STARTING VAYUWISE BACKEND SERVER ON PORT ' + PORT + ' ---');

const serverProc = spawn('node', ['dist/index.js'], {
  cwd: __dirname,
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'inherit'
});

async function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function runTests() {
  await wait(2500); // Wait for server to start

  const baseUrl = `http://127.0.0.1:${PORT}`;
  let allPassed = true;

  try {
    console.log('\n[1/5] Testing Health Endpoint & AI Privacy Notice...');
    const health = await axios.get(`${baseUrl}/api/health`);
    console.log('Health Response:', health.data);
    if (health.data.status !== 'online' || !health.data.geminiConfigured) {
      throw new Error('Health check unexpected response');
    }
    const aiStatus = await axios.get(`${baseUrl}/api/ai/status`);
    console.log('AI Status & Privacy Notice:', {
      model: aiStatus.data.model,
      privacyNotice: aiStatus.data.privacyNotice
    });
    if (!aiStatus.data.privacyNotice.includes('No direct identifiers are transmitted')) {
      throw new Error('AI Privacy Notice does not contain required accurate wording');
    }
    console.log('✓ Health & AI Privacy Notice PASSED');

    console.log('\n[2/5] Testing OpenAQ Status Endpoint...');
    const openaq = await axios.get(`${baseUrl}/api/aqi/openaq-status`);
    console.log('OpenAQ Status:', openaq.data);
    if (openaq.data.integration.status !== 'partially_integrated') {
      throw new Error('OpenAQ status unexpected');
    }
    console.log('✓ OpenAQ Status Endpoint PASSED');

    console.log('\n[3/5] Testing Current AQI Endpoint (Delhi Open-Meteo & Dispersion)...');
    const aqi = await axios.get(`${baseUrl}/api/aqi/current?city=Delhi`);
    console.log('AQI Result:', {
      city: aqi.data.data.city,
      aqi: aqi.data.data.aqi,
      officialCpcbAqi: aqi.data.data.officialCpcbAqi,
      modelEstimatedIndex: aqi.data.data.modelEstimatedIndex,
      cpcbStatusMessage: aqi.data.data.cpcbStatusMessage,
      dataSource: aqi.data.data.dataSource,
      dispersionPotential: aqi.data.data.weather.dispersionPotential,
      lowestPm25Window: aqi.data.data.lowestPm25Window
    });
    if (aqi.data.data.officialCpcbAqi !== null) {
      throw new Error('Model forecast should have officialCpcbAqi: null');
    }
    console.log('✓ AQI Classification & Dispersion PASSED');

    console.log('\n[4/5] Testing Impact Simulator Endpoints...');
    const co2Res = await axios.post(`${baseUrl}/api/simulator/calculate-co2`, {
      distanceKm: 15,
      baselineMode: 'petrol_car',
      alternativeMode: 'city_bus',
      tripsPerWeek: 10
    });
    console.log('CO2 Calculation (Petrol Car vs City Bus):', {
      weeklySavedKg: co2Res.data.result.avoidedCo2eKgPerWeek,
      annualSavedKg: co2Res.data.result.avoidedCo2eKgPerYear,
      formula: co2Res.data.result.formula,
      metric: co2Res.data.result.emissionMetric
    });

    const motoRes = await axios.post(`${baseUrl}/api/simulator/calculate-co2`, {
      distanceKm: 10,
      baselineMode: 'petrol_two_wheeler',
      alternativeMode: 'city_bus',
      tripsPerWeek: 5
    });
    console.log('CO2 Calculation (Motorcycle <125cc vs City Bus):', {
      baselineGrams: motoRes.data.result.baselineCo2eGramsPerTrip,
      altGrams: motoRes.data.result.alternativeCo2eGramsPerTrip,
      baselineName: motoRes.data.result.baselineModeName
    });
    if (motoRes.data.result.baselineCo2eGramsPerTrip !== 319) {
      throw new Error(`Expected motorcycle 10km baseline to be 319g (31.9 g/km), got ${motoRes.data.result.baselineCo2eGramsPerTrip}`);
    }

    const expRes = await axios.post(`${baseUrl}/api/simulator/exposure-proxy`, {
      baselineConcentrationUgM3: 200,
      baselineDurationHours: 2,
      optimizedConcentrationUgM3: 60,
      optimizedDurationHours: 1,
      hasN95Mask: true
    });
    console.log('Exposure Proxy Calculation:', {
      primaryBaselineAmbientProxy: expRes.data.result.baselineAmbientProxy,
      primaryOptimizedAmbientProxy: expRes.data.result.optimizedAmbientProxy,
      primaryAmbientReductionPct: expRes.data.result.ambientReductionPercentage,
      separateIllustrativeMaskFilteredProxy: expRes.data.result.illustrativeMaskScenario?.illustrativeFilteredProxy,
      separateIllustrativeMaskCombinedReductionPct: expRes.data.result.illustrativeMaskScenario?.illustrativeCombinedReductionPercentage,
      disclaimer: expRes.data.result.disclaimer
    });
    console.log('✓ Impact Simulator Endpoints PASSED');

    console.log('\n[5/5] Testing Live Gemini Chat Assistant Endpoint...');
    const chat = await axios.post(`${baseUrl}/api/ai/chat`, {
      message: 'Can I open my windows in Delhi right now?',
      aqiContext: aqi.data.data,
      profileConsent: { consentGranted: true, hasInfantOrChild: true },
      language: 'en'
    });
    console.log('Chat Assistant Reply:', {
      replyPreview: chat.data.data.response.substring(0, 150) + '...',
      modelUsed: chat.data.data.modelUsed,
      isAiGenerated: chat.data.data.isAiGenerated
    });
    if (!chat.data.data.response || chat.data.data.response.length < 20) {
      throw new Error('Chat response too short or empty');
    }
    console.log('✓ Live Gemini Chat Assistant PASSED');

  } catch (err) {
    console.error('Smoke test failed:', err?.response?.data || err.message);
    allPassed = false;
  } finally {
    serverProc.kill('SIGINT');
    await wait(500);
    process.exit(allPassed ? 0 : 1);
  }
}

runTests();
