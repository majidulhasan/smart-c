import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, LayoutDashboard, CheckCircle2, Moon, Clock } from 'lucide-react';
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
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-4 py-2 flex justify-around items-center z-50 pb-safe">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
              isActive ? "text-emerald-600 scale-110" : "text-slate-400 hover:text-slate-600"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
