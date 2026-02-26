import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  Moon, Sun, Calendar, Bell, TrendingUp, 
  Download, Upload, Type, Volume2, 
  ChevronRight, Globe, Shield, Info, LayoutGrid
} from 'lucide-react';

export default function SettingsScreen() {
  const { 
    theme, setTheme, 
    hijriAdjustment, setHijriAdjustment,
    firstDayOfWeek, setFirstDayOfWeek,
    remindersEnabled, setRemindersEnabled,
    productivityEnabled, setProductivityEnabled,
    exportData, importData
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        importData(content);
      };
      reader.readAsText(file);
    }
  };

  const SettingItem = ({ 
    icon: Icon, 
    label, 
    description, 
    children,
    color = "text-slate-400"
  }: any) => (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center ${color}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{label}</h4>
        {description && <p className="text-[10px] text-slate-400 font-medium">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ enabled, onToggle }: { enabled: boolean, onToggle: () => void }) => (
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-all relative ${enabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="space-y-8 pb-32">
      <header className="px-2">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-400 font-medium">Customize your experience</p>
      </header>

      {/* Appearance */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Appearance</h3>
        <SettingItem 
          icon={theme === 'dark' ? Moon : Sun} 
          label="Dark Mode" 
          description="Switch between light and dark themes"
          color="text-amber-500"
        >
          <Toggle enabled={theme === 'dark'} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        </SettingItem>
        
        <SettingItem 
          icon={Type} 
          label="Fonts & Language" 
          description="Bengali & Arabic support"
          color="text-indigo-500"
        >
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold">BN</button>
            <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold">AR</button>
          </div>
        </SettingItem>
      </section>

      {/* Calendar Settings */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Calendar</h3>
        <SettingItem 
          icon={Calendar} 
          label="First Day of Week" 
          description="Select your preferred start day"
          color="text-emerald-500"
        >
          <select 
            value={firstDayOfWeek} 
            onChange={(e) => setFirstDayOfWeek(parseInt(e.target.value))}
            className="bg-slate-50 dark:bg-slate-900 border-none text-xs font-bold rounded-xl p-2 focus:ring-0"
          >
            <option value={0}>Sunday</option>
            <option value={1}>Monday</option>
          </select>
        </SettingItem>

        <SettingItem 
          icon={Moon} 
          label="Hijri Adjustment" 
          description="Manual moon sighting correction"
          color="text-amber-600"
        >
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setHijriAdjustment(hijriAdjustment - 1)}
              className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold"
            >-</button>
            <span className="text-sm font-bold w-4 text-center">{hijriAdjustment}</span>
            <button 
              onClick={() => setHijriAdjustment(hijriAdjustment + 1)}
              className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold"
            >+</button>
          </div>
        </SettingItem>
      </section>

      {/* Intelligence Systems */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Intelligence</h3>
        
        <SettingItem 
          icon={LayoutGrid} 
          label="Widget Mode" 
          description="Open home screen widget view"
          color="text-emerald-500"
        >
          <button 
            onClick={() => window.open('/widget', '_blank')}
            className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-xl shadow-lg shadow-emerald-600/20"
          >
            OPEN
          </button>
        </SettingItem>

        <SettingItem 
          icon={Bell} 
          label="Islamic Reminder Engine" 
          description="Auto-reminders for sacred days"
          color="text-blue-500"
        >
          <Toggle enabled={remindersEnabled} onToggle={() => setRemindersEnabled(!remindersEnabled)} />
        </SettingItem>

        <SettingItem 
          icon={TrendingUp} 
          label="Productivity Intelligence" 
          description="Smart goals & habit analytics"
          color="text-rose-500"
        >
          <Toggle enabled={productivityEnabled} onToggle={() => setProductivityEnabled(!productivityEnabled)} />
        </SettingItem>

        <SettingItem 
          icon={Volume2} 
          label="Notification Sound" 
          description="Default: Adhan Soft"
          color="text-slate-500"
        >
          <ChevronRight size={20} className="text-slate-300" />
        </SettingItem>
      </section>

      {/* Data Management */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Data & Privacy</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={exportData}
            className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <Download className="text-emerald-500" />
            <span className="text-xs font-bold">Export Backup</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <Upload className="text-blue-500" />
            <span className="text-xs font-bold">Restore Backup</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".json"
            />
          </button>
        </div>
      </section>

      {/* About */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">About</h3>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">M</div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">Al-Mawaqit</h4>
              <p className="text-[10px] text-slate-400">Version 1.0.0 (Production Ready)</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            A comprehensive Islamic, Bangla, and Gregorian calendar system designed for productivity and spiritual growth.
          </p>
          <div className="flex gap-4 pt-2">
            <button className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Privacy Policy</button>
            <button className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Terms of Service</button>
          </div>
        </div>
      </section>
    </div>
  );
}
