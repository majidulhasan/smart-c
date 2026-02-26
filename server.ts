import Database from 'better-sqlite3';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('calendar.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT,
    category TEXT DEFAULT 'personal',
    color TEXT,
    is_recurring INTEGER DEFAULT 0,
    recurrence_type TEXT
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT,
    category TEXT,
    target_days_per_week INTEGER DEFAULT 7
  );

  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER,
    date TEXT NOT NULL,
    status INTEGER DEFAULT 1,
    FOREIGN KEY(habit_id) REFERENCES habits(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    due_date TEXT,
    is_completed INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'medium'
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    target_date TEXT,
    progress INTEGER DEFAULT 0,
    type TEXT DEFAULT 'monthly'
  );
`);

// Seed default habits if empty
const habitCount = db.prepare('SELECT COUNT(*) as count FROM habits').get() as { count: number };
if (habitCount.count === 0) {
  const insertHabit = db.prepare('INSERT INTO habits (name, icon, category) VALUES (?, ?, ?)');
  insertHabit.run('5 Times Salah', 'Mosque', 'Islamic');
  insertHabit.run('Quran Reading', 'Book', 'Islamic');
  insertHabit.run('Morning Adhkar', 'Sun', 'Islamic');
  insertHabit.run('Fasting', 'Moon', 'Islamic');
  insertHabit.run('Exercise', 'Dumbbell', 'Health');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get('/api/events', (req, res) => {
    const events = db.prepare('SELECT * FROM events').all();
    res.json(events);
  });

  app.post('/api/events', (req, res) => {
    const { title, description, start_date, end_date, category, color } = req.body;
    const info = db.prepare('INSERT INTO events (title, description, start_date, end_date, category, color) VALUES (?, ?, ?, ?, ?, ?)')
      .run(title, description, start_date, end_date, category, color);
    res.json({ id: info.lastInsertRowid });
  });

  app.get('/api/habits', (req, res) => {
    const habits = db.prepare('SELECT * FROM habits').all();
    const logs = db.prepare('SELECT * FROM habit_logs').all();
    res.json({ habits, logs });
  });

  app.post('/api/habit-logs', (req, res) => {
    const { habit_id, date, status } = req.body;
    db.prepare('INSERT OR REPLACE INTO habit_logs (habit_id, date, status) VALUES (?, ?, ?)')
      .run(habit_id, date, status);
    res.json({ success: true });
  });

  app.get('/api/tasks', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks').all();
    res.json(tasks);
  });

  app.post('/api/tasks', (req, res) => {
    const { title, due_date, priority } = req.body;
    const info = db.prepare('INSERT INTO tasks (title, due_date, priority) VALUES (?, ?, ?)')
      .run(title, due_date, priority);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch('/api/tasks/:id', (req, res) => {
    const { is_completed } = req.body;
    db.prepare('UPDATE tasks SET is_completed = ? WHERE id = ?').run(is_completed ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/settings/:key', (req, res) => {
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key) as { value: string } | undefined;
    res.json({ value: setting?.value || null });
  });

  app.post('/api/settings', (req, res) => {
    const { key, value } = req.body;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
    res.json({ success: true });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
