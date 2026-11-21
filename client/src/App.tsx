import React, { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import { ApiService } from './services/api';
import { AqiReading, FamilyProfileConsent } from './types';
import { Header } from './components/common/Header';
import { DataSourceBadge } from './components/common/DataSourceBadge';
import { ConsentModal } from './components/common/ConsentModal';
import { AqiGauge } from './components/Dashboard/AqiGauge';
import { WeatherCard } from './components/Dashboard/WeatherCard';
import { PollutantGrid } from './components/Dashboard/PollutantGrid';
import { HourlyChart } from './components/Dashboard/HourlyChart';
import { DailyForecastCard } from './components/Dashboard/DailyForecastCard';
import { RoutinePlanner } from './components/SmartRoutine/RoutinePlanner';
import { IndoorGuide } from './components/IndoorAir/IndoorGuide';
import { TransportAdvisor } from './components/SustainableChoice/TransportAdvisor';
import { ImpactSimulator } from './components/ImpactSimulator/ImpactSimulator';
import { GeminiChat } from './components/GeminiAssistant/GeminiChat';
import { CommunityBoard } from './components/Community/CommunityBoard';
import { 
  Wind, 
  Clock, 
  Home, 
  Compass, 
  Calculator, 
  Sparkles, 
  Users, 
  ShieldAlert, 
  ExternalLink, 
  AlertCircle 
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const { t } = useLanguage();

  const [currentCity, setCurrentCity] = useState<string>('Delhi');
  const [reading, setReading] = useState<AqiReading | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'routine' | 'indoor' | 'sustainable' | 'simulator' | 'ai' | 'community'
  >('dashboard');

  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [consent, setConsent] = useState<FamilyProfileConsent>(() => {
    const saved = localStorage.getItem('vayuwise_consent');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      consentGranted: false,
      hasInfantOrChild: false,
      hasElderly: false,
      hasAsthmaOrRespiratory: false,
      commuteMode: 'public'
    };
  });

  const handleUpdateConsent = (updated: FamilyProfileConsent) => {
    setConsent(updated);
    localStorage.setItem('vayuwise_consent', JSON.stringify(updated));
  };

  const fetchAqi = async (city: string, lat?: number, lon?: number, source?: 'model' | 'benchmark') => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getAqiReading(lat, lon, city, source);
      setReading(data);
      setCurrentCity(data.city);
    } catch (err) {
      console.error(err);
      setError('Unable to load air quality data. Please check your network or try another city.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAqi('Delhi');
  }, []);

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Wind },
    { id: 'routine', label: t.nav.routine, icon: Clock },
    { id: 'indoor', label: t.nav.indoor, icon: Home },
    { id: 'sustainable', label: t.nav.sustainable, icon: Compass },
    { id: 'simulator', label: t.nav.simulator, icon: Calculator },
    { id: 'ai', label: t.nav.ai, icon: Sparkles },
    { id: 'community', label: t.nav.community, icon: Users }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Header */}
      <Header
        currentCity={currentCity}
        onSelectCity={(city, lat, lon, isBenchmark) => fetchAqi(city, lat, lon, isBenchmark ? 'benchmark' : 'model')}
        onOpenConsentModal={() => setConsentModalOpen(true)}
        consentGranted={consent.consentGranted}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                data-tab={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading / Error States */}
        {loading && !reading && (
          <div className="py-24 text-center space-y-4">
            <Wind className="w-10 h-10 text-brand-500 animate-spin mx-auto" />
            <div className="text-base font-bold text-slate-700 dark:text-slate-300">
              Retrieving Atmospheric & Station Data for {currentCity}...
            </div>
            <div className="text-xs text-slate-400">
              Querying Copernicus CAMS regional dispersion ensemble
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchAqi(currentCity)}
              className="px-3 py-1 rounded-lg bg-rose-200 dark:bg-rose-800 text-rose-950 dark:text-white text-xs font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Content */}
        {reading && (
          <div className="space-y-6">
            
            {/* Active Data Source Lineage Ribbon */}
            <div className="glass-panel px-4 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <DataSourceBadge
                  sourceType={reading.dataSource}
                  sourceName={reading.sourceName}
                  isOfficial={reading.isOfficialObservation}
                  meetsCpcbCriteria={reading.meetsCpcbCriteria}
                />
                <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {reading.methodology}
                </span>
              </div>

              <div className="text-[11px] font-medium text-slate-400">
                Lat: {reading.coordinates.latitude.toFixed(2)}°, Lon: {reading.coordinates.longitude.toFixed(2)}°
              </div>
            </div>

            {/* TAB 1: Air Quality Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <AqiGauge
                  aqi={reading.aqi}
                  officialCpcbAqi={reading.officialCpcbAqi}
                  category={reading.category}
                  dominantPollutant={reading.dominantPollutant}
                  sourceName={reading.sourceName}
                  timestamp={reading.timestamp}
                  meetsCpcbCriteria={reading.meetsCpcbCriteria}
                  cpcbStatusMessage={reading.cpcbStatusMessage}
                />

                <WeatherCard 
                  weather={reading.weather} 
                  lowestPm25Window={reading.lowestPm25Window}
                  cleanestWindowToday={reading.cleanestWindowToday}
                />

                <PollutantGrid pollutants={reading.pollutants} />

                <HourlyChart hourlyData={reading.hourlyForecast} />

                <DailyForecastCard dailyData={reading.dailyForecast} />
              </div>
            )}

            {/* TAB 2: Smart Daily Routine */}
            {activeTab === 'routine' && (
              <div className="animate-in fade-in duration-200">
                <RoutinePlanner
                  currentAqi={reading.aqi}
                  dispersionPotential={reading.weather.dispersionPotential}
                  city={reading.city}
                  cleanestWindow={reading.lowestPm25Window?.timeWindow || reading.cleanestWindowToday?.timeWindow}
                />
              </div>
            )}

            {/* TAB 3: Indoor Clean-Air Guide */}
            {activeTab === 'indoor' && (
              <div className="animate-in fade-in duration-200">
                <IndoorGuide />
              </div>
            )}

            {/* TAB 4: Sustainable Choice Advisor */}
            {activeTab === 'sustainable' && (
              <div className="animate-in fade-in duration-200">
                <TransportAdvisor currentAqi={reading.aqi} />
              </div>
            )}

            {/* TAB 5: What-If Impact Simulator */}
            {activeTab === 'simulator' && (
              <div className="animate-in fade-in duration-200">
                <ImpactSimulator
                  currentAqi={reading.aqi}
                  currentPm25={reading.pollutants.pm2_5?.value ?? 120}
                />
              </div>
            )}

            {/* TAB 6: Gemini AI Assistant */}
            {activeTab === 'ai' && (
              <div className="animate-in fade-in duration-200">
                <GeminiChat
                  aqiData={reading}
                  consent={consent}
                  onOpenConsentModal={() => setConsentModalOpen(true)}
                />
              </div>
            )}

            {/* TAB 7: Community Action Board */}
            {activeTab === 'community' && (
              <div className="animate-in fade-in duration-200">
                <CommunityBoard />
              </div>
            )}

          </div>
        )}

      </main>

      {/* Global Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white">
                <Wind className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                VAYUWISE AI — Your Family's Intelligent Clean-Air Companion
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <a 
                href="https://open-meteo.com/en/docs/air-quality-api" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-brand-600 flex items-center gap-1"
              >
                <span>Open-Meteo & CAMS</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://cpcb.nic.in" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-brand-600 flex items-center gap-1"
              >
                <span>CPCB India NAQI</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://docs.openaq.org" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-brand-600 flex items-center gap-1"
              >
                <span>OpenAQ</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://www.who.int/news-room/questions-and-answers/item/air-pollution-personal-interventions-and-risk-communication" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-brand-600 flex items-center gap-1"
              >
                <span>WHO Air Guidance</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>{t.disclaimerLabel}:</strong> {t.disclaimerText} Model predictions are provided by Open-Meteo and Copernicus CAMS. Continuous regulatory sensor data is sourced under CPCB/State PCB oversight. All emission calculations use peer-reviewed factors from CPCB, ARAI, and DEFRA.
            </div>
          </div>
        </div>
      </footer>

      {/* Profile Consent Modal */}
      <ConsentModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
        consent={consent}
        onUpdateConsent={handleUpdateConsent}
      />

    </div>
  );
};
