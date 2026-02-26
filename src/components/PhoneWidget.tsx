import React, { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { 
  Sunrise, Sunset, RefreshCw, 
  Book, Clock, BookOpen, Hand, 
  User, LayoutGrid
} from 'lucide-react';
import { getHijriDate, getBanglaDate, toBanglaNumber } from '../utils/dateUtils';
import { useApp } from '../context/AppContext';

export default function PhoneWidget() {
  const { hijriAdjustment } = useApp();
  const [coords, setCoords] = useState<Coordinates>(new Coordinates(23.8103, 90.4125));
  const [locationName, setLocationName] = useState("ঢাকা, বাংলাদেশ");
  const [prayerTimes, setPrayerTimes] = useState<AdhanPrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date();

  const refreshLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords(new Coordinates(latitude, longitude));
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const name = data.address.city || data.address.town || "ঢাকা, বাংলাদেশ";
            setLocationName(`${name}, বাংলাদেশ`);
          } catch (e) {}
          setLoading(false);
        },
        () => setLoading(false)
      );
    }
  };

  useEffect(() => {
    const params = CalculationMethod.Karachi();
    const times = new AdhanPrayerTimes(coords, today, params);
    setPrayerTimes(times);
  }, [coords]);

  const hijri = getHijriDate(today, hijriAdjustment);
  const bangla = getBanglaDate(today);
  const englishDate = format(today, 'd MMMM, yyyy');
  
  // Convert English month names to Bangla
  const bnMonths: any = {
    'January': 'জানুয়ারি', 'February': 'ফেব্রুয়ারি', 'March': 'মার্চ', 'April': 'এপ্রিল',
    'May': 'মে', 'June': 'জুন', 'July': 'জুলাই', 'August': 'আগস্ট',
    'September': 'সেপ্টেম্বর', 'October': 'অক্টোবর', 'November': 'নভেম্বর', 'December': 'ডিসেম্বর'
  };
  const formattedEnglishDate = toBanglaNumber(format(today, 'd')) + ' ' + (bnMonths[format(today, 'MMMM')] || format(today, 'MMMM')) + ', ' + toBanglaNumber(format(today, 'yyyy'));

  if (!prayerTimes) return null;

  const IconWrapper = ({ children, color }: { children: React.ReactNode, color: string }) => (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm ${color}`}>
      {children}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-md mx-auto space-y-8">
      <div className="flex justify-between items-start">
        {/* Left Side: Dates */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-[#2D3E33] dark:text-white">
            {toBanglaNumber(hijri.day)} {hijri.monthName} {toBanglaNumber(hijri.year)} হি.
          </h2>
          <div className="space-y-1">
            <p className="text-base font-bold text-[#5F6368] dark:text-slate-400">
              {format(today, 'EEEE')}, {toBanglaNumber(bangla.day)} {bangla.monthName} {toBanglaNumber(bangla.year)}
            </p>
            <p className="text-base font-bold text-[#5F6368] dark:text-slate-500">
              {formattedEnglishDate}
            </p>
          </div>
        </div>

        {/* Right Side: Sun & Location */}
        <div className="text-right space-y-4">
          <div className="flex items-center justify-end gap-3">
            <div className="w-12 h-12 bg-[#E8F5F2] rounded-2xl flex items-center justify-center">
              <Sunrise size={24} className="text-[#00C853]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#2D3E33] dark:text-white">সূর্যোদয় {toBanglaNumber(format(prayerTimes.sunrise, 'hh:mm'))}</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <div className="w-12 h-12 bg-[#FFF3E0] rounded-2xl flex items-center justify-center">
              <Sunset size={24} className="text-[#FF9100]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#2D3E33] dark:text-white">সূর্যাস্ত {toBanglaNumber(format(prayerTimes.sunset, 'hh:mm'))}</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-1 text-slate-400">
            <span className="text-xs font-bold">{locationName}</span>
            <button onClick={refreshLocation} className={loading ? "animate-spin" : ""}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Middle: Sahri & Iftar */}
      <div className="flex justify-between items-center px-2">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-[#2D3E33] dark:text-white">সাহরি শেষ {toBanglaNumber(format(prayerTimes.fajr, 'hh:mm'))}</h3>
        </div>
        <div className="text-center">
          <h3 className="text-3xl font-bold text-[#2D3E33] dark:text-white">ইফতার {toBanglaNumber(format(prayerTimes.maghrib, 'hh:mm'))}</h3>
        </div>
      </div>

      {/* Bottom: Shortcuts */}
      <div className="flex justify-between items-center px-2">
        <IconWrapper color="bg-[#E8F5E9] text-[#2E7D32]">
          <Book size={22} className="fill-[#2E7D32]/10" />
        </IconWrapper>
        <IconWrapper color="bg-[#E3F2FD] text-[#1565C0]">
          <Clock size={22} className="fill-[#1565C0]/10" />
        </IconWrapper>
        <IconWrapper color="bg-[#F1F8E9] text-[#558B2F]">
          <BookOpen size={22} className="fill-[#558B2F]/10" />
        </IconWrapper>
        <IconWrapper color="bg-[#FFF8E1] text-[#FF8F00]">
          <Hand size={22} className="fill-[#FF8F00]/10" />
        </IconWrapper>
        <IconWrapper color="bg-[#E0F2F1] text-[#00695C]">
          <LayoutGrid size={22} className="fill-[#00695C]/10" />
        </IconWrapper>
        <IconWrapper color="bg-[#F5F5F5] text-[#424242]">
          <User size={22} className="fill-[#424242]/10" />
        </IconWrapper>
      </div>
    </div>
  );
}
