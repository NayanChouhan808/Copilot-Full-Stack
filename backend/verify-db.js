// Test script to verify database tables and seed data
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database setup...\n');

    // Check tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
      ORDER BY table_name
    `);
    
    console.log('✅ Tables created:');
    tables.rows.forEach(t => console.log(`   - ${t.table_name}`));
    
    // Check languages count
    const langCount = await pool.query('SELECT COUNT(*) FROM languages');
    console.log(`\n✅ Languages seeded: ${langCount.rows[0].count} languages`);
    
    // List languages
    const languages = await pool.query('SELECT name FROM languages ORDER BY name');
    console.log('   Languages available:');
    languages.rows.forEach(l => console.log(`   - ${l.name}`));
    
    // Check users
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\n✅ Users seeded: ${userCount.rows[0].count} user(s)`);
    
    console.log('\n🎉 Database setup verified successfully!');
  } catch (error) {
    console.error('❌ Error verifying database:', error.message);
  } finally {
    await pool.end();
  }
}

verifyDatabase();
