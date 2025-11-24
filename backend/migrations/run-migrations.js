const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Create pool with SSL for Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') 
    ? { rejectUnauthorized: false } 
    : false,
  connectionTimeoutMillis: 10000,
});

async function runMigrations() {
  console.log('🔄 Starting database migrations...\n');

  try {
    // Test connection first
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection established\n');

    // Get all migration files
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure order: 001, 002, etc.

    for (const file of files) {
      console.log(`📄 Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await pool.query(sql);
        console.log(`✓ Successfully executed ${file}\n`);
      } catch (error) {
        console.error(`✗ Error in ${file}:`, error.message);
        throw error;
      }
    }

    console.log('✅ All migrations completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run migrations
runMigrations();
