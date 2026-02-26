import React from 'react';
import { useApp } from '../context/AppContext';
import { format, isAfter } from 'date-fns';
import { getHijriDate, getBanglaDate, toBanglaNumber } from '../utils/dateUtils';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Plus, TrendingUp, Calendar as CalendarIcon, Moon, Clock } from 'lucide-react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';

import PrayerTracker from './PrayerTracker';
import QuickActions from './QuickActions';
import PhoneWidget from './PhoneWidget';

export default function Dashboard() {
  const { tasks, toggleTask, events, habits, habitLogs, hijriAdjustment } = useApp();
  const today = new Date();

  const todayStr = format(today, 'yyyy-MM-dd');
  
  const hijri = getHijriDate(today, hijriAdjustment);
  const bangla = getBanglaDate(today);

  const todayTasks = tasks.filter(t => t.due_date === todayStr || !t.due_date);
  const completedTasks = todayTasks.filter(t => t.is_completed).length;
  const progress = todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 0;

  return (
    <div className="space-y-8 pb-24">
      {/* Phone Style Widget Header */}
      <PhoneWidget />

      {/* Prayer Tracker Card */}
      <PrayerTracker />

      {/* Quick Shortcuts Widget */}
      <QuickActions />

      {/* Productivity Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Daily Progress
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium">
            {completedTasks} of {todayTasks.length} tasks completed
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-blue-500" />
            Quick Tasks
          </h3>
          <div className="space-y-3">
            {todayTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-3 group">
                <button 
                  onClick={() => toggleTask(task.id, !task.is_completed)}
                  className="text-slate-300 hover:text-emerald-500 transition-colors"
                >
                  {task.is_completed ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} />}
                </button>
                <span className={cn(
                  "text-sm font-medium transition-all",
                  task.is_completed ? "text-slate-300 line-through" : "text-slate-600"
                )}>
                  {task.title}
                </span>
              </div>
            ))}
            {todayTasks.length === 0 && (
              <p className="text-sm text-slate-400 italic">No tasks for today</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Events */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-bold text-slate-800 text-lg">Upcoming Events</h3>
          <button className="text-emerald-600 text-sm font-bold flex items-center gap-1">
            View All <Plus size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {events.length > 0 ? events.slice(0, 3).map(event => (
            <div key={event.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(event.start_date), 'MMM')}</span>
                <span className="text-lg font-bold text-slate-800 leading-none">{format(new Date(event.start_date), 'd')}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{event.title}</h4>
                <p className="text-xs text-slate-400">{event.category}</p>
              </div>
              <div className={cn("w-2 h-2 rounded-full", event.color || 'bg-emerald-500')} />
            </div>
          )) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
              <CalendarIcon className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-sm text-slate-400">No upcoming events planned</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
