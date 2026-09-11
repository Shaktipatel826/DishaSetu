const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Separate upload directories for Private Proofs (Non-Public) vs Public Banners
const privateProofDir = process.env.PRIVATE_PROOF_DIR || path.join(__dirname, '..', 'private_uploads', 'proofs');
const publicBannerDir = process.env.PUBLIC_BANNER_DIR || path.join(__dirname, '..', 'public', 'uploads', 'banners');

if (!fs.existsSync(privateProofDir)) {
  fs.mkdirSync(privateProofDir, { recursive: true });
}
if (!fs.existsSync(publicBannerDir)) {
  fs.mkdirSync(publicBannerDir, { recursive: true });
}

// Storage configuration with separated destinations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'proof' || file.fieldname === 'verificationImage') {
      cb(null, privateProofDir);
    } else {
      cb(null, publicBannerDir);
    }
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
