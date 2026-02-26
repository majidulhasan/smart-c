import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  category: string;
  color: string;
}

interface Habit {
  id: number;
  name: string;
  icon: string;
  category: string;
}

interface HabitLog {
  habit_id: number;
  date: string;
  status: number;
}

interface Task {
  id: number;
  title: string;
  due_date: string;
  is_completed: boolean;
  priority: string;
}

interface AppContextType {
  events: Event[];
  habits: Habit[];
  habitLogs: HabitLog[];
  tasks: Task[];
  loading: boolean;
  hijriAdjustment: number;
  theme: 'light' | 'dark';
  firstDayOfWeek: number;
  remindersEnabled: boolean;
  productivityEnabled: boolean;
  setHijriAdjustment: (val: number) => Promise<void>;
  setTheme: (val: 'light' | 'dark') => Promise<void>;
  setFirstDayOfWeek: (val: number) => Promise<void>;
  setRemindersEnabled: (val: boolean) => Promise<void>;
  setProductivityEnabled: (val: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
  addEvent: (event: Partial<Event>) => Promise<void>;
  toggleHabit: (habitId: number, date: string) => Promise<void>;
  toggleTask: (taskId: number, completed: boolean) => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
  exportData: () => Promise<void>;
  importData: (json: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hijriAdjustment, setHijriAdjustmentState] = useState(0);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [firstDayOfWeek, setFirstDayOfWeekState] = useState(0);
  const [remindersEnabled, setRemindersEnabledState] = useState(true);
  const [productivityEnabled, setProductivityEnabledState] = useState(true);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [eventsRes, habitsRes, tasksRes, settingsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/habits'),
        fetch('/api/tasks'),
        fetch('/api/settings/all')
      ]);
      
      const eventsData = await eventsRes.json();
      const { habits: habitsData, logs: logsData } = await habitsRes.json();
      const tasksData = await tasksRes.json();
      const settingsData = await settingsRes.json();

      setEvents(eventsData);
      setHabits(habitsData);
      setHabitLogs(logsData);
      setTasks(tasksData);
      
      // Map settings
      const s = settingsData.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
      setHijriAdjustmentState(parseInt(s.hijri_adjustment || '0'));
      setThemeState((s.theme as 'light' | 'dark') || 'light');
      setFirstDayOfWeekState(parseInt(s.first_day_of_week || '0'));
      setRemindersEnabledState(s.reminders_enabled !== 'false');
      setProductivityEnabledState(s.productivity_enabled !== 'false');

      // Apply theme to document
      if (s.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
  };

  const setHijriAdjustment = async (val: number) => {
    await saveSetting('hijri_adjustment', val.toString());
    setHijriAdjustmentState(val);
  };

  const setTheme = async (val: 'light' | 'dark') => {
    await saveSetting('theme', val);
    setThemeState(val);
    if (val === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const setFirstDayOfWeek = async (val: number) => {
    await saveSetting('first_day_of_week', val.toString());
    setFirstDayOfWeekState(val);
  };

  const setRemindersEnabled = async (val: boolean) => {
    await saveSetting('reminders_enabled', val.toString());
    setRemindersEnabledState(val);
  };

  const setProductivityEnabled = async (val: boolean) => {
    await saveSetting('productivity_enabled', val.toString());
    setProductivityEnabledState(val);
  };

  const exportData = async () => {
    const data = {
      events,
      habitLogs,
      tasks,
      settings: {
        hijriAdjustment,
        theme,
        firstDayOfWeek,
        remindersEnabled,
        productivityEnabled
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `al-mawaqit-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  const importData = async (json: string) => {
    try {
      const data = JSON.parse(json);
      // This would ideally be a single batch API call, but for simplicity:
      if (data.settings) {
        await Promise.all([
          setHijriAdjustment(data.settings.hijriAdjustment),
          setTheme(data.settings.theme),
          setFirstDayOfWeek(data.settings.firstDayOfWeek),
          setRemindersEnabled(data.settings.remindersEnabled),
          setProductivityEnabled(data.settings.productivityEnabled)
        ]);
      }
      // Note: Full data import (events, tasks) would require backend support for bulk insert
      alert('Settings restored successfully! (Data import requires server sync)');
      await refreshData();
    } catch (e) {
      alert('Invalid backup file');
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addEvent = async (event: Partial<Event>) => {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    await refreshData();
  };

  const toggleHabit = async (habitId: number, date: string) => {
    const existing = habitLogs.find(l => l.habit_id === habitId && l.date === date);
    const newStatus = existing ? (existing.status === 1 ? 0 : 1) : 1;
    
    await fetch('/api/habit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habit_id: habitId, date, status: newStatus })
    });
    await refreshData();
  };

  const toggleTask = async (taskId: number, completed: boolean) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: completed })
    });
    await refreshData();
  };

  const addTask = async (task: Partial<Task>) => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    await refreshData();
  };

  return (
    <AppContext.Provider value={{ 
      events, habits, habitLogs, tasks, loading, 
      refreshData, addEvent, toggleHabit, toggleTask, addTask 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
