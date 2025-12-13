const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// DEBUG LOG: Check if keys exist
console.log("☁️ Cloudinary Config Check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Loaded" : "❌ MISSING",
  api_key: process.env.CLOUDINARY_API_KEY ? "✅ Loaded" : "❌ MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✅ Loaded" : "❌ MISSING",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'gensquad_uploads',
      // ✅ CHANGE: Use 'auto' for everything. 
      // This lets Cloudinary detect PDFs as viewable assets rather than restricted 'raw' files.
      resource_type: 'auto', 
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx'],
      // ✅ Force public read access
      type: 'upload', 
      public_id: file.fieldname + '-' + Date.now(),
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;