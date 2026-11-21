import React from 'react';
import { HourlyForecastPoint } from '../../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { Clock, ShieldAlert, Sun } from 'lucide-react';

interface Props {
  hourlyData: HourlyForecastPoint[];
}

export const HourlyChart: React.FC<Props> = ({ hourlyData }) => {
  if (!hourlyData || hourlyData.length === 0) return null;

  // Transform data for chart
  const formattedData = hourlyData.slice(0, 24).map((pt) => {
    const d = new Date(pt.time);
    const timeLabel = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    return {
      time: timeLabel,
      hour: pt.hour,
      aqi: pt.aqi,
      pm2_5: pt.pm2_5,
      pm10: pt.pm10,
      category: pt.category,
      recommendation: pt.recommendation
    };
  });

  return (
    <div className="glass-card p-5 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Diurnal 24-Hour Smog & AQI Cycle</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Shows diurnal surface inversion spikes (morning/night) vs cleanest solar dispersion window (afternoon)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
            <Sun className="w-3.5 h-3.5" />
            <span>Cleanest Window: 1:00 PM – 4:00 PM</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />

            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
            />

            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              domain={[0, 'dataMax + 40']} 
            />

            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1 max-w-xs">
                      <div className="font-bold flex items-center justify-between border-b border-slate-700 pb-1">
                        <span>{data.time}</span>
                        <span className="text-brand-400">{data.category}</span>
                      </div>
                      <div className="text-amber-400 font-semibold">
                        AQI: {data.aqi}
                      </div>
                      <div className="text-slate-300">
                        PM2.5: {data.pm2_5} µg/m³
                      </div>
                      <div className="text-[11px] text-slate-400 pt-1 italic">
                        {data.recommendation}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* CPCB Safe Standard Line at 60 ug/m3 */}
            <ReferenceLine y={100} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'Moderate Threshold', fill: '#eab308', fontSize: 10 }} />
            <ReferenceLine y={200} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Poor Threshold', fill: '#f97316', fontSize: 10 }} />

            <Area 
              type="monotone" 
              dataKey="aqi" 
              name="AQI" 
              stroke="#f97316" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#aqiGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
