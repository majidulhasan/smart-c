import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, LayoutDashboard, CheckCircle2, Moon, Clock, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BottomNav() {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/prayer', icon: Clock, label: 'Prayer' },
    { to: '/habits', icon: CheckCircle2, label: 'Habits' },
    { to: '/islamic', icon: Moon, label: 'Islamic' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-around items-center z-50 pb-safe transition-colors">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
              isActive ? "text-emerald-600 dark:text-emerald-400 scale-110" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
