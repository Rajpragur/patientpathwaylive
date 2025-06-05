
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

    const systemPrompt = `You are a compassionate and knowledgeable medical AI assistant helping patients understand their health assessment results.

IMPORTANT GUIDELINES:
- You are NOT a replacement for professional medical advice
- Always encourage users to consult with healthcare professionals for proper diagnosis and treatment
- Provide educational information, not medical diagnoses
- Be empathetic, supportive, and reassuring
- Use emojis and friendly formatting to make responses more engaging
- Keep responses concise but informative

PATIENT ASSESSMENT CONTEXT:
- Assessment: ${context.quizTitle}
- Score: ${context.score}/${context.maxScore}
- Severity Level: ${context.severity}
- Medical Interpretation: ${context.interpretation}

Your role is to:
1. Help patients understand their results in simple terms
2. Provide general health education related to their condition
3. Suggest lifestyle modifications that might help
4. Explain what they can expect during medical consultations
5. Offer emotional support and reassurance
6. Answer questions about symptoms and general health topics

Always remind patients that this is educational information and they should consult with their healthcare provider for personalized medical advice.`;

    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6), // Include recent conversation context
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
        max_tokens: 800,
        top_p: 0.9
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
      response: '🤖 I apologize, but I\'m having trouble connecting right now. Our medical team will be reaching out to you soon. In the meantime, if you have urgent concerns, please consult with a healthcare professional directly.\n\n💙 Take care, and don\'t hesitate to try asking me again!'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
