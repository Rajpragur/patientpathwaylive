// src/lib/serverAIContentGenerator.ts
// This file runs on the server (e.g., in a Next.js API route, or a dedicated Node.js server)

import { PageContent, ScrapedData, DoctorProfile, Testimonial, TreatmentOption } from './contentGenerator'; // Import interfaces

// Fallback content generator - useful for server-side if AI fails
function createFallbackContent(doctor: DoctorProfile, colors: string[]): PageContent {
    return {
      headline: `Advanced Nasal Treatments with ${doctor.name}`,
      intro: "Discover if nasal airway obstruction is impacting your breathing and quality of life. Take our comprehensive quiz to learn about your treatment options.",
      whatIsNAO: "Nasal airway obstruction occurs when the nasal passages are blocked or narrowed, making it difficult to breathe through your nose. This condition can significantly impact sleep quality, exercise performance, and overall quality of life.",
      symptoms: [
        "Difficulty breathing through nose",
        "Frequent mouth breathing",
        "Snoring or sleep disruption",
        "Reduced sense of smell",
        "Chronic nasal congestion",
        "Facial pressure or pain",
        "Recurring sinus infections",
        "Poor sleep quality",
        "Daytime fatigue"
      ],
      treatments: "We offer a comprehensive range of treatment options, from minimally invasive in-office procedures to surgical solutions, tailored to your specific needs and severity of obstruction.",
      treatmentOptions: [
        {
          name: "VivAer Nasal Airway Remodeling",
          pros: "Minimally invasive, performed in office, quick recovery, no external incisions",
          cons: "May require multiple sessions, not suitable for all types of obstruction",
          invasiveness: "Low - radiofrequency treatment with minimal discomfort"
        },
        {
          name: "Latera Nasal Implant",
          pros: "Supports lateral nasal wall, bioabsorbable, minimally invasive procedure",
          cons: "Limited to lateral wall collapse, permanent implant",
          invasiveness: "Low - simple implant placement procedure"
        },
        {
          name: "Septoplasty",
          pros: "Addresses deviated septum, long-lasting results, covered by insurance",
          cons: "Requires anesthesia, longer recovery period, surgical risks",
          invasiveness: "Moderate - surgical procedure requiring anesthesia"
        }
      ],
      vivAerOverview: "VivAer is a revolutionary minimally invasive treatment that uses low-temperature radiofrequency energy to remodel nasal airway tissue, providing long-lasting relief from nasal obstruction without surgery.",
      lateraOverview: "Latera is an FDA-approved bioabsorbable nasal implant designed to support the lateral nasal wall and reduce nasal obstruction caused by lateral wall collapse during inspiration.",
      surgicalProcedures: "For severe cases, surgical options including septoplasty, turbinate reduction, and functional rhinoplasty may be recommended to provide comprehensive correction of structural abnormalities.",
      whyChoose: `${doctor.name} brings extensive expertise in nasal and sinus disorders, offering the latest minimally invasive treatments alongside traditional surgical options to provide personalized care for optimal breathing improvement.`,
      testimonials: [
        {
          text: "After years of poor sleep and breathing issues, the VivAer procedure completely changed my life. I can finally breathe clearly through my nose!",
          author: "Jennifer K.",
          location: doctor.locations[0]?.city || "Local Patient"
        },
        {
          text: "Dr. Smith explained all my options clearly and the Latera procedure was quick and effective. Highly recommend for anyone struggling with nasal breathing.",
          author: "Michael R.",
          location: doctor.locations[0]?.city || "Local Patient"
        }
      ],
      contact: `Schedule your consultation with ${doctor.name} today. Call ${doctor.locations[0]?.phone || 'our office'} or visit our convenient locations in ${doctor.locations.map(l => l.city).join(' and ')}.`,
      cta: "Take our quick 2-minute quiz to discover if you're a candidate for advanced nasal airway treatments and start breathing better today!",
      colors: {
        primary: colors[0] || '#2563eb',
        secondary: colors[1] || '#1e40af',
        accent: colors[2] || '#3b82f6'
      }
    };
  }

export async function generatePageContent(doctor: DoctorProfile, scrapedData: ScrapedData): Promise<PageContent> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Access securely from server env

  if (!OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is not set in server environment variables.');
    throw new Error('AI service not configured.');
  }

  const prompt = `
You are a medical copywriter specializing in nasal airway obstruction treatments. Create comprehensive landing page content using the following information:

DOCTOR INFORMATION:
- Name: ${doctor.name}
- Credentials: ${doctor.credentials}
- Locations: ${doctor.locations.map(l => `${l.city}: ${l.address} (${l.phone})`).join('; ')}
- Website: ${doctor.website}
- Existing Testimonials: ${doctor.testimonials.map(t => `"${t.text}" - ${t.author}, ${t.location}`).join('; ')}

SCRAPED WEBSITE CONTENT (if available):
${scrapedData.content || 'No specific content scraped from website.'}

WEBSITE COLORS FOUND (if available, use these for the 'colors' object in JSON):
${scrapedData.colors.join(', ') || 'No specific colors found, use professional blues.'}

INSTRUCTIONS:
Create content that blends the scraped website information with optimal medical copywriting. The content should feel authentic to the doctor's practice while being educational and conversion-focused.
If website content is available, use it as a primary source, adapting its tone and specifics. If not, generate high-quality, general medical content for a NOSE landing page.

Return ONLY a valid JSON object with this exact structure. Ensure all fields are populated with meaningful content. Do not leave any fields blank or as placeholder text.

{
  "headline": "Single compelling headline string (e.g., Breath Easy Again)",
  "intro": "Single introductory paragraph string, engaging and problem-solution focused",
  "whatIsNAO": "Single explanatory paragraph about nasal airway obstruction, its definition and impact",
  "symptoms": [
    "Symptom 1 relevant to NAO, specific and impactful",
    "Symptom 2 relevant to NAO",
    "Symptom 3 relevant to NAO",
    "Symptom 4 relevant to NAO",
    "Symptom 5 relevant to NAO",
    "Symptom 6 relevant to NAO",
    "Symptom 7 relevant to NAO",
    "Symptom 8 relevant to NAO",
    "Symptom 9 relevant to NAO"
  ],
  "treatments": "Single paragraph introducing the range of treatment options offered by the practice",
  "treatmentOptions": [
    {
      "name": "VivAer Nasal Airway Remodeling",
      "pros": "Benefits and advantages of VivAer (e.g., minimally invasive, quick recovery)",
      "cons": "Limitations or considerations for VivAer (e.g., may require multiple sessions)",
      "invasiveness": "Level of invasiveness description for VivAer (e.g., Low - radiofrequency treatment)"
    },
    {
      "name": "Latera Nasal Implant",
      "pros": "Benefits and advantages of Latera (e.g., supports nasal wall, bioabsorbable)",
      "cons": "Limitations or considerations for Latera (e.g., limited to lateral wall collapse)",
      "invasiveness": "Level of invasiveness description for Latera (e.g., Low - simple implant placement)"
    },
    {
      "name": "Septoplasty",
      "pros": "Benefits and advantages of Septoplasty (e.g., addresses deviated septum, long-lasting)",
      "cons": "Limitations or considerations for Septoplasty (e.g., requires anesthesia, longer recovery)",
      "invasiveness": "Level of invasiveness description for Septoplasty (e.g., Moderate - surgical procedure)"
    }
  ],
  "vivAerOverview": "Single detailed paragraph about the VivAer procedure, its mechanism and patient experience",
  "lateraOverview": "Single detailed paragraph about the Latera procedure, its mechanism and patient experience",
  "surgicalProcedures": "Single paragraph about surgical options available for more severe cases, including types and benefits",
  "whyChoose": "Single paragraph explaining the unique selling points of this doctor/practice, leveraging credentials and patient-centric approach",
  "testimonials": [
    {
      "text": "Compelling patient testimonial text",
      "author": "Patient's first name and initial (e.g., Sarah P.)",
      "location": "Patient's city/area (e.g., Fort Worth)"
    },
    {
      "text": "Another compelling patient testimonial text",
      "author": "Patient's first name and initial",
      "location": "Patient's city/area"
    }
  ],
  "contact": "Clear call to action for scheduling a consultation, including phone and website/location info",
  "cta": "Short, punchy call to action for taking the quiz/assessment",
  "colors": {
    "primary": "${scrapedData.colors[0] || '#2563eb'}", // Use scraped primary or default
    "secondary": "${scrapedData.colors[1] || '#1e40af'}", // Use scraped secondary or default
    "accent": "${scrapedData.colors[2] || '#3b82f6'}" // Use scraped accent or default
  }
}

REQUIREMENTS:
- Populate all fields.
- Include exactly 9 distinct symptoms in the symptoms array.
- Include AT LEAST 3 treatment options (VivAer, Latera, Septoplasty are essential). You can add more if relevant and scraped data suggests. Each must have name, pros, cons, and invasiveness.
- Ensure 2 testimonials are provided, using existing ones from doctor profile if good, or generating new realistic ones based on common patient experiences.
- Blend the scraped content naturally with medical best practices, maintaining a professional and empathetic tone.
- Ensure all JSON values are properly escaped strings.
- Make content specific to nasal airway obstruction and related treatments, avoiding generic medical prose.
- Prioritize content from the scraped website where it's directly relevant and high quality.
`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`, // Securely use API key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free', // Or another suitable model
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" } // Request JSON output directly
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.choices?.[0]?.message?.content) {
        console.error('OpenRouter API error:', data);
        throw new Error(data.error?.message || 'No content received from AI.');
    }

    let content = data.choices[0].message.content;
    content = content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, ''); // Clean markdown if present

    try {
      const parsedContent = JSON.parse(content);

      // Robust validation and default application on the server-side
      const validatedContent: PageContent = {
        headline: parsedContent.headline || createFallbackContent(doctor, scrapedData.colors).headline,
        intro: parsedContent.intro || createFallbackContent(doctor, scrapedData.colors).intro,
        whatIsNAO: parsedContent.whatIsNAO || createFallbackContent(doctor, scrapedData.colors).whatIsNAO,
        symptoms: Array.isArray(parsedContent.symptoms) && parsedContent.symptoms.length >= 9
          ? parsedContent.symptoms.slice(0, 9)
          : createFallbackContent(doctor, scrapedData.colors).symptoms,
        treatments: parsedContent.treatments || createFallbackContent(doctor, scrapedData.colors).treatments,
        treatmentOptions: Array.isArray(parsedContent.treatmentOptions) && parsedContent.treatmentOptions.length >= 3
          ? parsedContent.treatmentOptions.map((option: any) => ({
              name: option?.name || 'Treatment Option',
              pros: option?.pros || 'Benefits available',
              cons: option?.cons || 'Some limitations may apply',
              invasiveness: option?.invasiveness || 'Varies by procedure'
            }))
          : createFallbackContent(doctor, scrapedData.colors).treatmentOptions,
        vivAerOverview: parsedContent.vivAerOverview || createFallbackContent(doctor, scrapedData.colors).vivAerOverview,
        lateraOverview: parsedContent.lateraOverview || createFallbackContent(doctor, scrapedData.colors).lateraOverview,
        surgicalProcedures: parsedContent.surgicalProcedures || createFallbackContent(doctor, scrapedData.colors).surgicalProcedures,
        whyChoose: parsedContent.whyChoose || createFallbackContent(doctor, scrapedData.colors).whyChoose,
        testimonials: Array.isArray(parsedContent.testimonials) && parsedContent.testimonials.length >= 2
          ? parsedContent.testimonials.map((t: any) => ({
              text: t?.text || 'Great experience.',
              author: t?.author || 'Patient',
              location: t?.location || 'Local'
            }))
          : createFallbackContent(doctor, scrapedData.colors).testimonials,
        contact: parsedContent.contact || createFallbackContent(doctor, scrapedData.colors).contact,
        cta: parsedContent.cta || createFallbackContent(doctor, scrapedData.colors).cta,
        colors: {
          primary: parsedContent.colors?.primary || scrapedData.colors[0] || '#2563eb',
          secondary: parsedContent.colors?.secondary || scrapedData.colors[1] || '#1e40af',
          accent: parsedContent.colors?.accent || scrapedData.colors[2] || '#3b82f6'
        }
      };

      return validatedContent;

    } catch (parseError) {
      console.error('Server-side JSON parsing failed:', parseError);
      return createFallbackContent(doctor, scrapedData.colors); // Fallback on parsing failure
    }

  } catch (error) {
    console.error('Server-side AI content generation failed:', error);
    return createFallbackContent(doctor, scrapedData.colors); // Fallback on API call failure
  }
}