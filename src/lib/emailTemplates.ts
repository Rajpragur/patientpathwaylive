export interface EmailTemplateData {
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  quizType: string;
  quizScore: number;
  maxScore: number;
  doctorName: string;
  clinicName: string;
  clinicPhone?: string;
  severity: string;
  submittedAt: string;
}

export function generateWelcomeEmail(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const severityColor = getSeverityColor(data.severity);
  
  const subject = `Your ${data.quizType} Assessment Results - ${data.clinicName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Assessment Results</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #f8fafc; }
        .header { background: #2563eb; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { background: white; padding: 30px 20px; }
        .score-box { background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; border: 2px solid #e2e8f0; }
        .score-number { font-size: 48px; font-weight: bold; color: #2563eb; margin: 10px 0; }
        .severity-badge { display: inline-block; padding: 10px 20px; border-radius: 25px; color: white; font-weight: bold; font-size: 14px; }
        .cta-button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
        .info-item { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; }
        .info-item h4 { margin: 0 0 10px 0; color: #1e293b; }
        .info-item p { margin: 0; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Assessment Complete!</h1>
          <p>Thank you for completing the ${data.quizType} assessment</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.leadName},</h2>
          
          <p>We've received your assessment results and are reviewing them carefully. Thank you for taking the time to complete this important health evaluation.</p>
          
          <div class="score-box">
            <h3>Your Assessment Score</h3>
            <div class="score-number">${data.quizScore}</div>
            <p style="margin: 5px 0; color: #64748b;">out of ${data.maxScore}</p>
            <div class="severity-badge" style="background: ${severityColor};">
              ${data.severity.toUpperCase()}
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <h4>📋 What happens next?</h4>
              <p>Dr. ${data.doctorName} will review your results within 24 hours</p>
            </div>
            <div class="info-item">
              <h4>📞 Follow-up call</h4>
              <p>You'll receive a call to discuss your results and next steps</p>
            </div>
          </div>
          
          <p><strong>Need immediate assistance?</strong></p>
          <p>If you have urgent questions or concerns, please don't hesitate to call us directly.</p>
          
          ${data.clinicPhone ? `<a href="tel:${data.clinicPhone}" class="cta-button">📞 Call Now</a>` : ''}
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 25px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Important:</strong> This assessment is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${data.leadEmail}</p>
          <p>© ${new Date().getFullYear()} ${data.clinicName}. All rights reserved.</p>
          <p style="margin-top: 15px; font-size: 12px;">
            <a href="#" style="color: #64748b;">Unsubscribe</a> | 
            <a href="#" style="color: #64748b;">Privacy Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Assessment Complete!

Hello ${data.leadName},

Thank you for completing the ${data.quizType} assessment. We've received your results and are reviewing them carefully.

Your Assessment Score: ${data.quizScore} out of ${data.maxScore}
Severity Level: ${data.severity.toUpperCase()}

What happens next:
- Dr. ${data.doctorName} will review your results within 24 hours
- You'll receive a follow-up call to discuss your results and next steps

Need immediate assistance? Please call us directly.

Important: This assessment is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.

Best regards,
The ${data.clinicName} Team

This email was sent to ${data.leadEmail}
© ${new Date().getFullYear()} ${data.clinicName}. All rights reserved.
  `;
  
  return { subject, html, text };
}

export function generateDoctorNotificationEmail(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const severityColor = getSeverityColor(data.severity);
  
  const subject = `🚨 New Lead: ${data.leadName} - ${data.quizType} Assessment`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Lead Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #f8fafc; }
        .header { background: #dc2626; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { background: white; padding: 30px 20px; }
        .lead-info { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px solid #e2e8f0; }
        .lead-info h3 { margin: 0 0 15px 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .info-label { font-weight: bold; color: #374151; }
        .info-value { color: #6b7280; }
        .severity-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; font-size: 12px; }
        .cta-button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .urgent-notice { background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .urgent-notice p { margin: 0; color: #991b1b; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 New Lead Alert</h1>
          <p>Patient assessment completed - Action Required</p>
        </div>
        
        <div class="content">
          <h2>New Patient Assessment</h2>
          
          <div class="urgent-notice">
            <p>⚠️ ACTION REQUIRED: Please contact this patient within 24 hours</p>
          </div>
          
          <div class="lead-info">
            <h3>📋 Patient Information</h3>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${data.leadName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Assessment:</span>
              <span class="info-value">${data.quizType}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Score:</span>
              <span class="info-value">${data.quizScore}/${data.maxScore}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Severity:</span>
              <span class="info-value">
                <span class="severity-badge" style="background: ${severityColor};">${data.severity.toUpperCase()}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Submitted:</span>
              <span class="info-value">${new Date(data.submittedAt).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="lead-info">
            <h3>📞 Contact Information</h3>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value"><a href="tel:${data.leadPhone}" style="color: #2563eb;">${data.leadPhone}</a></span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value"><a href="mailto:${data.leadEmail}" style="color: #2563eb;">${data.leadEmail}</a></span>
            </div>
            <div class="info-row">
              <span class="info-label">Source:</span>
              <span class="info-value">Website Assessment</span>
            </div>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Review the patient's assessment results</li>
            <li>Contact the patient within 24 hours</li>
            <li>Schedule a consultation if needed</li>
            <li>Update lead status in the system</li>
          </ul>
          
          <a href="tel:${data.leadPhone}" class="cta-button">📞 Call Patient Now</a>
        </div>
        
        <div class="footer">
          <p>This notification was automatically generated by the Patient Pathway system</p>
          <p>© ${new Date().getFullYear()} ${data.clinicName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
🚨 NEW LEAD ALERT - ACTION REQUIRED

New Patient Assessment

Patient Information:
- Name: ${data.leadName}
- Assessment: ${data.quizType}
- Score: ${data.quizScore}/${data.maxScore}
- Severity: ${data.severity.toUpperCase()}
- Submitted: ${new Date(data.submittedAt).toLocaleString()}

Contact Information:
- Phone: ${data.leadPhone}
- Email: ${data.leadEmail}
- Source: Website Assessment

⚠️ ACTION REQUIRED: Please contact this patient within 24 hours

Next Steps:
1. Review the patient's assessment results
2. Contact the patient within 24 hours
3. Schedule a consultation if needed
4. Update lead status in the system

Call Patient Now: ${data.leadPhone}

This notification was automatically generated by the Patient Pathway system
© ${new Date().getFullYear()} ${data.clinicName}. All rights reserved.
  `;
  
  return { subject, html, text };
}

export function generateFollowUpEmail(data: EmailTemplateData): { subject: string; html: string; text: string } {
  const subject = `Follow-up: Your ${data.quizType} Assessment`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Assessment Follow-up</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #f8fafc; }
        .header { background: #059669; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { background: white; padding: 30px 20px; }
        .reminder-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .reminder-box h3 { margin: 0 0 15px 0; color: #166534; }
        .cta-button { display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📞 Follow-up Reminder</h1>
          <p>Your ${data.quizType} Assessment</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.leadName},</h2>
          
          <p>We hope you're doing well. This is a friendly follow-up regarding your ${data.quizType} assessment that you completed recently.</p>
          
          <div class="reminder-box">
            <h3>📋 Assessment Summary</h3>
            <p><strong>Assessment:</strong> ${data.quizType}</p>
            <p><strong>Score:</strong> ${data.quizScore}/${data.maxScore}</p>
            <p><strong>Severity Level:</strong> ${data.severity.toUpperCase()}</p>
            <p><strong>Completed:</strong> ${new Date(data.submittedAt).toLocaleDateString()}</p>
          </div>
          
          <p><strong>What's Next?</strong></p>
          <p>If you haven't heard from us yet, please expect a call from Dr. ${data.doctorName} within the next 24 hours to discuss your results and next steps.</p>
          
          <p><strong>Have Questions?</strong></p>
          <p>If you have any immediate questions or concerns, please don't hesitate to reach out to us directly.</p>
          
          ${data.clinicPhone ? `<a href="tel:${data.clinicPhone}" class="cta-button">📞 Call Us Now</a>` : ''}
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            <strong>Note:</strong> This follow-up is part of our commitment to ensure you receive the care and attention you deserve. 
            If you've already been contacted, please disregard this message.
          </p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${data.leadEmail}</p>
          <p>© ${new Date().getFullYear()} ${data.clinicName}. All rights reserved.</p>
          <p style="margin-top: 15px; font-size: 12px;">
            <a href="#" style="color: #64748b;">Unsubscribe</a> | 
            <a href="#" style="color: #64748b;">Privacy Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Follow-up: Your ${data.quizType} Assessment

Hello ${data.leadName},

We hope you're doing well. This is a friendly follow-up regarding your ${data.quizType} assessment that you completed recently.

Assessment Summary:
- Assessment: ${data.quizType}
- Score: ${data.quizScore}/${data.maxScore}
- Severity Level: ${data.severity.toUpperCase()}
- Completed: ${new Date(data.submittedAt).toLocaleDateString()}

What's Next?
If you haven't heard from us yet, please expect a call from Dr. ${data.doctorName} within the next 24 hours to discuss your results and next steps.

Have Questions?
If you have any immediate questions or concerns, please don't hesitate to reach out to us directly.

${data.clinicPhone ? `Call Us Now: ${data.clinicPhone}` : ''}

Note: This follow-up is part of our commitment to ensure you receive the care and attention you deserve. If you've already been contacted, please disregard this message.

Best regards,
The ${data.clinicName} Team

This email was sent to ${data.leadEmail}
© ${new Date().getFullYear()} ${data.clinicName}. All rights reserved.
  `;
  
  return { subject, html, text };
}

function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'severe': return '#dc2626';
    case 'moderate': return '#ea580c';
    case 'mild': return '#ca8a04';
    default: return '#059669';
  }
}

export function getSeverityLevel(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 80) return 'severe';
  if (percentage >= 60) return 'moderate';
  if (percentage >= 40) return 'mild';
  return 'normal';
}
