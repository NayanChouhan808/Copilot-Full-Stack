const express = require('express');
const { 
  generateCode, 
  getHistory, 
  getStats, 
  deleteGeneration, 
  clearHistory 
} = require('../controllers/codeController');

const router = express.Router();

/**
 * POST /api/generate
 * Generate code using AI
 * Body: { prompt: string, language: string, userId?: number }
 */
router.post('/generate', generateCode);

/**
 * GET /api/history
 * Get paginated generation history
 * Query: page, limit, userId, language
 */
router.get('/history', getHistory);

/**
 * DELETE /api/history/:id
 * Delete a specific generation by ID
 */
router.delete('/history/:id', deleteGeneration);

/**
 * DELETE /api/history
 * Clear history (all or by userId)
 * Query: userId (optional)
 */
router.delete('/history', clearHistory);

/**
 * GET /api/stats
 * Get generation statistics
 */
router.get('/stats', getStats);

module.exports = router;
