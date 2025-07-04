// Utility to generate AI content for the NOSE landing page using OpenRouter
// WARNING: Do NOT expose your OpenRouter API key in production frontend code!
// For demo/dev only. In production, proxy this through your backend.

export interface DoctorProfile {
  id: string;
  name: string;
  credentials: string;
  locations: { city: string; address: string; phone: string }[];
  testimonials: { text: string; author: string; location: string }[];
  website: string;
  avatar_url?: string;
}

export async function generatePageContent(doctor: DoctorProfile) {
  const prompt = `
You are a medical copywriter. Write a full, friendly, educational, and persuasive landing page for a nasal airway obstruction quiz, using the following doctor details:

Doctor: ${doctor.name}, ${doctor.credentials}
Locations: ${doctor.locations.map(l => `${l.city}: ${l.address} (${l.phone})`).join('; ')}
Website: ${doctor.website}

Include:
- A headline and intro
- What is nasal airway obstruction?
- Symptoms & impact (as a list)
- Treatment options (VivAer, Latera, Septoplasty, etc.)
- A list of treatment options (from gentle to surgical)
- A comparison table (array of arrays: [Treatment, Pros, Cons, Invasiveness])
- VivAer overview
- Latera overview
- Surgical procedures
- Why choose this doctor/practice (as a list)
- Patient testimonials (invent 2 if not provided, as array of {text, author, location})
- Contact info (use doctor details)
- Call to action to take the quiz

Return a JSON object with keys: headline, intro, whatIsNAO, symptoms, treatments, treatmentOptions, comparisonTable, vivAerOverview, lateraOverview, surgicalProcedures, whyChoose, testimonials, contact, cta.
`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-small-3.2-24b-instruct:free', // or another free model
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
    }),
  });

  const data = await response.json();
  // Parse the JSON from the AI's response
  let content = data.choices?.[0]?.message?.content;
  try {
    return JSON.parse(content);
  } catch (e) {
    // Try to extract JSON substring if the model returned extra text
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      try {
        return JSON.parse(content.substring(jsonStart, jsonEnd + 1));
      } catch (e2) {
        // fall through
      }
    }
    // Fallback: return error and raw content for debugging
    return { error: 'Failed to parse AI response', raw: content };
  }
} 