// functions/api/gemini.js (Place this code inside your 'gemini.js' file)

export async function onRequest(context) {
  // Pages Functions provide 'request' and 'env' via the 'context' object
  const { request, env } = context; 

  // Access the securely stored API key from the Pages project's environment variables
  // (NOT from a separate standalone Worker's secrets)
  const GEMINI_API_KEY = env.GEMINI_API_KEY; 

  // Ensure the request method is POST (as required by Gemini API)
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Define the Gemini API endpoint
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
        // IMPORTANT: Adjust 'Access-Control-Allow-Origin' to your specific frontend domain(s)
        // For development, '*' works, but for production, use 'https://yourdomain.com'
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      status: geminiResponse.status,
    });

  } catch (error) {
    console.error('Error in Cloudflare Pages Function:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch from Gemini API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Handler for CORS preflight (OPTIONS) requests
// Browsers send an OPTIONS request before a cross-origin POST request
export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204, // No Content
    headers: {
      'Access-Control-Allow-Origin': '*', // IMPORTANT: Adjust for your domain
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    },
  });
}
