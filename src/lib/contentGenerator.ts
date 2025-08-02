// src/lib/contentGenerator.ts
// This file will contain interfaces and potentially the client-side API call to your backend.

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
  whyChoose: string; // This remains a single string based on your component's current usage.
  testimonials: Testimonial[];
  contact: string;
  cta: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Function to call your backend API for content generation
export async function fetchGeneratedPageContent(doctorId: string, userId: string, doctorWebsite: string): Promise<PageContent> {
  // In a real application, you'd call your backend API here
  // For demonstration, let's simulate a call to a backend endpoint
  try {
    const response = await fetch('/api/generate-nose-content', { // Your backend API endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include authentication headers if necessary, e.g., 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ doctorId, userId, doctorWebsite }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate content from backend.');
    }

    const data = await response.json();
    return data.content as PageContent; // Your backend should return the validated PageContent
  } catch (error) {
    console.error('Error fetching generated content from backend:', error);
    // You can either re-throw or return a default fallback here
    throw error; // Let the frontend handle the fallback
  }
}