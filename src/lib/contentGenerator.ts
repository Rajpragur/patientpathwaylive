import { DoctorProfile } from '@/types/doctor';
import { PageContent } from '@/types/content';
import { defaultPageContent } from '../data/defaults';

// Add environment variable validation
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Add type guard for API response
interface APIResponse {
  success: boolean;
  data?: PageContent;
  error?: string;
}

// Add type guard function
function isValidPageContent(content: any): content is PageContent {
  return (
    content &&
    typeof content.headline === 'string' &&
    typeof content.intro === 'string' &&
    Array.isArray(content.symptoms) &&
    Array.isArray(content.treatmentOptions) &&
    Array.isArray(content.testimonials) &&
    content.colors &&
    typeof content.colors.primary === 'string'
  );
}

// Add retry logic
async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function fetchGeneratedPageContent(
  doctorId: string,
  userId: string,
  doctorWebsite: string,
  doctorProfile: DoctorProfile
): Promise<PageContent> {
  try {
    console.group('🌐 Content Generation');
    console.log('Doctor:', doctorProfile.name);
    console.log('Website:', doctorWebsite);

    // Validate inputs
    if (!doctorId || !userId || !doctorProfile) {
      throw new Error('Missing required parameters');
    }

    // Add URL validation
    let websiteUrl = doctorWebsite;
    if (websiteUrl && !websiteUrl.startsWith('http')) {
      websiteUrl = `https://${websiteUrl}`;
    }

    const response = await fetchWithRetry(
      `${API_URL}/api/generate-nose-content`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          userId,
          doctorWebsite: websiteUrl,
          doctorProfile
        }),
      }
    );

    let apiResponse: APIResponse;
    try {
      apiResponse = await response.json();
    } catch (e) {
      console.error('JSON Parse Error:', e);
      throw new Error('Invalid JSON response from server');
    }

    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error || 'No content received from server');
    }

    const data = apiResponse.data;
    
    // Validate response data
    if (!isValidPageContent(data)) {
      throw new Error('Invalid content structure received from server');
    }

    console.log('✅ Content generated successfully');
    console.groupEnd();
    
    // Validate and merge content with defaults
    return {
      ...defaultPageContent,
      ...data,
      headline: data.headline || `Advanced Nasal Treatment with ${doctorProfile.name}`,
      intro: data.intro || `Welcome to ${doctorProfile.name}'s specialized nasal treatment center.`,
      colors: {
        primary: data.colors?.primary || defaultPageContent.colors.primary,
        secondary: data.colors?.secondary || defaultPageContent.colors.secondary,
        accent: data.colors?.accent || defaultPageContent.colors.accent
      },
      symptoms: Array.isArray(data.symptoms) && data.symptoms.length > 0 
        ? data.symptoms 
        : defaultPageContent.symptoms,
      treatmentOptions: Array.isArray(data.treatmentOptions) && data.treatmentOptions.length > 0 
        ? data.treatmentOptions 
        : defaultPageContent.treatmentOptions,
      testimonials: Array.isArray(data.testimonials) && data.testimonials.length > 0 
        ? data.testimonials 
        : defaultPageContent.testimonials,
      contact: data.contact || defaultPageContent.contact,
      cta: data.cta || defaultPageContent.cta,
      whatIsNAO: data.whatIsNAO || defaultPageContent.whatIsNAO,
      vivAerOverview: data.vivAerOverview || defaultPageContent.vivAerOverview,
      lateraOverview: data.lateraOverview || defaultPageContent.lateraOverview,
      surgicalProcedures: data.surgicalProcedures || defaultPageContent.surgicalProcedures,
      whyChoose: data.whyChoose || defaultPageContent.whyChoose
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