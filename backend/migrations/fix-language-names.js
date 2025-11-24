const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixLanguageNames() {
  try {
    console.log('🔄 Fixing language names...');
    
    // Update C++ to cpp
    const result = await pool.query(
      "UPDATE languages SET name = 'cpp' WHERE LOWER(name) = 'c++'"
    );
    console.log(`✅ Updated ${result.rowCount} row(s) from 'C++' to 'cpp'`);
    
    // Also update other languages to lowercase
    await pool.query("UPDATE languages SET name = LOWER(name) WHERE name != LOWER(name)");
    console.log('✅ Normalized all language names to lowercase');
    
    // Verify
    const languages = await pool.query('SELECT * FROM languages ORDER BY name');
    console.log('\n📋 Current languages in database:');
    languages.rows.forEach(lang => {
      console.log(`  - ${lang.name} (${lang.file_extension})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixLanguageNames();
