// worker.js (This is the code you'd put in your Cloudflare Worker)

// Event listener for incoming requests to the Worker
export default {
  async fetch(request, env) {
    // Access the securely stored API key from the Worker's environment variables
    // 'env' object contains variables defined in Cloudflare Worker settings
    const GEMINI_API_KEY = env.GEMINI_API_KEY;

    // Ensure the request method is POST (as required by Gemini API)
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Define the Gemini API endpoint
    // We are using gemini-2.0-flash here, adjust if you use a different model
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
      // Read the request body from your frontend (which contains the LLM prompt and history)
      const requestBody = await request.json();

      // Make the actual call to the Gemini API
      const geminiResponse = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody), // Forward the body from your frontend request
      });

      // Parse the response from Gemini
      const geminiResult = await geminiResponse.json();

      // Return Gemini's response directly to your frontend
      return new Response(JSON.stringify(geminiResult), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // IMPORTANT: Set CORS headers if your frontend is on a different domain/subdomain
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        status: geminiResponse.status,
      });

    } catch (error) {
      console.error('Error in Cloudflare Worker:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch from Gemini API' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
