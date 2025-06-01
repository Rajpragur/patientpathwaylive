
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizGenerationRequest {
  baseQuizId?: string;
  customPrompt: string;
  quizTitle: string;
  quizDescription: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseQuizId, customPrompt, quizTitle, quizDescription }: QuizGenerationRequest = await req.json();

    const apiKey = "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";
    
    const systemPrompt = `You are a medical quiz generator. Generate a JSON object with questions based on the user's requirements. 
    ${baseQuizId ? "Modify the existing quiz structure but create new relevant questions." : "Create a completely new quiz."}
    
    Return ONLY a valid JSON object with this exact structure:
    {
      "questions": [
        {
          "id": "q1",
          "text": "Question text here",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
        }
      ],
      "maxScore": 100,
      "scoring": {
        "mild_threshold": 25,
        "moderate_threshold": 50,
        "severe_threshold": 75
      }
    }`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a medical assessment quiz: ${customPrompt}. Title: ${quizTitle}. Description: ${quizDescription}` }
        ],
        max_tokens: 2000,
      }),
    });

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices[0].message.content;
    
    // Parse the JSON response
    const quizData = JSON.parse(generatedContent);

    return new Response(JSON.stringify(quizData), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
