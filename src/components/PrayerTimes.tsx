import React, { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, SunnahTimes } from 'adhan';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MapPin, Sun, Moon, Sunrise, Sunset, Bell, BellOff, Info, Search, Settings2, X } from 'lucide-react';
import { toBanglaNumber } from '../utils/dateUtils';

interface ReminderSetting {
  enabled: boolean;
  offset: number; // minutes
}

export default function PrayerTimes() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<AdhanPrayerTimes | null>(null);
  const [sunnahTimes, setSunnahTimes] = useState<SunnahTimes | null>(null);
  const [locationName, setLocationName] = useState<string>("Dhaka, Bangladesh");
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [calcMethod, setCalcMethod] = useState("Karachi");

  // Reminder settings state
  const [reminders, setReminders] = useState<Record<string, ReminderSetting>>({
    fajr: { enabled: true, offset: 0 },
    dhuhr: { enabled: true, offset: 0 },
    asr: { enabled: true, offset: 0 },
    maghrib: { enabled: true, offset: 0 },
    isha: { enabled: true, offset: 0 },
  });

  const [showSettings, setShowSettings] = useState<string | null>(null);

  const methods = {
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

  useEffect(() => {
    const savedReminders = localStorage.getItem('prayer_reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
    const savedMethod = localStorage.getItem('prayer_method');
    if (savedMethod) {
      setCalcMethod(savedMethod);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords(new Coordinates(latitude, longitude));
          setLocationName("Current Location");
        },
        (error) => {
          console.error("Geolocation error:", error);
          setCoords(new Coordinates(23.8103, 90.4125));
          setLoading(false);
        }
      );
    } else {
      setCoords(new Coordinates(23.8103, 90.4125));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (coords) {
      const date = new Date();
      const params = methods[calcMethod as keyof typeof methods] || CalculationMethod.Karachi();
      const times = new AdhanPrayerTimes(coords, date, params);
      const sunnah = new SunnahTimes(times);
      
      setPrayerTimes(times);
      setSunnahTimes(sunnah);
      setNextPrayer(times.nextPrayer());
      setLoading(false);
    }
  }, [coords, calcMethod]);

  const handleMethodChange = (method: string) => {
    setCalcMethod(method);
    localStorage.setItem('prayer_method', method);
    setShowMethodSelector(false);
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCity) return;
    
    setLoading(true);
    try {
      // Simple geocoding simulation or use a free API
      // For this demo, we'll use a few hardcoded cities or just simulate success
      const cities: Record<string, [number, number]> = {
        'dhaka': [23.8103, 90.4125],
        'chittagong': [22.3569, 91.7832],
        'sylhet': [24.8949, 91.8687],
        'khulna': [22.8456, 89.5403],
        'london': [51.5074, -0.1278],
        'new york': [40.7128, -74.0060],
        'mecca': [21.4225, 39.8262],
      };

      const cityLower = manualCity.toLowerCase();
      if (cities[cityLower]) {
        setCoords(new Coordinates(cities[cityLower][0], cities[cityLower][1]));
        setLocationName(manualCity);
      } else {
        // Fallback to Dhaka if not found in our small list
        alert("City not found in demo list. Defaulting to Dhaka.");
        setCoords(new Coordinates(23.8103, 90.4125));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowManualInput(false);
      setLoading(false);
    }
  };

  const toggleReminder = (prayer: string) => {
    const newReminders = {
      ...reminders,
      [prayer]: { ...reminders[prayer], enabled: !reminders[prayer].enabled }
    };
    setReminders(newReminders);
    localStorage.setItem('prayer_reminders', JSON.stringify(newReminders));
  };

  const updateOffset = (prayer: string, offset: number) => {
    const newReminders = {
      ...reminders,
      [prayer]: { ...reminders[prayer], offset }
    };
    setReminders(newReminders);
    localStorage.setItem('prayer_reminders', JSON.stringify(newReminders));
  };

  const formatTime = (date: Date) => {
    return toBanglaNumber(format(date, 'h:mm a'));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Clock size={48} className="text-emerald-500" />
        </motion.div>
        <p className="text-slate-400 font-medium animate-pulse">নামাজের সময় গণনা করা হচ্ছে...</p>
      </div>
    );
  }

  if (!prayerTimes) return null;

  const prayers = [
    { id: 'fajr', name: 'Fajr', time: prayerTimes.fajr, icon: <Sunrise className="text-blue-400" /> },
    { id: 'sunrise', name: 'Sunrise', time: prayerTimes.sunrise, icon: <Sun className="text-amber-400" />, noReminder: true },
    { id: 'dhuhr', name: 'Dhuhr', time: prayerTimes.dhuhr, icon: <Sun className="text-amber-500" /> },
    { id: 'asr', name: 'Asr', time: prayerTimes.asr, icon: <Sun className="text-orange-400" /> },
    { id: 'maghrib', name: 'Maghrib', time: prayerTimes.maghrib, icon: <Sunset className="text-orange-600" /> },
    { id: 'isha', name: 'Isha', time: prayerTimes.isha, icon: <Moon className="text-indigo-400" /> },
  ];

  return (
    <div className="space-y-6 pb-24">
      <header className="px-2 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">নামাজের সময়</h1>
          <button 
            onClick={() => setShowManualInput(true)}
            className="flex items-center gap-1 text-emerald-600 font-medium mt-1 hover:underline"
          >
            <MapPin size={14} />
            <span className="text-sm">{locationName}</span>
          </button>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={() => setShowMethodSelector(true)}
            className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
          >
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{calcMethod}</span>
          </button>
          <p className="text-xs font-bold text-slate-400">{toBanglaNumber(format(new Date(), 'h:mm a'))}</p>
        </div>
      </header>

      {/* Method Selector Modal */}
      <AnimatePresence>
        {showMethodSelector && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">হিসাব পদ্ধতি</h3>
                <button onClick={() => setShowMethodSelector(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Object.keys(methods).map(m => (
                  <button
                    key={m}
                    onClick={() => handleMethodChange(m)}
                    className={cn(
                      "w-full text-left px-6 py-4 rounded-2xl font-bold transition-all",
                      calcMethod === m ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Location Input Modal */}
      <AnimatePresence>
        {showManualInput && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">অবস্থান পরিবর্তন</h3>
                <button onClick={() => setShowManualInput(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleManualSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="শহরের নাম লিখুন (যেমন: Dhaka)" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                  খুঁজুন
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setCoords(new Coordinates(pos.coords.latitude, pos.coords.longitude));
                      setLocationName("Current Location");
                      setShowManualInput(false);
                    });
                  }}
                  className="w-full text-emerald-600 font-bold py-2 text-sm"
                >
                  বর্তমান অবস্থান ব্যবহার করুন
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Prayer Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-emerald-600 p-10 text-white shadow-2xl"
      >
        <div className="relative z-10">
          <p className="text-emerald-100 font-medium uppercase text-xs tracking-widest mb-3 opacity-80">পরবর্তী নামাজ</p>
          <h2 className="text-5xl font-bold mb-2 capitalize">{nextPrayer || 'None'}</h2>
          <p className="text-emerald-50 text-2xl font-medium opacity-90">
            {nextPrayer && formatTime(prayerTimes.timeForPrayer(nextPrayer)!)}
          </p>
        </div>
        <Clock className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10" />
      </motion.div>

      {/* Prayer Times List */}
      <div className="space-y-4">
        {prayers.map((prayer, idx) => {
          const isNext = nextPrayer === prayer.id;
          const reminder = reminders[prayer.id];
          
          return (
            <div key={prayer.id} className="relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "bg-white p-6 rounded-[2rem] shadow-sm border transition-all flex items-center gap-5",
                  isNext ? "border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/10" : "border-slate-100"
                )}
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  {prayer.icon}
                </div>
                <div className="flex-1">
                  <h4 className={cn("font-bold text-lg text-slate-800", isNext && "text-emerald-600")}>{prayer.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">দৈনিক নামাজ</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={cn("text-xl font-bold text-slate-800", isNext && "text-emerald-600")}>
                      {formatTime(prayer.time)}
                    </p>
                  </div>
                  {!prayer.noReminder && (
                    <div className="flex flex-col items-center gap-2">
                      <button 
                        onClick={() => toggleReminder(prayer.id)}
                        className={cn(
                          "p-2 rounded-full transition-all",
                          reminder?.enabled ? "text-emerald-500 bg-emerald-50" : "text-slate-300 bg-slate-50"
                        )}
                      >
                        {reminder?.enabled ? <Bell size={20} /> : <BellOff size={20} />}
                      </button>
                      <button 
                        onClick={() => setShowSettings(showSettings === prayer.id ? null : prayer.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <Settings2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Reminder Settings Dropdown */}
              <AnimatePresence>
                {showSettings === prayer.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-slate-50 border-x border-b border-slate-100 rounded-b-[2rem] -mt-6 pt-8 pb-4 px-6"
                  >
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">রিমাইন্ডার সময়</p>
                    <div className="flex gap-2">
                      {[-10, -5, 0, 5, 10].map(offset => (
                        <button
                          key={offset}
                          onClick={() => updateOffset(prayer.id, offset)}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                            reminder?.offset === offset ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                          )}
                        >
                          {offset === 0 ? 'সময়মতো' : `${toBanglaNumber(Math.abs(offset))} মি. ${offset < 0 ? 'আগে' : 'পরে'}`}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Sunnah Times */}
      <section className="space-y-4">
        <h3 className="font-bold text-slate-800 text-xl px-2">সুন্নাহ সময়</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'রাতের শেষ তৃতীয়াংশ', time: sunnahTimes?.lastThirdOfTheNight, icon: <Moon className="text-indigo-400" /> },
            { name: 'মধ্যরাত', time: sunnahTimes?.middleOfTheNight, icon: <Moon className="text-slate-500" /> },
          ].map((s, idx) => s.time && (
            <motion.div 
              key={s.name} 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + idx * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                {s.icon}
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider leading-tight">{s.name}</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{formatTime(s.time)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Calculation Info */}
      <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex gap-4">
        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 h-fit">
          <Info size={24} />
        </div>
        <div>
          <h4 className="font-bold text-emerald-900 mb-1">হিসাব পদ্ধতি</h4>
          <p className="text-xs text-emerald-700/80 leading-relaxed">
            সময়গুলো করাচি ইসলামি বিজ্ঞান বিশ্ববিদ্যালয় পদ্ধতিতে হিসাব করা হয়েছে, যা বাংলাদেশে প্রচলিত। আপনার অবস্থানের উপর ভিত্তি করে সময় সামান্য পরিবর্তিত হতে পারে।
          </p>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
