const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Database = require("better-sqlite3");
const fs = require("fs");

// Ensure directories exist
const photosDir = path.join(__dirname, "uploads", "photos");
const videosDir = path.join(__dirname, "uploads", "videos");
const dataDir = path.join(__dirname, "data");
fs.mkdirSync(photosDir, { recursive: true });
fs.mkdirSync(videosDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

// Database setup
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

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || "photo";
    const dir = type === "video" ? videosDir : photosDir;
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const type = req.body.type || "photo";
  if (type === "photo") {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid photo file type. Only JPEG, PNG, GIF, and WebP are allowed.",
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
    cb(new Error('Invalid media type. Must be "photo" or "video".'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// Upload endpoint
app.post("/api/upload", (req, res) => {
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

// List media with pagination
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

// Delete a media item
app.delete("/api/media/:id", (req, res) => {
  const stmt = db.prepare("SELECT * FROM media WHERE id = ?");
  const item = stmt.get(req.params.id);

  if (!item) {
    return res.status(404).json({ error: "Media item not found." });
  }

  const baseDir = item.type === "video" ? "videos" : "photos";
  const filePath = path.join(__dirname, "uploads", baseDir, item.filename);

  // Delete file from disk
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.error("Error deleting file:", e);
  }

  // Delete from database
  const deleteStmt = db.prepare("DELETE FROM media WHERE id = ?");
  deleteStmt.run(req.params.id);

  res.json({ success: true });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gallery backend running on http://localhost:${PORT}`);
});
