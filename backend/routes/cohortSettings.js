import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Handle preflight OPTIONS requests for CORS
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.sendStatus(200);
});

// Test endpoint to verify CORS is working for this route
router.get('/test', (req, res) => {
  console.log('🧪 Cohort settings CORS test - Origin:', req.headers.origin);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.json({ 
    message: 'Cohort settings CORS test successful', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Path to the JSON file
const SETTINGS_FILE_PATH = path.join(__dirname, '../data/cohort-navigation-settings.json');

// Helper function to read settings file
async function readSettingsFile() {
  try {
    const data = await fs.readFile(SETTINGS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings file:', error);
    // Return default settings if file doesn't exist
    return {};
  }
}

// Helper function to write settings file
async function writeSettingsFile(settings) {
  try {
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing settings file:', error);
    return false;
  }
}

// GET /api/cohort-settings/:cohortId - Get settings for a specific cohort
router.get('/:cohortId', async (req, res) => {
  try {
    // Add CORS headers specifically for this route
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    const { cohortId } = req.params;
    console.log('📋 Fetching settings for cohort:', cohortId);
    console.log('🌐 Request origin:', req.headers.origin);
    
    const settings = await readSettingsFile();
    const cohortSettings = settings[cohortId];
    
    if (!cohortSettings) {
      console.log('⚠️ No settings found for cohort:', cohortId);
      return res.status(404).json({
        success: false,
        message: 'Cohort settings not found',
        cohortId: cohortId
      });
    }
    
    console.log('✅ Settings found for cohort:', cohortId);
    res.json({
      success: true,
      data: cohortSettings,
      cohortId: cohortId
    });
  } catch (error) {
    console.error('❌ Error fetching cohort settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/cohort-settings - Get all cohort settings
router.get('/', async (req, res) => {
  try {
    // Add CORS headers specifically for this route
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    console.log('📋 Fetching all cohort settings');
    console.log('🌐 Request origin:', req.headers.origin);
    
    const settings = await readSettingsFile();
    
    console.log('✅ All settings fetched successfully');
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Error fetching all cohort settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/cohort-settings/:cohortId - Save settings for a specific cohort
router.post('/:cohortId', async (req, res) => {
  try {
    // Add CORS headers specifically for this route
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    const { cohortId } = req.params;
    const newSettings = req.body;
    
    console.log('💾 Saving settings for cohort:', cohortId);
    console.log('🌐 Request origin:', req.headers.origin);
    console.log('⚙️ Settings to save:', JSON.stringify(newSettings, null, 2));
    
    // Validate settings structure
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings data'
      });
    }
    
    // Read current settings
    const currentSettings = await readSettingsFile();
    
    // Update settings for this cohort
    currentSettings[cohortId] = newSettings;
    
    // Write back to file
    const writeSuccess = await writeSettingsFile(currentSettings);
    
    if (!writeSuccess) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save settings'
      });
    }
    
    console.log('✅ Settings saved successfully for cohort:', cohortId);
    res.json({
      success: true,
      message: 'Settings saved successfully',
      cohortId: cohortId,
      data: newSettings
    });
  } catch (error) {
    console.error('❌ Error saving cohort settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/cohort-settings/:cohortId - Reset settings for a cohort to defaults
router.delete('/:cohortId', async (req, res) => {
  try {
    // Add CORS headers specifically for this route
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    const { cohortId } = req.params;
    console.log('🔄 Resetting settings for cohort:', cohortId);
    console.log('🌐 Request origin:', req.headers.origin);
    
    // Default settings structure
    const defaultSettings = {
      dashboard: {
        Dashboard: true,
        Community: true,
        Enrollments: true
      },
      courses: {
        'My Courses': true,
        Assignments: true,
        Assessments: true
      },
      progress: {
        'My Grades': true,
        'Progress Tracking': true
      },
      resources: {
        Calendar: true,
        Messages: true
      },
      emulators: {
        'Code Editor': true,
        'Scratch Editor': true
      },
      settings: {
        'Profile Settings': true
      }
    };
    
    // Read current settings
    const currentSettings = await readSettingsFile();
    
    // Reset to defaults
    currentSettings[cohortId] = defaultSettings;
    
    // Write back to file
    const writeSuccess = await writeSettingsFile(currentSettings);
    
    if (!writeSuccess) {
      return res.status(500).json({
        success: false,
        message: 'Failed to reset settings'
      });
    }
    
    console.log('✅ Settings reset successfully for cohort:', cohortId);
    res.json({
      success: true,
      message: 'Settings reset to defaults',
      cohortId: cohortId,
      data: defaultSettings
    });
  } catch (error) {
    console.error('❌ Error resetting cohort settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
