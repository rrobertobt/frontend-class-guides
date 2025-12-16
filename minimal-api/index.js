require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();

const PORT = Number(process.env.PORT || 3001);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:4200";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret";

// --- Middleware
app.use(express.json());

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true
  })
);

app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: "."
    }),
    name: "sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false // en prod: true con HTTPS
    }
  })
);

// --- Helpers
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

function sanitizeUser(row) {
  return { id: row.id, email: row.email, name: row.name, createdAt: row.created_at };
}

// --- Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// --- Auth
app.post("/auth/register", (req, res) => {
  const { email, name, password } = req.body ?? {};
  if (!email || !name || !password) {
    return res.status(400).json({ message: "email, name, password are required" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const passwordHash = bcrypt.hashSync(password, 10);

  const info = db
    .prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)")
    .run(email, name, passwordHash);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);

  // Auto-login after register
  req.session.userId = user.id;

  res.status(201).json({ user: sanitizeUser(user) });
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ message: "email and password required" });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  req.session.userId = user.id;

  res.json({ user: sanitizeUser(user) });
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sid");
    res.json({ message: "Logged out" });
  });
});

app.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.session.userId);
  if (!user) return res.status(401).json({ message: "Not authenticated" });
  res.json({ user: sanitizeUser(user) });
});

// --- Todos (CRUD, scoped to logged-in user)
app.get("/todos", requireAuth, (req, res) => {
  const rows = db
    .prepare("SELECT id, title, done, created_at, updated_at FROM todos WHERE user_id = ? ORDER BY id DESC")
    .all(req.session.userId);

  res.json({ todos: rows.map(r => ({ ...r, done: !!r.done })) });
});

app.post("/todos", requireAuth, (req, res) => {
  const { title } = req.body ?? {};
  if (!title || !title.trim()) return res.status(400).json({ message: "title required" });

  const info = db
    .prepare("INSERT INTO todos (user_id, title, done) VALUES (?, ?, 0)")
    .run(req.session.userId, title.trim());

  const todo = db
    .prepare("SELECT id, title, done, created_at, updated_at FROM todos WHERE id = ?")
    .get(info.lastInsertRowid);

  res.status(201).json({ todo: { ...todo, done: !!todo.done } });
});

app.patch("/todos/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid id" });

  const existing = db
    .prepare("SELECT id FROM todos WHERE id = ? AND user_id = ?")
    .get(id, req.session.userId);
  if (!existing) return res.status(404).json({ message: "Todo not found" });

  const { title, done } = req.body ?? {};

  if (title !== undefined) {
    if (!String(title).trim()) return res.status(400).json({ message: "title cannot be empty" });
    db.prepare("UPDATE todos SET title = ? WHERE id = ? AND user_id = ?").run(String(title).trim(), id, req.session.userId);
  }

  if (done !== undefined) {
    const doneInt = done ? 1 : 0;
    db.prepare("UPDATE todos SET done = ? WHERE id = ? AND user_id = ?").run(doneInt, id, req.session.userId);
  }

  const todo = db
    .prepare("SELECT id, title, done, created_at, updated_at FROM todos WHERE id = ?")
    .get(id);

  res.json({ todo: { ...todo, done: !!todo.done } });
});

app.delete("/todos/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid id" });

  const info = db
    .prepare("DELETE FROM todos WHERE id = ? AND user_id = ?")
    .run(id, req.session.userId);

  if (info.changes === 0) return res.status(404).json({ message: "Todo not found" });

  res.json({ message: "Deleted" });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`CORS allowed origin: ${FRONTEND_ORIGIN}`);
});
