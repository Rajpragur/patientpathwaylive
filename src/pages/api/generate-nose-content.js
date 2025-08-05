// Example: src/pages/api/generate-nose-content.js (for a Next.js-like setup)
// Make sure to configure your environment variables for Supabase and OpenRouter API keys securely.
import { supabase } from '../../integrations/supabase/server'; // Assuming a server-side Supabase client
import { scrapeWebsiteData } from '../../lib/serverScraper'; // Your new server-side scraper
import { generatePageContent } from '../../lib/serverAIContentGenerator'; // Your new server-side AI logic

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { doctorId, userId, doctorWebsite, doctorProfile } = req.body;

  if (!doctorId || !userId || !doctorWebsite || !doctorProfile) {
    return res.status(400).json({ message: 'Missing required parameters.' });
  }

  try {
    const scrapedData = await scrapeWebsiteData(doctorWebsite);
    console.log('Scraped data:', scrapedData);
    const generatedContent = await generatePageContent(doctorProfile, scrapedData);

    const { error: insertError } = await supabase
      .from('ai_landing_pages')
      .upsert(
        [
          {
            user_id: userId,
            doctor_id: doctorId,
            content: generatedContent,
            chatbot_colors: generatedContent.colors
              ? {
                  primary: generatedContent.colors.primary,
                  background: '#ffffff',
                  text: '#ffffff',
                  userBubble: generatedContent.colors.primary,
                  botBubble: '#f1f5f9',
                  userText: '#ffffff',
                  botText: '#334155',
                }
              : { primary: '#2563eb', background: '#ffffff', text: '#ffffff', userBubble: '#2563eb', botBubble: '#f1f5f9', userText: '#ffffff', botText: '#334155' }, // Default chatbot colors
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'user_id,doctor_id' }
      );

    if (insertError) {
      console.error('Error saving generated content to Supabase from backend:', insertError);
      // Proceed, but log the error (you might choose to return an error to frontend here)
    }

    res.status(200).json({ content: generatedContent });
  } catch (error) {
    console.error('Backend content generation error:', error);
    res.status(500).json({ message: 'Failed to generate landing page content.', error: error.message });
  }
}