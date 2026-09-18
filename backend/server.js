const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Database = require("better-sqlite3");
const fs = require("fs");
const crypto = require("crypto");

const photosDir = path.join(__dirname, "uploads", "photos");
const videosDir = path.join(__dirname, "uploads", "videos");
const membersDir = path.join(__dirname, "uploads", "members");
const dataDir = path.join(__dirname, "data");
fs.mkdirSync(photosDir, { recursive: true });
fs.mkdirSync(videosDir, { recursive: true });
fs.mkdirSync(membersDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "gallery.db"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('photo', 'video')),
    mime_type TEXT,
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sort_order INTEGER DEFAULT 0
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    part TEXT NOT NULL DEFAULT '',
    position TEXT NOT NULL DEFAULT '',
    photo TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn("members", "year_joined", "TEXT NOT NULL DEFAULT ''");
ensureColumn("members", "facts", "TEXT NOT NULL DEFAULT '{}'");

ensureColumn("members", "is_alumni", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("members", "year_graduated", "TEXT NOT NULL DEFAULT ''");

db.exec(`
  CREATE TABLE IF NOT EXISTS repertoire (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    original_artist TEXT NOT NULL DEFAULT '',
    arranger TEXT NOT NULL DEFAULT '',
    soloists TEXT NOT NULL DEFAULT '',
    recording_url TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'current' CHECK(status IN ('current', 'past')),
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
if (userCount === 0) {
  const seedUsername = process.env.ADMIN_USERNAME || "admin";
  const seedPassword = process.env.ADMIN_PASSWORD || "pitchplease";
  db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(
    seedUsername,
    hashPassword(seedPassword),
  );
  console.log(`Seeded default admin user "${seedUsername}".`);
}

const app = express();
app.use(cors());
app.use(express.json());

const SESSION_COOKIE = "pp_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const parts = typeof stored === "string" ? stored.split(":") : [];
  if (parts.length !== 2) return false;
  const candidate = crypto.scryptSync(password, parts[0], 64);
  const actual = Buffer.from(parts[1], "hex");
  return (
    candidate.length === actual.length &&
    crypto.timingSafeEqual(candidate, actual)
  );
}

function parseCookies(req) {
  const cookies = {};
  const raw = req.headers.cookie;
  if (!raw) return cookies;
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

function currentUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  return (
    db
      .prepare(
        `SELECT s.token, u.id, u.username FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token = ? AND s.expires_at > ?`,
      )
      .get(token, Date.now()) || null
  );
}

function isAuthorized(req) {
  return Boolean(currentUser(req));
}

function requireAuth(req, res, next) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  next();
}

function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(
    SESSION_TTL_MS / 1000,
  )}`;
}

app.post("/api/auth/login", (req, res) => {
  const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  const token = uuidv4();
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(
    token,
    user.id,
    Date.now() + SESSION_TTL_MS,
  );

  res.setHeader("Set-Cookie", sessionCookie(token));
  res.json({ success: true, username: user.username });
});

app.post("/api/auth/logout", (req, res) => {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (token) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
  res.json({ success: true });
});

app.get("/api/auth/status", (req, res) => {
  const user = currentUser(req);
  if (user) {
    res.json({ authorized: true, username: user.username });
  } else {
    res.json({ authorized: false, username: null });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || "photo";
    let dir = photosDir;
    if (type === "video") dir = videosDir;
    else if (type === "member") dir = membersDir;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const type = req.body.type || "photo";
  const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (type === "photo" || type === "member") {
    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid image file type. Only JPEG, PNG, GIF, and WebP are allowed.",
        ),
      );
    }
  } else if (type === "video") {
    const allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid video file type. Only MP4, WebM, OGG, and MOV are allowed.",
        ),
      );
    }
  } else {
    cb(new Error('Invalid media type. Must be "photo", "video", or "member".'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

const memberUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, membersDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, uuidv4() + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid image file type. Only JPEG, PNG, GIF, and WebP are allowed.",
        ),
      );
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.post("/api/upload", requireAuth, (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file provided." });
    }

    const type = req.body.type || "photo";
    const stmt = db.prepare(
      "INSERT INTO media (filename, original_name, type, mime_type, file_size) VALUES (?, ?, ?, ?, ?)",
    );
    const result = stmt.run(
      req.file.filename,
      req.file.originalname,
      type,
      req.file.mimetype,
      req.file.size,
    );

    res.json({
      id: result.lastInsertRowid,
      filename: req.file.filename,
      original_name: req.file.originalname,
      type,
      url: `/uploads/${type === "video" ? "videos" : "photos"}/${req.file.filename}`,
    });
  });
});

app.get("/api/media", (req, res) => {
  const type = req.query.type || "photo";
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
  const offset = (page - 1) * limit;

  const countStmt = db.prepare(
    "SELECT COUNT(*) as total FROM media WHERE type = ?",
  );
  const { total } = countStmt.get(type);

  const stmt = db.prepare(
    "SELECT * FROM media WHERE type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
  );
  const items = stmt.all(type, limit, offset);

  const baseDir = type === "video" ? "videos" : "photos";
  const mediaItems = items.map((item) => ({
    id: item.id,
    filename: item.filename,
    original_name: item.original_name,
    type: item.type,
    mime_type: item.mime_type,
    file_size: item.file_size,
    created_at: item.created_at,
    url: `/uploads/${baseDir}/${item.filename}`,
  }));

  res.json({
    items: mediaItems,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

app.delete("/api/media/:id", requireAuth, (req, res) => {
  const stmt = db.prepare("SELECT * FROM media WHERE id = ?");
  const item = stmt.get(req.params.id);

  if (!item) {
    return res.status(404).json({ error: "Media item not found." });
  }

  const baseDir = item.type === "video" ? "videos" : "photos";
  const filePath = path.join(__dirname, "uploads", baseDir, item.filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.error("Error deleting file:", e);
  }

  const deleteStmt = db.prepare("DELETE FROM media WHERE id = ?");
  deleteStmt.run(req.params.id);

  res.json({ success: true });
});

function parseFacts(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function sanitizeFacts(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const clean = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!key || typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) clean[key] = trimmed;
  }
  return clean;
}

function memberToJson(row) {
  return {
    id: row.id,
    name: row.name,
    part: row.part,
    position: row.position,
    year_joined: row.year_joined || "",
    year_graduated: row.year_graduated || "",
    is_alumni: row.is_alumni ? 1 : 0,
    facts: parseFacts(row.facts),
    photo: row.photo,
    photo_url: row.photo ? `/uploads/members/${row.photo}` : null,
    sort_order: row.sort_order,
    created_at: row.created_at,
  };
}

function listMembers(isAlumni) {
  return db
    .prepare(
      `SELECT * FROM members
       WHERE is_alumni = ?
       ORDER BY sort_order ASC, id ASC`,
    )
    .all(isAlumni ? 1 : 0)
    .map(memberToJson);
}

app.get("/api/members", (req, res) => {
  res.json({ members: listMembers(false) });
});

app.get("/api/alumni", (req, res) => {
  res.json({ members: listMembers(true) });
});

app.use("/api/members", requireAuth);

app.post("/api/members", (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    return res.status(400).json({ error: "Name is required." });
  }
  const part = typeof req.body.part === "string" ? req.body.part.trim() : "";
  const position =
    typeof req.body.position === "string" && req.body.position.trim()
      ? req.body.position.trim()
      : "Member";
  const yearJoined =
    typeof req.body.year_joined === "string" ? req.body.year_joined.trim() : "";
  const yearGraduated =
    typeof req.body.year_graduated === "string"
      ? req.body.year_graduated.trim()
      : "";
  const isAlumni = req.body.is_alumni ? 1 : 0;

  const { m: maxSort } = db
    .prepare("SELECT MAX(sort_order) as m FROM members WHERE is_alumni = ?")
    .get(isAlumni);

  const result = db
    .prepare(
      `INSERT INTO members
         (name, part, position, year_joined, year_graduated, facts, sort_order, is_alumni)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      name,
      part,
      position,
      yearJoined,
      yearGraduated,
      JSON.stringify(sanitizeFacts(req.body.facts)),
      (maxSort ?? -1) + 1,
      isAlumni,
    );

  const row = db
    .prepare("SELECT * FROM members WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(memberToJson(row));
});

app.put("/api/members/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM members WHERE id = ?")
    .get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Member not found." });
  }

  const name =
    typeof req.body.name === "string" ? req.body.name.trim() : row.name;
  const part =
    typeof req.body.part === "string" ? req.body.part.trim() : row.part;
  const position =
    typeof req.body.position === "string" && req.body.position.trim()
      ? req.body.position.trim()
      : row.position;
  const yearJoined =
    typeof req.body.year_joined === "string"
      ? req.body.year_joined.trim()
      : row.year_joined;
  const yearGraduated =
    typeof req.body.year_graduated === "string"
      ? req.body.year_graduated.trim()
      : row.year_graduated;
  const isAlumni =
    req.body.is_alumni === undefined
      ? row.is_alumni
      : req.body.is_alumni
        ? 1
        : 0;
  const facts =
    req.body.facts === undefined
      ? parseFacts(row.facts)
      : sanitizeFacts(req.body.facts);

  if (!name) {
    return res.status(400).json({ error: "Name is required." });
  }

  db.prepare(
    `UPDATE members
     SET name = ?, part = ?, position = ?, year_joined = ?,
         year_graduated = ?, facts = ?, is_alumni = ?
     WHERE id = ?`,
  ).run(
    name,
    part,
    position,
    yearJoined,
    yearGraduated,
    JSON.stringify(facts),
    isAlumni,
    req.params.id,
  );

  const updated = db
    .prepare("SELECT * FROM members WHERE id = ?")
    .get(req.params.id);
  res.json(memberToJson(updated));
});

app.post("/api/members/reorder", (req, res) => {
  const ids = req.body.ids;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "An ordered ids array is required." });
  }
  const update = db.prepare("UPDATE members SET sort_order = ? WHERE id = ?");
  const applyOrder = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => update.run(index, id));
  });
  applyOrder(ids);
  res.json({ success: true });
});

app.post("/api/members/:id/photo", (req, res) => {
  memberUpload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file provided." });
    }

    const row = db
      .prepare("SELECT * FROM members WHERE id = ?")
      .get(req.params.id);

    if (!row) {
      try {
        const orphanPath = path.join(membersDir, req.file.filename);
        if (fs.existsSync(orphanPath)) {
          fs.unlinkSync(orphanPath);
        }
      } catch (e) {
        console.error("Error cleaning up orphan member photo:", e);
      }
      return res.status(404).json({ error: "Member not found." });
    }

    if (row.photo) {
      const oldPath = path.join(membersDir, row.photo);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (e) {
        console.error("Error deleting old member photo:", e);
      }
    }

    db.prepare("UPDATE members SET photo = ? WHERE id = ?").run(
      req.file.filename,
      req.params.id,
    );

    const updated = db
      .prepare("SELECT * FROM members WHERE id = ?")
      .get(req.params.id);
    res.json(memberToJson(updated));
  });
});

app.delete("/api/members/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM members WHERE id = ?")
    .get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Member not found." });
  }

  if (row.photo) {
    const filePath = path.join(membersDir, row.photo);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error("Error deleting member photo:", e);
    }
  }

  db.prepare("DELETE FROM members WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

function trimText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRepertoireStatus(value) {
  return value === "past" ? "past" : "current";
}

function repertoireToJson(row) {
  return {
    id: row.id,
    title: row.title,
    original_artist: row.original_artist || "",
    arranger: row.arranger || "",
    soloists: row.soloists || "",
    recording_url: row.recording_url || "",
    status: normalizeRepertoireStatus(row.status),
    sort_order: row.sort_order,
    created_at: row.created_at,
  };
}

function listRepertoire(status) {
  return db
    .prepare(
      `SELECT * FROM repertoire
       WHERE status = ?
       ORDER BY sort_order ASC, id ASC`,
    )
    .all(status)
    .map(repertoireToJson);
}

app.get("/api/repertoire", (req, res) => {
  res.json({
    current: listRepertoire("current"),
    past: listRepertoire("past"),
  });
});

app.use("/api/repertoire", requireAuth);

app.post("/api/repertoire", (req, res) => {
  const title = trimText(req.body.title);
  if (!title) {
    return res.status(400).json({ error: "Title is required." });
  }

  const status = normalizeRepertoireStatus(req.body.status);

  const { m: maxSort } = db
    .prepare("SELECT MAX(sort_order) as m FROM repertoire WHERE status = ?")
    .get(status);

  const result = db
    .prepare(
      `INSERT INTO repertoire
         (title, original_artist, arranger, soloists, recording_url, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      title,
      trimText(req.body.original_artist),
      trimText(req.body.arranger),
      trimText(req.body.soloists),
      trimText(req.body.recording_url),
      status,
      (maxSort ?? -1) + 1,
    );

  const row = db
    .prepare("SELECT * FROM repertoire WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(repertoireToJson(row));
});

app.put("/api/repertoire/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM repertoire WHERE id = ?")
    .get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Repertoire item not found." });
  }

  const title =
    req.body.title === undefined ? row.title : trimText(req.body.title);
  if (!title) {
    return res.status(400).json({ error: "Title is required." });
  }

  const status =
    req.body.status === undefined
      ? normalizeRepertoireStatus(row.status)
      : normalizeRepertoireStatus(req.body.status);

  let sortOrder = row.sort_order;
  if (status !== row.status) {
    const { m: maxSort } = db
      .prepare("SELECT MAX(sort_order) as m FROM repertoire WHERE status = ?")
      .get(status);
    sortOrder = (maxSort ?? -1) + 1;
  }

  db.prepare(
    `UPDATE repertoire
     SET title = ?, original_artist = ?, arranger = ?, soloists = ?,
         recording_url = ?, status = ?, sort_order = ?
     WHERE id = ?`,
  ).run(
    title,
    req.body.original_artist === undefined
      ? row.original_artist
      : trimText(req.body.original_artist),
    req.body.arranger === undefined
      ? row.arranger
      : trimText(req.body.arranger),
    req.body.soloists === undefined
      ? row.soloists
      : trimText(req.body.soloists),
    req.body.recording_url === undefined
      ? row.recording_url
      : trimText(req.body.recording_url),
    status,
    sortOrder,
    req.params.id,
  );

  const updated = db
    .prepare("SELECT * FROM repertoire WHERE id = ?")
    .get(req.params.id);
  res.json(repertoireToJson(updated));
});

app.post("/api/repertoire/reorder", (req, res) => {
  const ids = req.body.ids;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "An ordered ids array is required." });
  }
  const update = db.prepare("UPDATE repertoire SET sort_order = ? WHERE id = ?");
  const applyOrder = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => update.run(index, id));
  });
  applyOrder(ids);
  res.json({ success: true });
});

app.delete("/api/repertoire/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM repertoire WHERE id = ?")
    .get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "Repertoire item not found." });
  }
  db.prepare("DELETE FROM repertoire WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gallery backend running on http://localhost:${PORT}`);
});
