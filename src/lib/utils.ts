import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a standardized doctor profile object for AI landing pages
 * Ensures all required fields are present with fallback values
 * Handles both 'location' (DoctorProfile type) and 'locations' (content structure) properties
 */
export function createDoctorProfileForLandingPage(doctor: any, doctorId?: string) {
  // Handle both location and locations properties for compatibility
  const locationData = doctor?.location || doctor?.locations || [{ city: 'Main Office', address: 'Please contact for address', phone: 'Please contact for phone' }];
  
  return {
    id: doctor?.id || doctorId || 'demo',
    name: doctor?.name || 'Dr. Smith',
    first_name: doctor?.first_name || 'Dr.',
    last_name: doctor?.last_name || 'Smith',
    credentials: doctor?.credentials || 'MD',
    location: locationData,
    locations: locationData, // Keep both for compatibility with existing content
    testimonials: doctor?.testimonials || [],
    website: doctor?.website || '#',
    phone: doctor?.phone || 'Contact for phone number',
    email: doctor?.email || 'Contact for email',
    clinic_name: doctor?.clinic_name || 'Medical Center',
    specialty: doctor?.specialty || 'General Practice',
    avatar_url: doctor?.avatar_url || '/src/assets/doctor.png'
  };
}

/**
 * Ensures content includes doctor profile information
 * Used when saving AI landing page content
 */
export function ensureContentWithDoctorProfile(content: any, doctor: any, doctorId?: string) {
  return {
    ...content,
    doctor_profile: createDoctorProfileForLandingPage(doctor, doctorId)
  };
}
