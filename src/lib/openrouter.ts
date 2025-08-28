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

// Comprehensive fallback content in case AI generation fails
const getFallbackContent = (doctor: DoctorProfile) => ({
  headline: "Struggling to Breathe Through Your Nose? You're Not Alone.",
  intro: "Take our quick NOSE assessment to discover if nasal airway obstruction is affecting your quality of life and learn about proven treatment options available right here in your area.",
  whatIsNAO: "Nasal Airway Obstruction (NAO) occurs when something blocks or limits airflow through your nasal passages. This chronic condition affects millions of people and can significantly impact sleep quality, exercise performance, and overall well-being. NAO can be caused by structural issues like a deviated septum, enlarged turbinates, or nasal valve collapse.",
  symptoms: [
    "Chronic nasal congestion that doesn't improve with decongestants",
    "Difficulty breathing through your nose during exercise",
    "Frequent mouth breathing, especially at night",
    "Snoring or sleep disruption",
    "Reduced sense of smell or taste",
    "Chronic fatigue from poor sleep quality",
    "Frequent sinus infections or pressure",
    "Difficulty concentrating due to poor sleep"
  ],
  treatments: "At our practice, we offer a comprehensive range of treatment options tailored to your specific needs and severity of nasal obstruction. Our approach ranges from conservative medical management to advanced minimally invasive procedures, ensuring you receive the most appropriate care for your condition.",
  treatmentOptions: [
    "Conservative Medical Management: Nasal sprays, antihistamines, and lifestyle modifications to reduce inflammation and improve breathing",
    "VivAer Nasal Airway Remodeling: Revolutionary radiofrequency treatment that gently reshapes nasal tissues in-office with minimal downtime",
    "Latera Nasal Implant: Bioabsorbable implant that supports weak nasal cartilage to improve airflow permanently",
    "Balloon Sinuplasty: Minimally invasive procedure to open blocked sinus passages and improve drainage",
    "Septoplasty: Surgical correction of deviated nasal septum to restore proper airflow",
    "Turbinate Reduction: Surgical reduction of enlarged turbinates to create more breathing space"
  ],
  comparisonTable: [
    ["Medical Management", "Non-invasive, reversible, insurance covered", "Temporary relief, ongoing medication needed", "None"],
    ["VivAer Treatment", "In-office procedure, quick recovery, long-lasting results", "Not covered by all insurance plans", "Minimal"],
    ["Latera Implant", "Permanent improvement, bioabsorbable, quick procedure", "Newer technology, limited long-term data", "Minimal"],
    ["Balloon Sinuplasty", "Minimally invasive, preserves anatomy, quick recovery", "Limited to sinus-related obstruction", "Low"],
    ["Septoplasty", "Permanent correction, insurance covered, proven results", "Surgical recovery time, potential complications", "Moderate"],
    ["Turbinate Surgery", "Significant improvement, permanent results", "Longer recovery, risk of over-reduction", "Moderate"]
  ],
  vivAerOverview: "VivAer is a breakthrough treatment that uses low-temperature radiofrequency energy to gently remodel the tissues inside your nose that are causing obstruction. Performed right in our office under local anesthesia, this 15-minute procedure can provide lasting improvement in nasal breathing. Most patients return to normal activities the same day with minimal discomfort and see continued improvement over the following weeks.",
  lateraOverview: "The Latera nasal implant is designed to support the upper and lower lateral cartilages responsible for nasal valve collapse - a major cause of nasal breathing difficulties. This small, bioabsorbable implant is placed during a simple in-office procedure and provides structural support to keep your nasal valve open. The implant gradually dissolves over 18-24 months while your body maintains the improved nasal structure.",
  surgicalProcedures: "For more severe cases of nasal obstruction, traditional surgical procedures may be necessary. Septoplasty corrects a deviated nasal septum, while turbinate reduction addresses enlarged nasal turbinates. These outpatient procedures are performed under general anesthesia and typically require 1-2 weeks of recovery time. Our surgeons use the latest techniques to minimize discomfort and optimize results while preserving important nasal functions.",
  whyChoose: [
    "Board-certified ENT specialists with extensive experience in nasal airway disorders",
    "Comprehensive diagnostic evaluation using advanced imaging and airflow testing",
    "Full spectrum of treatment options from conservative to advanced surgical techniques",
    "State-of-the-art in-office procedures like VivAer and Latera available",
    "Personalized treatment plans tailored to your specific anatomy and lifestyle",
    "Proven track record of successful outcomes and satisfied patients",
    "Convenient locations with flexible scheduling options",
    "Insurance coordination and financing options available"
  ],
  testimonials: [
    {
      text: "After years of struggling with nasal congestion, the VivAer procedure was life-changing. I can finally breathe freely through my nose and my sleep quality has improved dramatically.",
      author: "Sarah M.",
      location: "Fort Worth"
    },
    {
      text: "Dr. Smith and the team were incredible. The Latera implant procedure was quick and virtually painless. Three months later, my nasal breathing is better than it's been in decades.",
      author: "Michael R.",
      location: "Southlake"
    }
  ],
  contact: `Ready to breathe better? Contact ${doctor.name} at one of our convenient locations: ${doctor.locations.map(l => `${l.city} office at ${l.address}, phone ${l.phone}`).join(' or ')}.`,
  cta: "Don't let nasal breathing problems affect your quality of life any longer. Take our quick NOSE assessment to see if you're a candidate for life-changing nasal airway treatment. The quiz takes just 2 minutes and could be the first step toward breathing freely again."
});

// Global rate limiting to prevent multiple simultaneous requests
let isGenerating = false;
let lastGenerationTime = 0;
const MIN_INTERVAL = 5000; // 5 seconds between requests

export async function generatePageContent(doctor: DoctorProfile, retryCount: number = 0) {
  // Rate limiting: prevent multiple simultaneous requests
  if (isGenerating) {
    console.log('Content generation already in progress, using fallback content');
    return getFallbackContent(doctor);
  }

  const now = Date.now();
  if (now - lastGenerationTime < MIN_INTERVAL) {
    console.log('Rate limit: too soon since last generation, using fallback content');
    return getFallbackContent(doctor);
  }

  isGenerating = true;
  lastGenerationTime = now;

    // Enhanced prompt with better structure and specific medical requirements
    const prompt = `You are an expert medical copywriter specializing in ENT (Ear, Nose, Throat) conditions. Write comprehensive, medically accurate, and engaging content for a nasal airway obstruction landing page.

Doctor Information:
- Name: ${doctor.name}
- Credentials: ${doctor.credentials}
- Practice Locations: ${doctor.locations.map(l => `${l.city}: ${l.address}, ${l.phone}`).join(' | ')}
- Website: ${doctor.website}

REQUIREMENTS:
1. Content must be medically accurate and educational
2. Use engaging, patient-friendly language (avoid excessive medical jargon)
3. Focus on patient benefits and quality of life improvements
4. Include specific details about procedures and treatments
5. Make content comprehensive but readable

CONTENT STRUCTURE NEEDED:

**headline**: Compelling headline addressing nasal breathing struggles (40-60 characters)

**intro**: Patient-focused introduction explaining the NOSE quiz purpose (100-150 words)

**whatIsNAO**: Comprehensive explanation of Nasal Airway Obstruction - what it is, causes, prevalence (150-200 words)

**symptoms**: Array of 8-10 specific symptoms patients experience with NAO

**treatments**: Overview paragraph about the practice's comprehensive approach (100-120 words)

**treatmentOptions**: Array of 6 detailed treatment options from conservative to surgical, each 30-40 words

**comparisonTable**: 2D array comparing treatments. Format: [["Treatment Name", "Pros", "Cons", "Invasiveness Level"], ...] for 6 treatments

**vivAerOverview**: Detailed explanation of VivAer procedure - what it is, how it works, benefits, recovery (120-150 words)

**lateraOverview**: Detailed explanation of Latera implant - what it is, how it works, benefits, duration (120-150 words)

**surgicalProcedures**: Overview of traditional surgical options like septoplasty and turbinate reduction (100-130 words)

**whyChoose**: Array of 8 compelling reasons to choose this practice, each 15-25 words

**testimonials**: Array of 2 realistic patient testimonials with structure: {"text": "testimonial quote", "author": "First Name L.", "location": "City"}

**contact**: Professional contact information paragraph incorporating doctor details (50-70 words)

**cta**: Compelling call-to-action encouraging quiz completion (60-80 words)

Return ONLY a valid JSON object with these exact keys. Ensure all content is substantial, specific, and medically accurate. Do not include any text outside the JSON structure.`;

    try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-8b-instruct:free', // Better model for structured content
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 12000, // Increased token limit for comprehensive content
        temperature: 0.7, // Balanced creativity and accuracy
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, response.statusText);
      
      // Handle rate limiting with exponential backoff
      if (response.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s (longer delays)
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return generatePageContent(doctor, retryCount + 1);
      }
      
      return getFallbackContent(doctor);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response structure:', data);
      return getFallbackContent(doctor);
    }

    let content = data.choices[0].message.content;
    
    if (!content) {
      console.error('Empty content from API');
      return getFallbackContent(doctor);
    }

    // Clean the content - remove markdown code blocks if present
    content = content.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    
    try {
      const parsedContent = JSON.parse(content);
      
      // Validate that all required fields are present and not empty
      const requiredFields = [
        'headline', 'intro', 'whatIsNAO', 'symptoms', 'treatments', 
        'treatmentOptions', 'comparisonTable', 'vivAerOverview', 
        'lateraOverview', 'surgicalProcedures', 'whyChoose', 
        'testimonials', 'contact', 'cta'
      ];
      
      const isValid = requiredFields.every(field => {
        const value = parsedContent[field];
        if (Array.isArray(value)) {
          return value.length > 0 && value.every(item => 
            typeof item === 'string' ? item.trim().length > 0 : 
            typeof item === 'object' && item !== null
          );
        }
        return typeof value === 'string' && value.trim().length > 0;
      });
      
      if (!isValid) {
        console.warn('Generated content failed validation, using fallback');
        return getFallbackContent(doctor);
      }
      
      // Merge with fallback to ensure no fields are missing
      const fallback = getFallbackContent(doctor);
      const merged = { ...fallback, ...parsedContent };
      
      // Ensure arrays have minimum required items
      if (!Array.isArray(merged.symptoms) || merged.symptoms.length < 6) {
        merged.symptoms = fallback.symptoms;
      }
      if (!Array.isArray(merged.treatmentOptions) || merged.treatmentOptions.length < 4) {
        merged.treatmentOptions = fallback.treatmentOptions;
      }
      if (!Array.isArray(merged.whyChoose) || merged.whyChoose.length < 6) {
        merged.whyChoose = fallback.whyChoose;
      }
      if (!Array.isArray(merged.testimonials) || merged.testimonials.length < 2) {
        merged.testimonials = fallback.testimonials;
      }
      if (!Array.isArray(merged.comparisonTable) || merged.comparisonTable.length < 4) {
        merged.comparisonTable = fallback.comparisonTable;
      }
      
      return merged;
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Raw content:', content);
      
      // Try to extract JSON from a larger text response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedContent = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted JSON from response');
          return { ...getFallbackContent(doctor), ...extractedContent };
        } catch (extractError) {
          console.error('Failed to parse extracted JSON:', extractError);
        }
      }
      
      return getFallbackContent(doctor);
    }
    
  } catch (error) {
    console.error('Error generating AI content:', error);
    return getFallbackContent(doctor);
  } finally {
    isGenerating = false;
  }
}