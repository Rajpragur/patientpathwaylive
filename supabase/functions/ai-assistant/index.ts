
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, messages } = await req.json();
    
    // Use OpenRouter API with the provided key
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const systemPrompt = `You are a helpful medical AI assistant specializing in patient education and guidance. 
    
    IMPORTANT DISCLAIMERS:
    - You are NOT a replacement for professional medical advice
    - Always encourage users to consult with healthcare professionals
    - Provide educational information, not diagnoses
    - Be empathetic and supportive
    
    Patient Context:
    - Quiz: ${context.quizTitle}
    - Score: ${context.score}/${context.maxScore}
    - Severity: ${context.severity}
    - Interpretation: ${context.interpretation}
    
    Provide helpful, accurate, and compassionate responses about their condition, symptoms, and next steps. 
    Always remind them that this is educational information and they should consult with a healthcare provider for proper diagnosis and treatment.`;

    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-4), // Include recent conversation context
      { role: 'user', content: message }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://pathway-lead-capture-bot.vercel.app',
        'X-Title': 'Medical Assessment AI Assistant'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Assistant error:', error);
    return new Response(JSON.stringify({ 
      error: 'Sorry, I encountered an error. Please try again.',
      response: 'I apologize, but I\'m having trouble connecting right now. Please consult with a healthcare professional for guidance on your assessment results.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
