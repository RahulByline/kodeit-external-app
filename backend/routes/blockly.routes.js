import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data', 'blockly');

async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/blockly/projects - List all projects
router.get('/projects', async (req, res) => {
  try {
    await ensureDataDir();
    
    const files = await fs.readdir(dataDir);
    const projects = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(dataDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const project = JSON.parse(content);
        
        projects.push({
          id: project.id,
          name: project.name,
          updatedAt: project.updatedAt || project.timestamp
        });
      }
    }
    
    // Sort by updatedAt (newest first)
    projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    res.json(projects);
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

// GET /api/blockly/projects/:id - Get specific project
router.get('/projects/:id', async (req, res) => {
  try {
    await ensureDataDir();
    
    const { id } = req.params;
    const filePath = path.join(dataDir, `${id}.json`);
    
    const content = await fs.readFile(filePath, 'utf8');
    const project = JSON.parse(content);
    
    res.json({
      id: project.id,
      name: project.name,
      workspaceJson: project.workspaceJson,
      updatedAt: project.updatedAt || project.timestamp
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Project not found' });
    } else {
      console.error('Error getting project:', error);
      res.status(500).json({ error: 'Failed to get project' });
    }
  }
});

// POST /api/blockly/projects - Create or update project
router.post('/projects', async (req, res) => {
  try {
    await ensureDataDir();
    
    const { id, name, workspaceJson } = req.body;
    
    if (!name || !workspaceJson) {
      return res.status(400).json({ error: 'Name and workspaceJson are required' });
    }
    
    // Generate ID from name if not provided
    const projectId = id || generateSlug(name);
    
    // Ensure unique ID
    let finalId = projectId;
    let counter = 1;
    while (true) {
      const filePath = path.join(dataDir, `${finalId}.json`);
      try {
        await fs.access(filePath);
        finalId = `${projectId}-${counter}`;
        counter++;
      } catch {
        break;
      }
    }
    
    const project = {
      id: finalId,
      name,
      workspaceJson,
      updatedAt: new Date().toISOString()
    };
    
    const filePath = path.join(dataDir, `${finalId}.json`);
    await fs.writeFile(filePath, JSON.stringify(project, null, 2));
    
    res.json({ id: finalId });
  } catch (error) {
    console.error('Error saving project:', error);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// DELETE /api/blockly/projects/:id - Delete project
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(dataDir, `${id}.json`);
    
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Project not found' });
    } else {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }
});

export default router;
