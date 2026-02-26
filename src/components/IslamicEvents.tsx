import React from 'react';
import { ISLAMIC_EVENTS, getHijriDate } from '../utils/dateUtils';
import { motion } from 'motion/react';
import { Moon, Star, Calendar, Bell, Info } from 'lucide-react';
import { format, addYears } from 'date-fns';

export default function IslamicEvents() {
  const currentYear = new Date().getFullYear();
  
  // Logic to find Gregorian dates for Hijri events is complex,
  // for this demo we'll show them as special cards with descriptions.
  
  return (
    <div className="space-y-8 pb-24">
      <header className="px-2">
        <h1 className="text-3xl font-bold text-slate-800">Islamic Intelligence</h1>
        <p className="text-slate-400 font-medium">Auto-detected sacred days & reminders</p>
      </header>

      {/* Ramadan Special Mode Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-400/20 p-2 rounded-xl">
              <Star className="text-amber-400" fill="currentColor" size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Ramadan Mode</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Ramadan is approaching</h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Auto-theme and Sehri/Iftar reminders will activate automatically on 1st Ramadan.
          </p>
          <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors">
            Configure Reminders
          </button>
        </div>
        <Moon className="absolute -right-10 -top-10 text-white/5 w-64 h-64" />
      </motion.div>

      {/* Event List */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-lg px-2">Upcoming Sacred Days</h3>
        {ISLAMIC_EVENTS.map((event, idx) => (
          <motion.div
            key={event.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:border-emerald-200 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Moon size={28} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">{event.name}</h4>
              <p className="text-xs text-slate-400 font-medium">
                {event.day} {getHijriMonthName(event.month)}
              </p>
            </div>
            <button className="p-3 text-slate-300 hover:text-emerald-500 transition-colors">
              <Bell size={20} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Sunnah Fasting Section */}
      <section className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
            <Info size={24} />
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 mb-1">Sunnah Fasting Reminder</h4>
            <p className="text-sm text-emerald-700/80 leading-relaxed mb-4">
              Would you like to be reminded for Monday and Thursday Sunnah fasts?
            </p>
            <div className="flex gap-2">
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Enable</button>
              <button className="bg-white text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold">Maybe Later</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getHijriMonthName(m: number) {
  const months = [
    "Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani",
    "Jumada al-ula", "Jumada al-akhira", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
  ];
  return months[m - 1];
}
