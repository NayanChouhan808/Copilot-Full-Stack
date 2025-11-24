// Script to list available Generative models for your API key
// Usage: NODE_ENV=production node scripts/list_gemini_models.js

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Please set GEMINI_API_KEY in the environment before running this script.');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

(async () => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    }

    const json = await res.json();
    if (!json.models) {
      console.log('No models field in response:', JSON.stringify(json, null, 2));
      return;
    }

    console.log('Available models:');
    for (const m of json.models) {
      console.log(`- ${m.name}`);
      if (m.supportedMethods) console.log(`  supportedMethods: ${m.supportedMethods.join(', ')}`);
      if (m.description) console.log(`  description: ${m.description}`);
      console.log('');
    }
  } catch (err) {
    console.error('Error fetching models:', err);
    process.exit(1);
  }
})();