const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    index: true 
  },
  filePath: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Stores the path in the repo (e.g., "automation/gmail-to-slack.json")
  json: { 
    type: Object, 
    required: true 
  }, // The actual full n8n JSON code
  nodes: [{ 
    type: String 
  }], // Array of node types used (e.g., ["Telegram", "Google Sheets"])
  githubUrl: { 
    type: String 
  },
  sha: { 
    type: String 
  } // GitHub hash to track if file has changed (for updates)
}, { timestamps: true });

// Create a text index for high-performance searching
workflowSchema.index({ name: 'text', nodes: 'text' });

module.exports = mongoose.model('Workflow', workflowSchema);