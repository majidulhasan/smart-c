import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHijriDate, getBanglaDate, toBanglaNumber } from '../utils/dateUtils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useApp } from '../context/AppContext';

export default function MultiCalendar() {
  const { hijriAdjustment } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-emerald-600 p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-sans">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-widest opacity-80">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
      </div>

      <div className="p-2">
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const hijri = getHijriDate(day, hijriAdjustment);
            const bangla = getBanglaDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <motion.button
                key={day.toString()}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative h-20 p-1 rounded-2xl flex flex-col items-center justify-between transition-all border border-transparent",
                  !isCurrentMonth && "opacity-30",
                  isSelected ? "bg-emerald-50 border-emerald-200" : "hover:bg-slate-50",
                  isToday && "ring-2 ring-emerald-500 ring-offset-2"
                )}
              >
                {/* English Date */}
                <span className={cn(
                  "text-sm font-bold",
                  isSelected ? "text-emerald-700" : "text-slate-700"
                )}>
                  {format(day, 'd')}
                </span>

                {/* Hijri Date */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] font-mono text-amber-600 font-bold">
                    {hijri.day}
                  </span>
                  {/* Bangla Date */}
                  <span className="text-[9px] font-medium text-slate-400">
                    {toBanglaNumber(bangla.day)}
                  </span>
                </div>

                {/* Indicators */}
                <div className="flex gap-0.5">
                  {isToday && <div className="w-1 h-1 rounded-full bg-emerald-500" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate.toString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-6 bg-slate-50 border-t border-slate-100"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Selected Date</p>
              <h3 className="text-xl font-bold text-slate-800">{format(selectedDate, 'EEEE, do MMMM')}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-amber-600">{getHijriDate(selectedDate, hijriAdjustment).day} {getHijriDate(selectedDate, hijriAdjustment).monthName}</p>
              <p className="text-sm font-medium text-emerald-600">{toBanglaNumber(getBanglaDate(selectedDate).day)} {getBanglaDate(selectedDate).monthName}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
