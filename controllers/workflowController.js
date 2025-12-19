const axios = require('axios');
const Workflow = require('../models/Workflow');

// GitHub Repo Details
const REPO_OWNER = 'Zie619';
const REPO_NAME = 'n8n-workflows';
const BRANCH = 'main'; // Usually main or master

// Helper: Clean node names (e.g., "n8n-nodes-base.googleSheets" -> "Google Sheets")
const extractNodeNames = (n8nJson) => {
  if (!n8nJson.nodes || !Array.isArray(n8nJson.nodes)) return [];
  return n8nJson.nodes.map(node => {
    const type = node.type || "";
    return type.replace('n8n-nodes-base.', '');
  });
};

// 1. SYNC FUNCTION (Trigger this manually or via Cron)
exports.syncWorkflows = async (req, res) => {
  console.log("🔄 Starting n8n Workflow Sync...");
  
  try {
    // A. Fetch the File Tree from GitHub (Recursive)
    // Note: For 4000+ files, you might need a GitHub Token if you hit rate limits.
    // headers: { Authorization: `token YOUR_GITHUB_TOKEN` } 
    const treeUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${BRANCH}?recursive=1`;
    const treeRes = await axios.get(treeUrl);
    
    if (!treeRes.data.tree) throw new Error("Could not fetch repository tree");

    // B. Filter for .json files only
    const jsonFiles = treeRes.data.tree.filter(item => item.path.endsWith('.json'));
    console.log(`📂 Found ${jsonFiles.length} JSON files in repository.`);

    let added = 0;
    let updated = 0;
    let skipped = 0;

    // C. Process files (Using a loop to manage rate limits slightly better)
    for (const file of jsonFiles) {
      // Check if we already have this file with the same SHA (Hash)
      const existing = await Workflow.findOne({ filePath: file.path });

      if (existing && existing.sha === file.sha) {
        skipped++;
        continue; // File hasn't changed, skip download
      }

      // D. Download Raw Content
      const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${file.path}`;
      
      try {
        const contentRes = await axios.get(rawUrl);
        const workflowData = contentRes.data;

        // E. Prepare Data
        // Use filename as name, remove .json extension, replace dashes with spaces
        const name = file.path.split('/').pop().replace('.json', '').replace(/-/g, ' ');
        const nodeTypes = extractNodeNames(workflowData);

        // F. Save/Upsert to DB
        await Workflow.findOneAndUpdate(
          { filePath: file.path },
          {
            name: name,
            filePath: file.path,
            json: workflowData,
            nodes: nodeTypes,
            githubUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/${file.path}`,
            sha: file.sha
          },
          { upsert: true, new: true }
        );

        if (existing) updated++;
        else added++;

        // Log progress every 50 files
        if ((added + updated + skipped) % 50 === 0) {
            console.log(`⏳ Processed ${added + updated + skipped}/${jsonFiles.length} workflows...`);
        }

      } catch (err) {
        console.error(`❌ Error processing ${file.path}:`, err.message);
      }
    }

    console.log(`✅ Sync Complete! Added: ${added}, Updated: ${updated}, Skipped: ${skipped}`);
    
    if (res) {
        res.json({ success: true, message: `Sync Complete. Added: ${added}, Updated: ${updated}` });
    }

  } catch (error) {
    console.error("❌ Sync Fatal Error:", error);
    if (res) res.status(500).json({ error: error.message });
  }
};

// 2. GET WORKFLOWS (For Frontend)
exports.getWorkflows = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";

    let query = {};

    // Search Logic (Regex for partial matching)
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { nodes: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const workflows = await Workflow.find(query)
      .select('name nodes githubUrl createdAt') // Exclude heavy 'json' field for list view
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Workflow.countDocuments(query);

    res.json({
      workflows,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalWorkflows: total
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
};

// 3. GET SINGLE WORKFLOW (For Details/Copy Modal)
exports.getWorkflowById = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if(!workflow) return res.status(404).json({error: "Not found"});
        res.json(workflow);
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
}