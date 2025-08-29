export interface EmailAutomationConfig {
  // Email service configuration
  emailService: 'resend' | 'sendgrid' | 'mailgun' | 'smtp';
  
  // Default sender information
  defaultFrom: string;
  defaultReplyTo?: string;
  
  // Email templates
  templates: {
    welcome: {
      enabled: boolean;
      delayMinutes: number; // Delay before sending welcome email
      subject: string;
    };
    doctorNotification: {
      enabled: boolean;
      delayMinutes: number;
      subject: string;
    };
    followUp: {
      enabled: boolean;
      delayHours: number; // Delay before sending follow-up
      subject: string;
    };
    reminder: {
      enabled: boolean;
      delayDays: number; // Delay before sending reminder
      subject: string;
    };
  };
  
  // n8n integration
  n8n: {
    enabled: boolean;
    webhookUrl?: string;
    apiKey?: string;
  };
  
  // Fallback email sending (when n8n is not available)
  fallbackEmail: {
    enabled: boolean;
    maxRetries: number;
    retryDelayMinutes: number;
  };
  
  // Email content customization
  branding: {
    clinicName: string;
    clinicLogo?: string;
    primaryColor: string;
    secondaryColor: string;
    footerText: string;
    privacyPolicyUrl?: string;
    unsubscribeUrl?: string;
  };
  
  // Communication preferences
  communicationPreferences: {
    allowSMS: boolean;
    allowEmail: boolean;
    allowPhone: boolean;
    timezone: string;
    businessHours: {
      start: string; // Format: "09:00"
      end: string;   // Format: "17:00"
      days: number[]; // 0 = Sunday, 1 = Monday, etc.
    };
  };
}

// Helper function to get environment variables safely
function getEnvVar(key: string): string | undefined {
  if (typeof window !== 'undefined') {
    // Browser environment - try to get from window object or return undefined
    return (window as any)[`REACT_APP_${key}`] || undefined;
  }
  // Node.js environment
  return process.env[key];
}

// Default configuration
export const defaultEmailConfig: EmailAutomationConfig = {
  emailService: 'resend',
  
  defaultFrom: 'noreply@patientpathway.com',
  defaultReplyTo: 'support@patientpathway.com',
  
  templates: {
    welcome: {
      enabled: true,
      delayMinutes: 5, // Send welcome email 5 minutes after lead submission
      subject: 'Your Assessment Results - {clinicName}'
    },
    doctorNotification: {
      enabled: true,
      delayMinutes: 1, // Send doctor notification immediately
      subject: '🚨 New Lead: {leadName} - {quizType} Assessment'
    },
    followUp: {
      enabled: true,
      delayHours: 24, // Send follow-up after 24 hours
      subject: 'Follow-up: Your {quizType} Assessment'
    },
    reminder: {
      enabled: true,
      delayDays: 3, // Send reminder after 3 days
      subject: 'Reminder: Follow-up on Your Assessment'
    }
  },
  
  n8n: {
    enabled: true,
    webhookUrl: getEnvVar('N8N_WEBHOOK_URL') || '',
    apiKey: getEnvVar('N8N_API_KEY') || ''
  },
  
  fallbackEmail: {
    enabled: true,
    maxRetries: 3,
    retryDelayMinutes: 15
  },
  
  branding: {
    clinicName: 'Medical Practice',
    primaryColor: '#2563eb',
    secondaryColor: '#059669',
    footerText: 'Thank you for choosing our practice. We are committed to providing you with the best care possible.',
    privacyPolicyUrl: '/privacy-policy',
    unsubscribeUrl: '/unsubscribe'
  },
  
  communicationPreferences: {
    allowSMS: true,
    allowEmail: true,
    allowPhone: true,
    timezone: 'America/New_York',
    businessHours: {
      start: '09:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5] // Monday to Friday
    }
  }
};

// Environment-specific configuration
export function getEmailConfig(): EmailAutomationConfig {
  const env = getEnvVar('NODE_ENV') || 'development';
  
  if (env === 'production') {
    return {
      ...defaultEmailConfig,
      emailService: 'resend',
      n8n: {
        ...defaultEmailConfig.n8n,
        enabled: true
      },
      fallbackEmail: {
        ...defaultEmailConfig.fallbackEmail,
        enabled: false // Disable fallback in production when n8n is available
      }
    };
  }
  
  if (env === 'development') {
    return {
      ...defaultEmailConfig,
      emailService: 'resend',
      n8n: {
        ...defaultEmailConfig.n8n,
        enabled: false // Disable n8n in development for testing
      },
      fallbackEmail: {
        ...defaultEmailConfig.fallbackEmail,
        enabled: true
      }
    };
  }
  
  return defaultEmailConfig;
}

// Helper functions for configuration
export function isEmailAutomationEnabled(): boolean {
  const config = getEmailConfig();
  return config.n8n.enabled || config.fallbackEmail.enabled;
}

export function shouldSendWelcomeEmail(): boolean {
  const config = getEmailConfig();
  return config.templates.welcome.enabled;
}

export function shouldNotifyDoctor(): boolean {
  const config = getEmailConfig();
  return config.templates.doctorNotification.enabled;
}

export function shouldSendFollowUp(): boolean {
  const config = getEmailConfig();
  return config.templates.followUp.enabled;
}

export function getWelcomeEmailDelay(): number {
  const config = getEmailConfig();
  return config.templates.welcome.delayMinutes;
}

export function getDoctorNotificationDelay(): number {
  const config = getEmailConfig();
  return config.templates.doctorNotification.delayMinutes;
}

export function getFollowUpDelay(): number {
  const config = getEmailConfig();
  return config.templates.followUp.delayHours;
}

export function getClinicName(): string {
  const config = getEmailConfig();
  return config.branding.clinicName;
}

export function getPrimaryColor(): string {
  const config = getEmailConfig();
  return config.branding.primaryColor;
}

export function isBusinessHours(): boolean {
  const config = getEmailConfig();
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();
  
  const startHour = parseInt(config.communicationPreferences.businessHours.start.split(':')[0]);
  const endHour = parseInt(config.communicationPreferences.businessHours.end.split(':')[0]);
  
  return (
    config.communicationPreferences.businessHours.days.includes(currentDay) &&
    currentHour >= startHour &&
    currentHour < endHour
  );
}
