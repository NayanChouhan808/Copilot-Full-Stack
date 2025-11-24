const { GoogleGenerativeAI } = require('@google/generative-ai');
const { query, transaction } = require('../config/database');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple in-memory cache for language IDs (avoid repeated DB queries)
const languageCache = new Map();

/**
 * POST /api/generate
 * Generates code using Gemini AI and saves to database
 */
async function generateCode(req, res) {
  const { prompt, language, userId = null } = req.body;

  // Validation
  if (!prompt || !language) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: 'Both prompt and language are required'
    });
  }

  if (prompt.length > 5000) {
    return res.status(400).json({
      error: 'Prompt too long',
      details: 'Prompt must be 5000 characters or less'
    });
  }

  try {
    // 1. Get language_id from cache or database
    // Handle "cpp" -> "C++" mapping for backwards compatibility
    let languageToQuery = language;
    if (language.toLowerCase() === 'cpp') {
      languageToQuery = 'C++';
    }
    
    let languageId = languageCache.get(languageToQuery.toLowerCase());
    
    if (!languageId) {
      // Not in cache, fetch from database
      const langResult = await query(
        'SELECT id FROM languages WHERE LOWER(name) = LOWER($1) AND is_active = true',
        [languageToQuery]
      );

      if (langResult.rows.length === 0) {
        return res.status(400).json({
          error: 'Invalid language',
          details: `Language '${language}' is not supported`
        });
      }

      languageId = langResult.rows[0].id;
      // Cache for future requests
      languageCache.set(languageToQuery.toLowerCase(), languageId);
    }

    // 2. Generate code using Gemini AI
    console.log(`Generating ${language} code for prompt: "${prompt.substring(0, 50)}..."`);
    
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp', // Use fastest model
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048, // Limit output for faster response
      }
    });

    // Shorter, more direct prompt for faster processing
    const enhancedPrompt = `Write ${language} code: ${prompt}\n\nReturn only executable code, no explanations.`;

    // Generate code with Gemini AI - this is the slow part
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    let generatedCode = response.text();

    // Clean up any markdown code blocks
    generatedCode = generatedCode
      .replace(/```[\w]*\n/g, '')
      .replace(/```$/g, '')
      .trim();

    // 3. Return response IMMEDIATELY (don't wait for DB save)
    res.status(201).json({
      success: true,
      data: {
        code: generatedCode,
        language,
        prompt
      }
    });

    // 4. Save to database in background (non-blocking)
    // Use setImmediate to not block the response
    setImmediate(async () => {
      try {
        await transaction(async (client) => {
          await client.query(
            `INSERT INTO generations (user_id, language_id, prompt, generated_code, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [userId, languageId, prompt, generatedCode]
          );
        });
        console.log(`✅ Saved generation to database (ID: ${languageId})`);
      } catch (dbError) {
        console.error('❌ Error saving to database (non-critical):', dbError.message);
        // Don't throw - user already got their code
      }
    });

  } catch (error) {
    console.error('Error generating code:', error);

    // Handle specific Gemini API errors
    if (error.message && error.message.includes('API key')) {
      return res.status(401).json({
        error: 'API authentication failed',
        details: 'Invalid or expired Gemini API key'
      });
    }

    if (error.message && error.message.includes('quota')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        details: 'Gemini API quota exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Code generation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

/**
 * GET /api/history
 * Returns paginated code generation history with user and language info
 */
async function getHistory(req, res) {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Optional filters
    const userId = req.query.userId || null;
    const languageFilter = req.query.language || null;

    // Build dynamic query
    let whereClause = '1=1';
    const params = [limit, offset];
    let paramIndex = 3;

    if (userId) {
      whereClause += ` AND g.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (languageFilter) {
      whereClause += ` AND LOWER(l.name) = LOWER($${paramIndex})`;
      params.push(languageFilter);
      paramIndex++;
    }

    // Query with JOINs for related data
    const historyQuery = `
      SELECT 
        g.id,
        g.prompt,
        g.generated_code AS code,
        g.created_at AS timestamp,
        l.name AS language,
        l.file_extension,
        u.email AS user_email,
        u.username
      FROM generations g
      LEFT JOIN users u ON g.user_id = u.id
      INNER JOIN languages l ON g.language_id = l.id
      WHERE ${whereClause}
      ORDER BY g.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    // Get total count for pagination metadata
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM generations g
      INNER JOIN languages l ON g.language_id = l.id
      WHERE ${whereClause}
    `;

    // Execute both queries in parallel
    const [historyResult, countResult] = await Promise.all([
      query(historyQuery, params),
      query(countQuery, params.slice(2)) // Exclude limit/offset for count
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: historyResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

/**
 * GET /api/stats
 * Returns generation statistics
 */
async function getStats(req, res) {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) AS total_generations,
        COUNT(DISTINCT user_id) AS unique_users,
        l.name AS language,
        COUNT(g.id) AS language_count
      FROM generations g
      INNER JOIN languages l ON g.language_id = l.id
      GROUP BY l.name
      ORDER BY language_count DESC
    `;

    const result = await query(statsQuery);

    const totalGenerations = result.rows.reduce((sum, row) => sum + parseInt(row.language_count), 0);

    res.json({
      success: true,
      data: {
        totalGenerations,
        languageBreakdown: result.rows
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

/**
 * DELETE /api/history/:id
 * Deletes a specific generation by ID
 */
async function deleteGeneration(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        details: 'Generation ID must be a valid number'
      });
    }

    const result = await query(
      'DELETE FROM generations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Generation not found',
        details: `No generation found with ID ${id}`
      });
    }

    res.json({
      success: true,
      message: 'Generation deleted successfully',
      deletedId: result.rows[0].id
    });

  } catch (error) {
    console.error('Error deleting generation:', error);
    res.status(500).json({
      error: 'Failed to delete generation',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

/**
 * DELETE /api/history
 * Deletes all generations for a user or all generations (admin)
 */
async function clearHistory(req, res) {
  try {
    const { userId } = req.query;

    let deleteQuery;
    let params = [];

    if (userId) {
      deleteQuery = 'DELETE FROM generations WHERE user_id = $1 RETURNING id';
      params = [userId];
    } else {
      // If no userId provided, delete all (be careful with this!)
      deleteQuery = 'DELETE FROM generations RETURNING id';
    }

    const result = await query(deleteQuery, params);

    res.json({
      success: true,
      message: 'History cleared successfully',
      deletedCount: result.rows.length
    });

  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({
      error: 'Failed to clear history',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

module.exports = {
  generateCode,
  getHistory,
  getStats,
  deleteGeneration,
  clearHistory
};
