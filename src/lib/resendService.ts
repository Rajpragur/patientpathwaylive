import { Resend } from 'resend';

// Helper function to get environment variables safely
function getResendApiKey(): string | undefined {
  if (typeof window !== 'undefined') {
    // Browser environment
    return (window as any).VITE_RESEND_API_KEY || 
           (window as any).RESEND_API_KEY || 
           import.meta.env?.VITE_RESEND_API_KEY;
  }
  // Node.js environment
  return process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
}

// Initialize Resend with API key
const resend = new Resend(getResendApiKey());

export interface ResendEmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface ResendEmailResult {
  success: boolean;
  id?: string;
  message: string;
  error?: string;
}

export class ResendService {
  private defaultFrom: string;
  private defaultReplyTo: string;
  private apiKey: string | undefined;

  constructor() {
    this.defaultFrom = 'noreply@resend.dev';
    this.defaultReplyTo = 'noreply@resend.dev';
    this.apiKey = getResendApiKey();
  }

  /**
   * Send email using Resend
   */
  async sendEmail(emailData: ResendEmailData): Promise<ResendEmailResult> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'Resend API key not configured',
        error: 'API key is required to send emails'
      };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: emailData.from || this.defaultFrom,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        replyTo: emailData.replyTo || this.defaultReplyTo,
        cc: emailData.cc,
        bcc: emailData.bcc,
        attachments: emailData.attachments,
      });

      if (error) {
        console.error('Resend error:', error);
        return {
          success: false,
          message: 'Failed to send email',
          error: error.message || 'Unknown error'
        };
      }

      return {
        success: true,
        id: data?.id,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Resend service error:', error);
      return {
        success: false,
        message: 'Email service error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send email from doctor's email address
   */
  async sendEmailFromDoctor(
    doctorEmail: string,
    doctorName: string,
    emailPrefix: string,
    emailData: Omit<ResendEmailData, 'from'>
  ): Promise<ResendEmailResult> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'Resend API key not configured',
        error: 'API key is required to send emails'
      };
    }

    try {
      // Use Resend's default domain with doctor's name in the from field
      const fromAddress = `${doctorName} <noreply@resend.dev>`;
      
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        replyTo: doctorEmail, // Use doctor's real email for replies
        cc: emailData.cc,
        bcc: emailData.bcc,
        attachments: emailData.attachments,
      });

      if (error) {
        console.error('Resend error:', error);
        return {
          success: false,
          message: 'Failed to send email from doctor',
          error: error.message || 'Unknown error'
        };
      }

      return {
        success: true,
        id: data?.id,
        message: 'Email sent successfully from doctor'
      };
    } catch (error) {
      console.error('Resend service error:', error);
      return {
        success: false,
        message: 'Email service error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send quiz results to patient
   */
  async sendQuizResults(
    patientEmail: string,
    doctorName: string,
    doctorEmail: string,
    emailPrefix: string,
    quizData: {
      patientName: string;
      quizType: string;
      score: number;
      results: string;
      recommendations: string;
    }
  ): Promise<ResendEmailResult> {
    const subject = `Your ${quizData.quizType} Assessment Results - ${doctorName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .score { background: #059669; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .recommendations { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Assessment Results</h1>
          <p>From: Dr. ${doctorName}</p>
        </div>
        
        <div class="content">
          <p>Dear ${quizData.patientName},</p>
          
          <p>Thank you for completing the ${quizData.quizType} assessment. Here are your results:</p>
          
          <div class="score">
            <h2>Your Score: ${quizData.score}/100</h2>
          </div>
          
          <h3>Assessment Summary:</h3>
          <p>${quizData.results}</p>
          
          <div class="recommendations">
            <h3>Recommendations:</h3>
            <p>${quizData.recommendations}</p>
          </div>
          
          <p>Please contact our office if you have any questions or would like to schedule a consultation.</p>
          
          <p>Best regards,<br>
          Dr. ${doctorName}</p>
        </div>
        
        <div class="footer">
          <p>This email was sent from PatientPathway AI - Your trusted healthcare assessment platform</p>
          <p>If you have any questions, please reply to this email or contact us directly.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Assessment Results from Dr. ${doctorName}

Dear ${quizData.patientName},

Thank you for completing the ${quizData.quizType} assessment. Here are your results:

Your Score: ${quizData.score}/100

Assessment Summary:
${quizData.results}

Recommendations:
${quizData.recommendations}

Please contact our office if you have any questions or would like to schedule a consultation.

Best regards,
Dr. ${doctorName}

---
This email was sent from PatientPathway AI - Your trusted healthcare assessment platform
    `;

    return this.sendEmailFromDoctor(doctorEmail, doctorName, emailPrefix, {
      to: patientEmail,
      subject,
      html,
      text
    });
  }

  /**
   * Send manual assessment sharing email
   */
  async sendManualAssessment(
    patientEmail: string,
    doctorName: string,
    doctorEmail: string,
    emailPrefix: string,
    assessmentData: {
      patientName: string;
      assessmentType: string;
      message: string;
      attachmentUrl?: string;
    }
  ): Promise<ResendEmailResult> {
    const subject = `Assessment Shared by Dr. ${doctorName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .message { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Assessment Shared</h1>
          <p>From: Dr. ${doctorName}</p>
        </div>
        
        <div class="content">
          <p>Dear ${assessmentData.patientName},</p>
          
          <p>Dr. ${doctorName} has shared a ${assessmentData.assessmentType} assessment with you.</p>
          
          <div class="message">
            <h3>Message from Dr. ${doctorName}:</h3>
            <p>${assessmentData.message}</p>
          </div>
          
          ${assessmentData.attachmentUrl ? `
          <p><strong>Attachment:</strong> <a href="${assessmentData.attachmentUrl}" target="_blank">View Assessment</a></p>
          ` : ''}
          
          <p>Please review the assessment and contact our office if you have any questions.</p>
          
          <p>Best regards,<br>
          Dr. ${doctorName}</p>
        </div>
        
        <div class="footer">
          <p>This email was sent from PatientPathway AI - Your trusted healthcare assessment platform</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Assessment Shared by Dr. ${doctorName}

Dear ${assessmentData.patientName},

Dr. ${doctorName} has shared a ${assessmentData.assessmentType} assessment with you.

Message from Dr. ${doctorName}:
${assessmentData.message}

${assessmentData.attachmentUrl ? `Attachment: ${assessmentData.attachmentUrl}` : ''}

Please review the assessment and contact our office if you have any questions.

Best regards,
Dr. ${doctorName}

---
This email was sent from PatientPathway AI - Your trusted healthcare assessment platform
    `;

    return this.sendEmailFromDoctor(doctorEmail, doctorName, emailPrefix, {
      to: patientEmail,
      subject,
      html,
      text
    });
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<ResendEmailResult> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'Resend API key not configured',
        error: 'API key is required to send test emails'
      };
    }

    try {
      const testEmail = typeof window !== 'undefined' 
        ? (window as any).TEST_EMAIL || 'test@example.com'
        : process.env.TEST_EMAIL || 'test@example.com';
      
      return this.sendEmail({
        to: testEmail,
        subject: 'Resend Configuration Test',
        html: '<p>This is a test email to verify Resend configuration.</p>',
        text: 'This is a test email to verify Resend configuration.'
      });
    } catch (error) {
      return {
        success: false,
        message: 'Test email failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const resendService = new ResendService();

// Export utility functions
export async function sendQuizResultsEmail(
  patientEmail: string,
  doctorName: string,
  doctorEmail: string,
  emailPrefix: string,
  quizData: {
    patientName: string;
    quizType: string;
    score: number;
    results: string;
    recommendations: string;
  }
): Promise<ResendEmailResult> {
  return resendService.sendQuizResults(patientEmail, doctorName, doctorEmail, emailPrefix, quizData);
}

export async function sendManualAssessmentEmail(
  patientEmail: string,
  doctorName: string,
  doctorEmail: string,
  emailPrefix: string,
  assessmentData: {
    patientName: string;
    assessmentType: string;
    message: string;
    attachmentUrl?: string;
  }
): Promise<ResendEmailResult> {
  return resendService.sendManualAssessment(patientEmail, doctorName, doctorEmail, emailPrefix, assessmentData);
}

export async function testResendConfiguration(): Promise<ResendEmailResult> {
  return resendService.testEmailConfiguration();
}
