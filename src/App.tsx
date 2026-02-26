import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import MultiCalendar from './components/MultiCalendar';
import HabitTracker from './components/HabitTracker';
import IslamicEvents from './components/IslamicEvents';
import PrayerTimes from './components/PrayerTimes';
import SettingsScreen from './components/SettingsScreen';
import { motion, AnimatePresence } from 'motion/react';

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="max-w-md mx-auto px-4 pt-8 min-h-screen bg-slate-50/50 dark:bg-slate-900/50"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/calendar" element={<PageWrapper><div className="space-y-8 pb-24"><h1 className="text-3xl font-bold px-2 dark:text-white">Calendar</h1><MultiCalendar /></div></PageWrapper>} />
              <Route path="/habits" element={<PageWrapper><HabitTracker /></PageWrapper>} />
              <Route path="/islamic" element={<PageWrapper><IslamicEvents /></PageWrapper>} />
              <Route path="/prayer" element={<PageWrapper><PrayerTimes /></PageWrapper>} />
              <Route path="/settings" element={<PageWrapper><SettingsScreen /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
          <BottomNav />
        </div>
      </Router>
    </AppProvider>
  );
}
