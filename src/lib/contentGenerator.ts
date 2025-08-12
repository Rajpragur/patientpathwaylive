import { DoctorProfile } from '@/types/doctor';
import { PageContent } from '@/types/content';
import { defaultPageContent } from '../data/defaults';

export async function fetchGeneratedPageContent(
  doctorId: string,
  userId: string,
  doctorWebsite: string,
  doctorProfile: DoctorProfile
): Promise<PageContent> {
  try {
    console.group('🌐 Content Generation via OpenRouter');
    console.log('Doctor:', doctorProfile.name);
    console.log('Website:', doctorWebsite);

    if (!doctorId || !userId || !doctorProfile) {
      throw new Error('Missing required parameters');
    }

    let websiteUrl = doctorWebsite;
    if (websiteUrl && !websiteUrl.startsWith('http')) {
      websiteUrl = `https://${websiteUrl}`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openai/gpt-3.5-turbo",
        "messages": [
          { "role": "system", "content": "You are a helpful assistant that generates website content for doctors." },
          { "role": "user", "content": `Generate website content for Dr. ${doctorProfile.name}, whose website is ${websiteUrl}. The content should be in JSON format and include a headline, intro, a list of symptoms, treatment options, testimonials, and color theme.` }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    if (!content) {
      throw new Error("No content generated from OpenRouter");
    }

    const parsedContent = JSON.parse(content) as PageContent;

    console.log('✅ Content generated successfully');
    console.groupEnd();

    return {
      ...defaultPageContent,
      ...parsedContent,
    };
  } catch (error: any) {
    console.error('❌ Content generation error:', error.message);
    console.groupEnd();
    return {
      ...defaultPageContent,
      headline: `Advanced Nasal Treatment with ${doctorProfile.name}`,
      intro: `Welcome to ${doctorProfile.name}'s specialized nasal treatment center.`,
      whyChoose: `Choose ${doctorProfile.name} for expert care in nasal treatments.`
    };
  }
}