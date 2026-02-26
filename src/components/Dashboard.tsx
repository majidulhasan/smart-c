import React from 'react';
import { useApp } from '../context/AppContext';
import { format, isAfter } from 'date-fns';
import { getHijriDate, getBanglaDate, toBanglaNumber } from '../utils/dateUtils';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Plus, TrendingUp, Calendar as CalendarIcon, Moon, Clock } from 'lucide-react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';

export default function Dashboard() {
  const { tasks, toggleTask, events, habits, habitLogs, hijriAdjustment } = useApp();
  const [nextPrayerTime, setNextPrayerTime] = React.useState<{ name: string, time: Date } | null>(null);
  const today = new Date();

  React.useEffect(() => {
    // Default to Dhaka for dashboard quick view if no geo yet
    const coords = new Coordinates(23.8103, 90.4125);
    const params = CalculationMethod.Karachi();
    const times = new AdhanPrayerTimes(coords, today, params);
    const next = times.nextPrayer();
    if (next && next !== 'none') {
      setNextPrayerTime({ name: next, time: times.timeForPrayer(next)! });
    }
  }, []);
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const hijri = getHijriDate(today, hijriAdjustment);
  const bangla = getBanglaDate(today);

  const todayTasks = tasks.filter(t => t.due_date === todayStr || !t.due_date);
  const completedTasks = todayTasks.filter(t => t.is_completed).length;
  const progress = todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white shadow-2xl"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 font-medium tracking-wide mb-1 opacity-80 uppercase text-xs">Today's Overview</p>
              <h1 className="text-3xl font-bold mb-2">{format(today, 'EEEE, d MMM')}</h1>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
              <Moon className="text-amber-300" />
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex-1 border border-white/10">
              <p className="text-xs text-emerald-100 opacity-70 mb-1">Hijri Date</p>
              <p className="text-lg font-bold">{hijri.day} {hijri.monthName}</p>
            </div>
            {nextPrayerTime && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex-1 border border-white/10">
                <p className="text-xs text-emerald-100 opacity-70 mb-1">Next: {nextPrayerTime.name}</p>
                <p className="text-lg font-bold">{format(nextPrayerTime.time, 'h:mm a')}</p>
              </div>
            )}
            {!nextPrayerTime && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex-1 border border-white/10">
                <p className="text-xs text-emerald-100 opacity-70 mb-1">Bangla Date</p>
                <p className="text-lg font-bold">{toBanglaNumber(bangla.day)} {bangla.monthName}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl" />
      </motion.div>

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
