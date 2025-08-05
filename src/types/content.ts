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