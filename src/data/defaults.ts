import { PageContent } from '../types/content';

export const defaultPageContent: PageContent = {
  headline: "Advanced Nasal Treatment Solutions",
  intro: "Discover personalized solutions for nasal breathing difficulties.",
  whatIsNAO: "Nasal airway obstruction (NAO) occurs when the nasal passages are blocked or narrowed, making it difficult to breathe through your nose.",
  symptoms: [
    "Difficulty breathing through nose",
    "Mouth breathing",
    "Sleep disruption",
    "Snoring",
    "Nasal congestion",
    "Reduced exercise tolerance",
    "Daytime fatigue",
    "Reduced sense of smell",
    "Sinus pressure"
  ],
  treatments: "We offer comprehensive treatment options ranging from minimally invasive procedures to advanced surgical solutions.",
  treatmentOptions: [
    {
      name: "VivAer Treatment",
      pros: "Minimally invasive, no incisions, quick recovery",
      cons: "May not be suitable for severe cases",
      invasiveness: "Low"
    },
    {
      name: "LATERA Implant",
      pros: "Supports lateral wall, minimally invasive",
      cons: "Not suitable for all types of collapse",
      invasiveness: "Low"
    },
    {
      name: "Septoplasty",
      pros: "Permanent solution for deviated septum",
      cons: "Requires surgery and recovery time",
      invasiveness: "Moderate"
    }
  ],
  vivAerOverview: "VivAer is a non-invasive treatment that uses temperature-controlled radiofrequency energy to reshape nasal tissue and improve airflow.",
  lateraOverview: "LATERA is an absorbable nasal implant that supports lateral cartilage, reducing nasal valve collapse and improving breathing.",
  surgicalProcedures: "For cases requiring structural correction, we offer advanced surgical solutions including septoplasty and turbinate reduction.",
  whyChoose: "Our experienced team uses the latest technologies and personalized treatment plans for optimal breathing improvement.",
  testimonials: [
    {
      text: "The treatment was quick and effective. I can breathe so much better now!",
      author: "Sarah M.",
      location: "Local Patient"
    },
    {
      text: "Life-changing results with minimal downtime. Highly recommend!",
      author: "James R.",
      location: "Local Patient"
    }
  ],
  contact: "Schedule your consultation today to breathe better tomorrow.",
  cta: "Take our quick assessment to find out if you're a candidate for advanced nasal treatments.",
  colors: {
    primary: "#0E7C9D",
    secondary: "#1e40af",
    accent: "#FD904B"
  }
};