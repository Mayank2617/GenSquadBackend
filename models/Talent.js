const mongoose = require('mongoose');

// Define Sub-Schemas strictly to prevent casting errors
const ExperienceSchema = new mongoose.Schema({
  current: String,
  type: String,
  expYears: String,
  expMonths: String,
  company: String,
  role: String,
  location: String,
  joinMonth: String,
  joinYear: String,
  currency: String,
  salary: String,
  description: String,
  displayTitle: String,
  displaySubtitle: String,
  displayMeta: String,
  displayDesc: String
});

const EducationSchema = new mongoose.Schema({
  institute: String,
  degree: String,
  startMonth: String,
  startYear: String,
  endMonth: String,
  endYear: String,
  description: String,
  displayTitle: String,
  displaySubtitle: String,
  displayMeta: String,
  displayDesc: String
});

const CertificationSchema = new mongoose.Schema({
  institution: String,
  company: String,
  joinMonth: String,
  joinYear: String,
  description: String,
  displayTitle: String,
  displaySubtitle: String,
  displayMeta: String,
  displayDesc: String
});

const SkillSchema = new mongoose.Schema({
  name: String,
  usage: String,
  exp: String,
  color: String
});

const TalentSchema = new mongoose.Schema({
  // --- 1. IDENTITY ---
  fullName: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, default: 'Active' },
  nextAvailableDate: { type: String },
  company: { type: String },
  
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  
  address: {
    street: String,
    building: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },

  profileImage: { type: String },
  resume: { type: String },

  // --- 2. SOCIAL ---
  social: {
    linkedin: String,
    github: String,
    portfolio: String,
    huggingface: String,
    stackoverflow: String,
    twitter: String
  },

  // --- 3. PROFILE ---
  about: { type: String },
  
  // ✅ Explicitly using the Sub-Schemas here
  topSkills: [SkillSchema],
  tools: [String],
  experiences: [ExperienceSchema],
  education: [EducationSchema],
  certifications: [CertificationSchema]

}, { timestamps: true });

module.exports = mongoose.model('Talent', TalentSchema);