# Email Automation Setup Guide

This guide explains how to set up and configure email automation for your Patient Pathway application using n8n and Supabase Edge Functions.

## 🚀 Overview

The email automation system automatically sends emails when users submit leads through quizzes. It supports:

- **Welcome emails** to patients after quiz completion
- **Doctor notifications** when new leads are submitted
- **Follow-up emails** to patients after 24 hours
- **Reminder emails** for patients who haven't been contacted

## 🏗️ Architecture

```
Quiz Completion → Lead Submission → Supabase Edge Function → n8n Workflow → Email Service
```

## 📋 Prerequisites

1. **Supabase Project** with Edge Functions enabled
2. **n8n Instance** (self-hosted or cloud)
3. **Email Service** (Resend, SendGrid, Mailgun, etc.)
4. **Domain** for sending emails

## 🔧 Setup Steps

### 1. Configure Environment Variables

Add these to your `.env` file:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Email Service (Resend recommended)
RESEND_API_KEY=your_resend_api_key

# n8n Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/lead-email-automation
N8N_API_KEY=your_n8n_api_key

# Email Configuration
EMAIL_FROM=noreply@yourdomain.com
EMAIL_REPLY_TO=support@yourdomain.com
```

### 2. Deploy Supabase Edge Functions

Deploy the email automation functions:

```bash
# Navigate to your Supabase project
cd supabase

# Deploy the functions
supabase functions deploy send-email
supabase functions deploy lead-webhook
```

### 3. Set Up n8n Workflow

1. **Import the workflow**: Use the `email-automation-enhanced.json` file
2. **Configure webhook**: Set the webhook URL to match your Supabase function
3. **Set environment variables**: Configure Supabase and email service credentials
4. **Test the workflow**: Send a test webhook to verify functionality

### 4. Configure Email Service

#### Option A: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Add your domain for sending emails
3. Get your API key
4. Update environment variables

#### Option B: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your sender domain
3. Get your API key
4. Update the email function to use SendGrid

#### Option C: SMTP

1. Configure your SMTP server details
2. Update the email function to use SMTP
3. Test email delivery

### 5. Database Setup

Ensure you have these tables in your Supabase database:

```sql
-- Lead communications tracking
CREATE TABLE IF NOT EXISTS lead_communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES quiz_leads(id),
  communication_type TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor profiles (if not already exists)
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  clinic_name TEXT,
  location TEXT,
  twilio_account_sid TEXT,
  twilio_auth_token TEXT,
  twilio_phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 How It Works

### 1. Quiz Completion Flow

1. User completes quiz in `EmbeddedChatBot`
2. Lead data is submitted to `submit-lead` function
3. Function triggers `lead-webhook` function
4. Webhook sends data to n8n workflow
5. n8n processes emails and sends them via email service

### 2. Email Types

#### Welcome Email
- **Trigger**: Immediately after lead submission
- **Recipient**: Patient (lead email)
- **Content**: Quiz results, next steps, contact information

#### Doctor Notification
- **Trigger**: Immediately after lead submission
- **Recipient**: Doctor's email
- **Content**: Patient details, assessment results, action items

#### Follow-up Email
- **Trigger**: 24 hours after lead submission
- **Recipient**: Patient
- **Content**: Reminder about follow-up call

#### Reminder Email
- **Trigger**: 3 days after lead submission
- **Recipient**: Patient
- **Content**: Gentle reminder to contact clinic

### 3. n8n Workflow Nodes

1. **Webhook Trigger**: Receives lead data
2. **Process Data**: Extracts and formats information
3. **Conditional Checks**: Determines which emails to send
4. **Email Sending**: Calls Supabase email function
5. **Logging**: Records all communication attempts
6. **Database**: Saves communication history

## ⚙️ Configuration

### Email Templates

Customize email content in `src/lib/emailTemplates.ts`:

```typescript
// Modify template functions
export function generateWelcomeEmail(data: EmailTemplateData) {
  // Customize HTML and text content
}
```

### Automation Settings

Adjust timing and behavior in `src/lib/emailConfig.ts`:

```typescript
export const defaultEmailConfig: EmailAutomationConfig = {
  templates: {
    welcome: {
      enabled: true,
      delayMinutes: 5, // Change delay as needed
    },
    // ... other settings
  }
};
```

### n8n Workflow Customization

1. **Add delays**: Use "Wait" nodes for timed emails
2. **Conditional logic**: Add more decision nodes
3. **Additional services**: Integrate with CRM, SMS, etc.
4. **Error handling**: Add retry logic and fallbacks

## 🧪 Testing

### 1. Test Lead Submission

1. Complete a quiz in your application
2. Check Supabase logs for function execution
3. Verify n8n workflow is triggered
4. Check email delivery

### 2. Test Email Templates

1. Use the email template functions directly
2. Preview HTML output
3. Test with different data scenarios

### 3. Test n8n Workflow

1. Send test webhook data
2. Verify all nodes execute correctly
3. Check email service logs
4. Validate database records

## 🚨 Troubleshooting

### Common Issues

#### Emails Not Sending

1. **Check API keys**: Verify email service credentials
2. **Domain verification**: Ensure sending domain is verified
3. **Rate limits**: Check email service quotas
4. **n8n logs**: Review workflow execution logs

#### n8n Not Triggered

1. **Webhook URL**: Verify webhook endpoint
2. **Function deployment**: Ensure edge functions are deployed
3. **CORS**: Check CORS configuration
4. **Authentication**: Verify API keys

#### Template Issues

1. **Syntax errors**: Check template function syntax
2. **Data mapping**: Verify data structure
3. **HTML rendering**: Test email client compatibility

### Debug Steps

1. **Enable logging**: Set log levels in Supabase
2. **Check function logs**: Review edge function execution
3. **Monitor n8n**: Watch workflow execution in real-time
4. **Test endpoints**: Use tools like Postman to test functions

## 📈 Monitoring & Analytics

### 1. Communication Tracking

Monitor email performance in the `lead_communications` table:

```sql
-- Email success rates
SELECT 
  communication_type,
  status,
  COUNT(*) as count
FROM lead_communications 
GROUP BY communication_type, status;

-- Daily email volume
SELECT 
  DATE(created_at) as date,
  COUNT(*) as emails_sent
FROM lead_communications 
WHERE status = 'sent'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 2. n8n Metrics

- Workflow execution times
- Success/failure rates
- Node performance
- Error patterns

### 3. Email Service Analytics

- Delivery rates
- Open rates
- Click rates
- Bounce rates

## 🔒 Security Considerations

1. **API Keys**: Store securely, rotate regularly
2. **Domain Verification**: Only send from verified domains
3. **Rate Limiting**: Implement email sending limits
4. **Data Privacy**: Ensure GDPR/CCPA compliance
5. **Unsubscribe**: Include unsubscribe links in emails

## 🚀 Advanced Features

### 1. A/B Testing

Test different email templates and timing:

```typescript
// Randomize template selection
const templates = [templateA, templateB];
const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
```

### 2. Personalization

Use patient data for dynamic content:

```typescript
// Include patient-specific information
const personalizedContent = content.replace('{patientName}', lead.name);
```

### 3. Multi-language Support

Add language detection and localization:

```typescript
// Detect language and use appropriate template
const language = detectLanguage(lead.email);
const template = getLocalizedTemplate(language);
```

### 4. Integration with CRM

Connect with your existing systems:

```typescript
// Send lead data to CRM
await sendToCRM({
  lead: leadData,
  communication: emailResult
});
```

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Resend Email API](https://resend.com/docs)
- [Email Best Practices](https://www.emailonacid.com/blog/)

## 🤝 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Supabase and n8n logs
3. Test individual components
4. Consult the documentation links above

---

**Note**: This system is designed to be flexible and scalable. Start with basic functionality and gradually add advanced features as needed.
