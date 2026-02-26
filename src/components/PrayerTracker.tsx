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
    // Try to get saved location first
    const savedLocation = localStorage.getItem('prayer_location');
    if (savedLocation) {
      const loc = JSON.parse(savedLocation);
      setCoords(new Coordinates(loc.lat, loc.lon));
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords(new Coordinates(position.coords.latitude, position.coords.longitude));
        },
        () => {
          // Fallback to Dhaka
          setCoords(new Coordinates(23.8103, 90.4125));
        }
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
  
  // Get prayer name in Bengali
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

  // Calculate progress
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

  // Sehri and Iftar
  const sehriTime = prayerTimes.fajr;
  const iftarTime = prayerTimes.maghrib;

  // Sun Arc Calculation (Simplified)
  // Sunrise to Sunset is the arc
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
      className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 overflow-hidden relative"
    >
      {/* Sun Arc Visualization */}
      <div className="relative h-32 flex items-end justify-center px-4">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/mosque.png')] bg-center bg-no-repeat bg-contain" />
        </div>
        
        {/* The Arc */}
        <svg className="absolute bottom-0 w-full h-24 overflow-visible" viewBox="0 0 100 40">
          <path 
            d="M 0 40 Q 50 -10 100 40" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            strokeDasharray="2 2"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Sun on Arc */}
          {sunPosition > 0 && sunPosition < 100 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ 
                offsetPath: "path('M 0 40 Q 50 -10 100 40')",
                offsetDistance: `${sunPosition}%`
              }}
              className="absolute"
            >
              <circle r="3" fill="#fbbf24" />
              <circle r="5" fill="#fbbf24" opacity="0.2" />
            </motion.g>
          )}
        </svg>

        {/* Key Times on Arc */}
        <div className="absolute bottom-0 left-0 flex flex-col items-center -translate-x-1/2">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-1 rounded-lg border border-emerald-100 dark:border-emerald-800 mb-1">
            <Sunrise size={12} className="text-emerald-500" />
          </div>
          <span className="text-[10px] font-bold text-slate-400">{toBanglaNumber(format(sunrise, 'h:mm'))}</span>
        </div>

        <div className="absolute bottom-0 right-0 flex flex-col items-center translate-x-1/2">
          <div className="bg-orange-50 dark:bg-orange-900/30 p-1 rounded-lg border border-orange-100 dark:border-orange-800 mb-1">
            <Sunset size={12} className="text-orange-500" />
          </div>
          <span className="text-[10px] font-bold text-slate-400">{toBanglaNumber(format(sunset, 'h:mm'))}</span>
        </div>

        {/* Noon Indicator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full border border-amber-100 dark:border-amber-800 flex items-center gap-1 shadow-sm">
            <Sun size={12} className="text-amber-500" />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{toBanglaNumber(format(prayerTimes.dhuhr, 'h:mm'))}</span>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 mt-1" />
        </div>

        {/* Sahri & Iftar Labels */}
        <div className="absolute top-10 left-0 text-center w-1/2 pr-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">সাহরি শেষ {toBanglaNumber(format(sehriTime, 'h:mm'))} মি.</p>
        </div>
        <div className="absolute top-10 right-0 text-center w-1/2 pl-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">ইফতার {toBanglaNumber(format(iftarTime, 'h:mm'))} মি.</p>
        </div>
      </div>

      {/* Current Prayer Info */}
      <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-700">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{currentPrayerName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">চলমান</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-600 dark:text-slate-300">
              {toBanglaNumber(format(currentPrayerTime || new Date(), 'hh:mm'))} - {toBanglaNumber(format(nextPrayerTime || new Date(), 'hh:mm'))}
            </p>
            <p className="text-xs font-bold text-slate-400 mt-1">{timeRemainingStr}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
