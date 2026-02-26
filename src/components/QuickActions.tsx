import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Calendar, Book, Compass, 
  Calculator, Heart, X, CheckCircle2,
  Clock, Hash
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

export default function QuickActions() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const { addTask } = useApp();

  const actions = [
    { id: 'add-task', label: 'নতুন কাজ', icon: Plus, color: 'bg-emerald-50 text-emerald-600', onClick: () => setShowAddTask(true) },
    { id: 'add-event', label: 'ইভেন্ট', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
    { id: 'quran', label: 'কুরআন', icon: Book, color: 'bg-amber-50 text-amber-600' },
    { id: 'qibla', label: 'কিবলা', icon: Compass, color: 'bg-rose-50 text-rose-600' },
    { id: 'zakat', label: 'যাকাত', icon: Calculator, color: 'bg-indigo-50 text-indigo-600' },
    { id: 'sadaqah', label: 'সাদাকাহ', icon: Heart, color: 'bg-pink-50 text-pink-600' },
  ];

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await addTask({
      title: taskTitle,
      due_date: format(new Date(), 'yyyy-MM-dd'),
      priority: 'medium'
    });
    setTaskTitle("");
    setShowAddTask(false);
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="font-bold text-slate-800 dark:text-white text-lg">শর্টকাট উইজেট</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Access</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, idx) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action.color}`}>
              <action.icon size={24} />
            </div>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">নতুন কাজ যোগ করুন</h3>
                <button onClick={() => setShowAddTask(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">কাজের শিরোনাম</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="যেমন: সূরা মুলক তিলাওয়াত" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                  সংরক্ষণ করুন
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
