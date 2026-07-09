const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { parseResumeText } = require("./aiMatchingService");
const logger = require("../utils/logger");

// ─── Multer Storage Config ──────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/resumes");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `resume_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and Word documents are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter,
});

// Avatar upload config
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `avatar_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed for avatars"), false);
  },
});

// ─── PDF Text Extractor ──────────────────────────────────────────────────────
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (err) {
    logger.error("PDF extraction error:", err.message);
    throw new Error("Failed to extract text from PDF");
  }
};

// ─── Resume Parser (main function) ───────────────────────────────────────────
const parseResume = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  let text = "";

  if (ext === ".pdf") {
    text = await extractTextFromPDF(filePath);
  } else {
    // For .doc/.docx — basic text extraction
    // For production, use 'mammoth' package for better .docx support
    text = fs.readFileSync(filePath, "utf-8");
  }

  if (!text || text.trim().length < 50) {
    throw new Error(
      "Resume appears to be empty or unreadable. Please upload a text-based PDF.",
    );
  }

  const parsed = parseResumeText(text);
  return { ...parsed, rawText: text };
};

module.exports = { upload, avatarUpload, parseResume };
