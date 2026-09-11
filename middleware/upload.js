const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Destination upload directory (configurable via UPLOAD_DIR env variable for Render persistent disks)
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'public', 'uploads', 'proofs');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedBaseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${ext}). Only PDF documents, JPG, JPEG, PNG, and WEBP image proofs are accepted.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max file size limit
  }
});

const submissionUploads = upload.fields([
  { name: 'proof', maxCount: 1 },
  { name: 'verificationImage', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'publicBannerImage', maxCount: 1 }
]);

module.exports = upload;
module.exports.submissionUploads = submissionUploads;
