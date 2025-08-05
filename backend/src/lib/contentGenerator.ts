// src/lib/contentGenerator.ts
// This file defines interfaces and the client-side function to call your backend API for content generation.

export interface DoctorProfile {
  id: string;
  name: string;
  credentials: string;
  locations: { city: string; address: string; phone: string }[];
  testimonials: { text: string; author: string; location: string }[];
  website: string;
  avatar_url?: string;
}

export interface TreatmentOption {
  name: string;
  pros: string;
  cons: string;
  invasiveness: string;
}

export interface Testimonial {
  text: string;
  author: string;
  location: string;
}

export interface PageContent {
  headline: string;
  intro: string;
  whatIsNAO: string;
  symptoms: string[];
  treatments: string;
  treatmentOptions: TreatmentOption[];
  vivAerOverview: string;
  lateraOverview: string;
  surgicalProcedures: string;
  whyChoose: string;
  testimonials: Testimonial[];
  contact: string;
  cta: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/**
 * Fetches generated landing page content from the backend API.
 * This function is a client-side API client and does NOT perform scraping or AI generation directly.
 */
export async function fetchGeneratedPageContent(
  doctorId: string,
  userId: string,
  doctorWebsite: string,
  doctorProfile: DoctorProfile
): Promise<PageContent> {
  try {
    // Update the API endpoint to match your server configuration
    const response = await fetch('http://localhost:3000/api/generate-nose-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        doctorId, 
        userId, 
        doctorWebsite,
        doctorProfile 
      }),
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data) {
      throw new Error('No data received from API');
    }

    return data as PageContent;
  } catch (error) {
    console.error('Error fetching generated content from backend:', error);
    // Return default content on error
    return {
      ...defaultPageContent,
      headline: `Advanced Nasal Treatment with ${doctorProfile.name}`,
      intro: `Welcome to ${doctorProfile.name}'s specialized nasal treatment center.`
    };
  }
}