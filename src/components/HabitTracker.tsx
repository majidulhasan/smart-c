import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format, startOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Trophy, Flame, Calendar, BookOpen, Sun, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HabitTracker() {
  const { habits, habitLogs, toggleHabit } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(new Date());
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  const getHabitStatus = (habitId: number, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habitLogs.find(l => l.habit_id === habitId && l.date === dateStr)?.status === 1;
  };

  const handleToggle = async (habitId: number, date: Date) => {
    const isCompleting = !getHabitStatus(habitId, date);
    await toggleHabit(habitId, format(date, 'yyyy-MM-dd'));
    
    if (isCompleting) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }
  };

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case '5 times salah': return <Moon className="text-indigo-500" />;
      case 'quran reading': return <BookOpen className="text-emerald-500" />;
      case 'morning adhkar': return <Sun className="text-amber-500" />;
      case 'fasting': return <Moon className="text-blue-500" />;
      default: return <CheckCircle2 className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Habit Tracker</h1>
          <p className="text-slate-400 font-medium">Build consistency, earn rewards</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-2xl flex items-center gap-2 border border-amber-100">
          <Flame className="text-amber-500" fill="currentColor" size={20} />
          <span className="font-bold text-amber-700">7 Day Streak</span>
        </div>
      </header>

      {/* Week View */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            return (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-2xl transition-all",
                  isSelected ? "bg-emerald-600 text-white shadow-lg scale-105" : "hover:bg-slate-50",
                  isToday && !isSelected && "ring-2 ring-emerald-500 ring-offset-2"
                )}
              >
                <span className={cn("text-[10px] font-bold uppercase mb-1", isSelected ? "text-emerald-100" : "text-slate-400")}>
                  {format(day, 'EEE')}
                </span>
                <span className="text-lg font-bold">{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {habits.map((habit, idx) => {
          const isDone = getHabitStatus(habit.id, selectedDate);
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "bg-white p-5 rounded-3xl shadow-sm border transition-all flex items-center gap-4",
                isDone ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                {getIcon(habit.name)}
              </div>
              <div className="flex-1">
                <h3 className={cn("font-bold text-slate-800", isDone && "text-emerald-800")}>{habit.name}</h3>
                <p className="text-xs text-slate-400 font-medium">{habit.category}</p>
              </div>
              <button
                onClick={() => handleToggle(habit.id, selectedDate)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isDone ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                )}
              >
                {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Section */}
      <section className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-amber-300" />
            Weekly Achievement
          </h3>
          <div className="flex items-end gap-4">
            <div className="text-4xl font-bold">85%</div>
            <p className="text-indigo-100 text-sm mb-1">Consistency this week</p>
          </div>
          <div className="mt-6 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-[85%] rounded-full" />
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      </section>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
