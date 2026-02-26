import React, { createContext, useContext, useState, useEffect } from 'react';

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
  setHijriAdjustment: (val: number) => Promise<void>;
  refreshData: () => Promise<void>;
  addEvent: (event: Partial<Event>) => Promise<void>;
  toggleHabit: (habitId: number, date: string) => Promise<void>;
  toggleTask: (taskId: number, completed: boolean) => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hijriAdjustment, setHijriAdjustmentState] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [eventsRes, habitsRes, tasksRes, settingsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/habits'),
        fetch('/api/tasks'),
        fetch('/api/settings/hijri_adjustment')
      ]);
      
      const eventsData = await eventsRes.json();
      const { habits: habitsData, logs: logsData } = await habitsRes.json();
      const tasksData = await tasksRes.json();
      const adjustmentData = await settingsRes.json();

      setEvents(eventsData);
      setHabits(habitsData);
      setHabitLogs(logsData);
      setTasks(tasksData);
      setHijriAdjustmentState(parseInt(adjustmentData.value || '0'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setHijriAdjustment = async (val: number) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'hijri_adjustment', value: val.toString() })
    });
    setHijriAdjustmentState(val);
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
