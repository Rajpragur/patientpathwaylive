import { DoctorProfile } from '@/types/doctor';
import { PageContent } from '@/types/content';
import { defaultPageContent } from '@/data/defaults';

// Add environment variable validation
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Add type guard for API response
interface APIResponse {
  success: boolean;
  data?: PageContent;
  error?: string;
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

    // Add URL validation
    let websiteUrl = doctorWebsite;
    if (websiteUrl && !websiteUrl.startsWith('http')) {
      websiteUrl = `https://${websiteUrl}`;
    }

    const response = await fetch(`${API_URL}/api/generate-nose-content`, {
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
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

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
      symptoms: Array.isArray(data.symptoms) ? data.symptoms : defaultPageContent.symptoms,
      treatmentOptions: Array.isArray(data.treatmentOptions) ? data.treatmentOptions : defaultPageContent.treatmentOptions,
      testimonials: Array.isArray(data.testimonials) ? data.testimonials : defaultPageContent.testimonials
    };
  } catch (error: any) {
    console.error('❌ Content generation error:', error.message);
    console.groupEnd();
    return {
      ...defaultPageContent,
      headline: `Advanced Nasal Treatment with ${doctorProfile.name}`,
      intro: `Welcome to ${doctorProfile.name}'s specialized nasal treatment center.`
    };
  }
}