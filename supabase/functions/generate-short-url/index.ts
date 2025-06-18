import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { longUrl } = await req.json();

    if (!longUrl) {
      throw new Error('Missing longUrl parameter');
    }

    // Call the ulvis.net API to shorten the URL
    const response = await fetch(`https://ulvis.net/api.php?url=${encodeURIComponent(longUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Ulvis API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.success) {
      throw new Error('Failed to generate short URL');
    }

    return new Response(
      JSON.stringify({
        success: true,
        shortUrl: data.data.url,
        message: 'Short URL generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to generate short URL'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});