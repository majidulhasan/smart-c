import React, { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, SunnahTimes } from 'adhan';
import { format, differenceInMinutes, isAfter, isBefore, addDays } from 'date-fns';
import { motion } from 'motion/react';
import { Sun, Moon, Sunrise, Sunset, Clock } from 'lucide-react';
import { toBanglaNumber } from '../utils/dateUtils';

export default function PrayerTracker() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<AdhanPrayerTimes | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLocation = localStorage.getItem('prayer_location');
    if (savedLocation) {
      const loc = JSON.parse(savedLocation);
      setCoords(new Coordinates(loc.lat, loc.lon));
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords(new Coordinates(position.coords.latitude, position.coords.longitude));
        },
        () => setCoords(new Coordinates(23.8103, 90.4125))
      );
    } else {
      setCoords(new Coordinates(23.8103, 90.4125));
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (coords) {
      const savedMethod = localStorage.getItem('prayer_method') || 'Karachi';
      const methods: any = {
        "Karachi": CalculationMethod.Karachi(),
        "MWL": CalculationMethod.MuslimWorldLeague(),
        "ISNA": CalculationMethod.NorthAmerica(),
        "Egypt": CalculationMethod.Egyptian(),
        "UmmAlQura": CalculationMethod.UmmAlQura(),
        "Dubai": CalculationMethod.Dubai(),
        "Qatar": CalculationMethod.Qatar(),
        "Kuwait": CalculationMethod.Kuwait(),
        "Turkey": CalculationMethod.Turkey(),
      };
      const params = methods[savedMethod] || CalculationMethod.Karachi();
      const times = new AdhanPrayerTimes(coords, currentTime, params);
      setPrayerTimes(times);
      setLoading(false);
    }
  }, [coords, currentTime]);

  if (loading || !prayerTimes) return null;

  const currentPrayer = prayerTimes.currentPrayer();
  const nextPrayer = prayerTimes.nextPrayer();
  
  const prayerNames: any = {
    fajr: 'ফজর',
    sunrise: 'সূর্যোদয়',
    dhuhr: 'জোহর',
    asr: 'আসর',
    maghrib: 'মাগরিব',
    isha: 'এশা',
    none: 'ইশা পরবর্তী'
  };

  const currentPrayerName = prayerNames[currentPrayer] || 'অপেক্ষা করুন';
  const currentPrayerTime = prayerTimes.timeForPrayer(currentPrayer);
  const nextPrayerTime = prayerTimes.timeForPrayer(nextPrayer);

  let progress = 0;
  let timeRemainingStr = "";
  
  if (currentPrayerTime && nextPrayerTime) {
    const totalDuration = differenceInMinutes(nextPrayerTime, currentPrayerTime);
    const elapsed = differenceInMinutes(currentTime, currentPrayerTime);
    progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    
    const remainingMinutes = differenceInMinutes(nextPrayerTime, currentTime);
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    
    if (hours > 0) {
      timeRemainingStr = `${toBanglaNumber(hours)} ঘণ্টা ${toBanglaNumber(mins)} মিনিট বাকি`;
    } else {
      timeRemainingStr = `${toBanglaNumber(mins)} মিনিট বাকি`;
    }
  }

  const sunrise = prayerTimes.sunrise;
  const sunset = prayerTimes.sunset;
  let sunPosition = 0;
  if (isAfter(currentTime, sunrise) && isBefore(currentTime, sunset)) {
    const dayDuration = differenceInMinutes(sunset, sunrise);
    const elapsed = differenceInMinutes(currentTime, sunrise);
    sunPosition = (elapsed / dayDuration) * 100;
  } else if (isAfter(currentTime, sunset)) {
    sunPosition = 100;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-8 overflow-hidden relative"
    >
      {/* Sun Arc Section */}
      <div className="relative h-40 flex items-end justify-center">
        {/* Mosque Background Silhouette */}
        <div className="absolute inset-0 flex items-end justify-center opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 800 300" className="w-full h-full">
            <path d="M0,300 L0,250 Q50,250 100,200 L100,150 Q150,100 200,150 L200,200 Q250,250 300,250 L300,100 Q400,0 500,100 L500,250 Q550,250 600,200 L600,150 Q650,100 700,150 L700,200 Q750,250 800,250 L800,300 Z" fill="currentColor" />
          </svg>
        </div>

        {/* The Arc */}
        <svg className="absolute bottom-12 w-full h-32 overflow-visible" viewBox="0 0 100 40">
          <path 
            d="M 0 40 Q 50 -10 100 40" 
            fill="none" 
            stroke="#E2E8F0" 
            strokeWidth="0.5" 
            strokeDasharray="2 2"
          />
          {/* Sun on Arc */}
          <motion.g
            style={{ 
              offsetPath: "path('M 0 40 Q 50 -10 100 40')",
              offsetDistance: `${sunPosition}%`
            }}
          >
            <circle r="6" fill="#FBBF24" />
            <g className="animate-pulse">
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                <rect key={deg} x="-1" y="-10" width="2" height="4" fill="#FBBF24" transform={`rotate(${deg})`} rx="1" />
              ))}
            </g>
          </motion.g>
        </svg>

        {/* Sunrise/Sunset Markers */}
        <div className="absolute bottom-12 left-0 -translate-x-1/2 flex items-center bg-[#E8F5F2] dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800">
          <div className="bg-amber-400 p-1 rounded-lg mr-2">
            <Sunrise size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-[#2D3E33] dark:text-emerald-400">{toBanglaNumber(format(sunrise, 'h:mm'))}</span>
        </div>

        <div className="absolute bottom-12 right-0 translate-x-1/2 flex items-center bg-[#FDF2F2] dark:bg-orange-900/20 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-orange-800">
          <span className="text-sm font-bold text-[#2D3E33] dark:text-orange-400 mr-2">{toBanglaNumber(format(sunset, 'h:mm'))}</span>
          <div className="bg-amber-400 p-1 rounded-lg">
            <Sunset size={14} className="text-white" />
          </div>
        </div>

        {/* Noon Marker */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="bg-[#F1F3F4] dark:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center gap-2 shadow-sm">
            <Sun size={14} className="text-amber-500" />
            <span className="text-sm font-bold text-[#2D3E33] dark:text-white">{toBanglaNumber(format(prayerTimes.dhuhr, 'h:mm'))}</span>
          </div>
          <div className="w-px h-16 bg-slate-300 dark:bg-slate-600 mt-1" />
        </div>

        {/* Sahri/Iftar Labels */}
        <div className="absolute top-12 left-0 w-1/2 text-center pr-8">
          <p className="text-lg font-bold text-[#2D3E33] dark:text-white">সাহরি শেষ {toBanglaNumber(format(prayerTimes.fajr, 'h:mm'))} মি.</p>
        </div>
        <div className="absolute top-12 right-0 w-1/2 text-center pl-8">
          <p className="text-lg font-bold text-[#2D3E33] dark:text-white">ইফতার {toBanglaNumber(format(prayerTimes.maghrib, 'h:mm'))} মি.</p>
        </div>
      </div>

      {/* Current Prayer Section */}
      <div className="space-y-6 pt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-3xl font-bold text-[#2D3E33] dark:text-white">{currentPrayerName}</h3>
          <p className="text-2xl font-bold text-[#2D3E33] dark:text-slate-300">
            {toBanglaNumber(format(currentPrayerTime || new Date(), 'hh:mm'))} - {toBanglaNumber(format(nextPrayerTime || new Date(), 'hh:mm'))}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-[#F1F3F4] dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-[#00C853] rounded-full"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#00C853]" />
            <span className="text-lg font-bold text-[#2D3E33] dark:text-emerald-400">চলমান</span>
          </div>
          <p className="text-2xl font-bold text-[#2D3E33] dark:text-white">{timeRemainingStr}</p>
        </div>
      </div>
    </motion.div>
  );
}

