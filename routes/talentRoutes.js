const express = require('express');
const router = express.Router();
const Talent = require('../models/Talent');
const upload = require('../config/cloudinary'); // Import upload middleware

// ==========================================
// 1. CREATE TALENT (POST)
// ==========================================
router.post('/', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("📥 POST /api/talent");
    let talentData = req.body;

    // Handle Files
    if (req.files) {
      if (req.files.profileImage) talentData.profileImage = req.files.profileImage[0].path;
      if (req.files.resume) talentData.resume = req.files.resume[0].path;
    }

    // Parse JSON fields
    parseNestedFields(talentData);

    const newTalent = new Talent(talentData);
    const savedTalent = await newTalent.save();
    res.status(201).json(savedTalent);

  } catch (err) {
    console.error("❌ POST Error:", err);
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 2. UPDATE TALENT (PUT) - ✅ FIXED & ADDED BACK
// ==========================================
// Now supports file uploads too!
router.put('/:id', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log(`📝 PUT /api/talent/${req.params.id}`);
    
    let updateData = req.body;

    // Handle File Updates (Only update if new files are sent)
    if (req.files) {
      if (req.files.profileImage) updateData.profileImage = req.files.profileImage[0].path;
      if (req.files.resume) updateData.resume = req.files.resume[0].path;
    }

    // Parse Nested JSON fields again (FormData sends them as strings)
    parseNestedFields(updateData);

    // Perform Update
    const updatedTalent = await Talent.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true } // Return the updated document
    );

    if (!updatedTalent) {
      return res.status(404).json({ msg: 'Talent not found' });
    }

    res.status(200).json(updatedTalent);

  } catch (err) {
    console.error("❌ PUT Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. GET ALL TALENT (List)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const talents = await Talent.find().sort({ createdAt: -1 });
    res.status(200).json(talents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. GET SINGLE TALENT (Profile)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const talent = await Talent.findById(req.params.id);
    if (!talent) return res.status(404).json({ msg: 'Talent not found' });
    res.status(200).json(talent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Helper Function to Parse JSON Fields ---
const parseNestedFields = (data) => {
  const fields = ['address', 'social', 'topSkills', 'tools', 'experiences', 'education', 'certifications'];
  fields.forEach(field => {
    if (data[field] && typeof data[field] === 'string') {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (e) {
        console.error(`⚠️ Could not parse ${field}`, e);
      }
    }
  });
};

module.exports = router;