import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../i18n/translations';
import { ApiService } from '../../services/api';
import { CityLocation } from '../../types';
import { 
  Wind, 
  Search, 
  MapPin, 
  Languages, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  ChevronDown 
} from 'lucide-react';

interface HeaderProps {
  currentCity: string;
  onSelectCity: (city: string, lat?: number, lon?: number, preferStation?: boolean) => void;
  onOpenConsentModal: () => void;
  consentGranted: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onSelectCity,
  onOpenConsentModal,
  consentGranted
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Search Debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await ApiService.searchCities(searchQuery);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSelectCity('Current GPS Location', pos.coords.latitude, pos.coords.longitude, false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        alert('Could not obtain location. Please search for your city above.');
      }
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Wind className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  {t.brandName}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-300 dark:border-brand-700">
                  v1.0 Pro
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Search Bar with Autocomplete */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-24 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-inner"
              />
              <button
                onClick={handleGeolocation}
                title={t.useMyLocation}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.useMyLocation}</span>
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                  Matching Locations
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {searchResults.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectCity(loc.name, loc.latitude, loc.longitude, loc.hasOfficialStation);
                        setShowDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between transition-colors border-b last:border-0 border-slate-50 dark:border-slate-750"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {loc.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {loc.state ? `${loc.state}, ` : ''}{loc.country}
                          </div>
                        </div>
                      </div>
                      {loc.hasOfficialStation && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Official CAAQMS
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Select Stations */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Hotspots:</span>
            {['Delhi', 'Mumbai', 'Pune', 'Bengaluru', 'Kolkata'].map((city) => (
              <button
                key={city}
                onClick={() => onSelectCity(city, undefined, undefined, false)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currentCity.toLowerCase() === city.toLowerCase()
                    ? 'bg-brand-500 text-white font-semibold shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Right Action Icons: Language, Consent, Theme */}
          <div className="flex items-center gap-2">
            
            {/* Gemini Profile Consent Status Pill */}
            <button
              data-testid="privacy-shield-btn"
              onClick={onOpenConsentModal}
              title="AI Personalization Privacy Settings"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                consentGranted
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-brand-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span className="hidden sm:inline">
                {consentGranted ? 'AI Personalization ON' : 'AI Privacy Shield'}
              </span>
            </button>

            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Languages className="w-3.5 h-3.5 text-slate-500" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 hidden group-hover:block z-50">
                <button
                  data-lang="en"
                  onClick={() => setLanguage('en')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between ${
                    language === 'en' ? 'text-brand-600 font-bold' : ''
                  }`}
                >
                  <span>English</span>
                  {language === 'en' && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
                <button
                  data-lang="hi"
                  onClick={() => setLanguage('hi')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between ${
                    language === 'hi' ? 'text-brand-600 font-bold' : ''
                  }`}
                >
                  <span>हिंदी (Hindi)</span>
                  {language === 'hi' && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
                <button
                  data-lang="mr"
                  onClick={() => setLanguage('mr')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between ${
                    language === 'mr' ? 'text-brand-600 font-bold' : ''
                  }`}
                >
                  <span>मराठी (Marathi)</span>
                  {language === 'mr' && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Dark/Light Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Dark/Light Mode"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
