# n8n Integration Guide for Lead Automation

## Overview
This guide shows you how to integrate n8n with your Patient Pathway Live system to create powerful, flexible automation workflows for lead generation, SMS, and email communications.

## Why n8n?

**Advantages over hardcoded automation:**
- 🎯 **Visual Workflow Builder** - Drag & drop interface, no coding required
- 🔄 **Conditional Logic** - Send different messages based on quiz scores, lead sources, etc.
- 📊 **Multiple Integrations** - Connect to 200+ services (Twilio, SendGrid, Slack, CRM systems)
- 📈 **Scalability** - Handle thousands of leads without performance issues
- 🎨 **Customization** - Easy to modify workflows without redeploying code
- 📱 **Multi-channel** - SMS, email, social media, webhooks all in one place
- 🔒 **Security** - Self-hosted option for sensitive medical data

## Setup Steps

### 1. Install n8n

**Option A: Self-hosted (Recommended for medical data)**
```bash
# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Using npm
npm install n8n -g
n8n start
```

**Option B: Cloud-hosted**
- Sign up at [n8n.cloud](https://n8n.cloud)
- Get your instance URL and API keys

### 2. Configure Your Webhook

Your webhook URL will be:
```
https://drvitjhhggcywuepyncx.supabase.co/functions/v1/lead-webhook
```

### 3. Import the Workflow

1. Open n8n in your browser (usually `http://localhost:5678`)
2. Go to **Workflows** → **Import from File**
3. Upload the `lead-automation.json` file
4. Activate the workflow

## Workflow Components

### 🔗 Webhook Trigger
- **URL**: Your Supabase function endpoint
- **Method**: POST
- **Authentication**: None (handled by Supabase)

### 📊 Data Processing
- Extracts lead information from webhook
- Sets workflow variables for easy access
- Determines communication preferences

### 📱 SMS Automation
- **Twilio Integration**: Sends welcome SMS to leads
- **Doctor Notifications**: Alerts doctors about new leads
- **Conditional Logic**: Only sends if phone numbers exist

### 📧 Email Automation
- **SendGrid Integration**: Professional email templates
- **Personalized Content**: Quiz results, doctor information
- **Branding**: Clinic name, logo, contact details

### 🎯 Conditional Logic
- **Score-based Messaging**: Different content for high/low scores
- **Source Tracking**: Customize based on UTM parameters
- **Doctor Preferences**: Respect communication settings

## Advanced Workflow Examples

### 1. Score-Based Follow-up
```javascript
// In n8n Code node
const score = $vars.get('quizScore');
let followUpMessage = '';

if (score >= 8) {
  followUpMessage = 'Your symptoms are severe. We recommend immediate consultation.';
} else if (score >= 5) {
  followUpMessage = 'Your symptoms are moderate. Let\'s schedule a consultation.';
} else {
  followUpMessage = 'Your symptoms are mild. We\'ll follow up in a week.';
}

$vars.set('followUpMessage', followUpMessage);
```

### 2. Multi-channel Communication
```javascript
// Send to multiple platforms
const platforms = ['sms', 'email', 'slack'];
const message = $vars.get('message');

for (const platform of platforms) {
  // Trigger different actions based on platform
  if (platform === 'slack') {
    // Send to Slack channel
  } else if (platform === 'sms') {
    // Send via Twilio
  }
}
```

### 3. CRM Integration
```javascript
// Create contact in CRM
const crmData = {
  name: $vars.get('leadName'),
  email: $vars.get('leadEmail'),
  phone: $vars.get('leadPhone'),
  source: 'quiz_assessment',
  score: $vars.get('quizScore'),
  status: 'new_lead'
};

// Send to HubSpot, Salesforce, etc.
```

## Integration Points

### SMS Services
- **Twilio** (already configured)
- **MessageBird**
- **Vonage**
- **AWS SNS**

### Email Services
- **SendGrid** (recommended)
- **Mailgun**
- **Resend**
- **AWS SES**

### CRM Systems
- **HubSpot**
- **Salesforce**
- **Pipedrive**
- **Zoho CRM**

### Communication Platforms
- **Slack** (team notifications)
- **Microsoft Teams**
- **Discord**
- **WhatsApp Business API**

## Environment Variables

Set these in your n8n instance:

```bash
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number

# SendGrid
SENDGRID_API_KEY=your_api_key

# Database
DATABASE_URL=your_postgres_connection_string

# Webhook Security
WEBHOOK_SECRET=your_secret_key
```

## Testing Your Workflow

### 1. Test Webhook
```bash
curl -X POST https://your-project.supabase.co/functions/v1/lead-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test@example.com",
    "phone": "+1234567890",
    "quiz_type": "TNSS",
    "doctor_id": "your_doctor_id",
    "score": 7
  }'
```

### 2. Monitor Execution
- Check n8n execution logs
- Verify database records
- Test SMS/email delivery

### 3. Debug Common Issues
- **Webhook not triggering**: Check URL and authentication
- **SMS failing**: Verify Twilio credentials
- **Email not sending**: Check SendGrid configuration

## Security Considerations

### Data Privacy
- **HIPAA Compliance**: Ensure all data handling meets medical privacy standards
- **Encryption**: Use HTTPS for all webhook communications
- **Access Control**: Limit n8n access to authorized personnel only

### Webhook Security
- **Authentication**: Implement webhook signatures
- **Rate Limiting**: Prevent abuse
- **IP Whitelisting**: Restrict to known sources

## Monitoring & Analytics

### 1. Execution Metrics
- **Success Rate**: Track successful vs failed communications
- **Response Time**: Monitor webhook processing speed
- **Error Rates**: Identify and fix common issues

### 2. Business Metrics
- **Lead Response Time**: How quickly leads receive communications
- **Engagement Rates**: SMS open rates, email click-through rates
- **Conversion Tracking**: Lead to appointment conversion

### 3. Alerting
- **Failed Communications**: Get notified when SMS/email fails
- **High Volume**: Alert when lead volume exceeds normal levels
- **System Health**: Monitor n8n instance performance

## Scaling Your Automation

### 1. High Volume Handling
- **Queue Management**: Use n8n queues for high-traffic periods
- **Rate Limiting**: Respect API limits for SMS/email services
- **Load Balancing**: Distribute webhooks across multiple n8n instances

### 2. Multi-location Support
- **Location-based Routing**: Send leads to appropriate doctors
- **Time Zone Handling**: Schedule communications based on patient location
- **Local Compliance**: Respect regional communication laws

### 3. Advanced Segmentation
- **Quiz Type**: Different workflows for TNSS, SNOT-22, etc.
- **Lead Source**: Customize based on social media, website, referrals
- **Patient Demographics**: Age, location, previous interactions

## Troubleshooting

### Common Issues

**Webhook not receiving data**
- Check Supabase function logs
- Verify webhook URL in n8n
- Test with Postman or curl

**SMS not sending**
- Verify Twilio credentials
- Check phone number format
- Review Twilio logs

**Email delivery issues**
- Check SendGrid API key
- Verify sender email address
- Review spam folder

**Database connection errors**
- Check connection string
- Verify database permissions
- Test connection manually

### Getting Help

1. **n8n Documentation**: [docs.n8n.io](https://docs.n8n.io)
2. **Community Forum**: [community.n8n.io](https://community.n8n.io)
3. **GitHub Issues**: [github.com/n8n-io/n8n](https://github.com/n8n-io/n8n)

## Next Steps

1. **Deploy the webhook function** to Supabase
2. **Set up n8n instance** (self-hosted or cloud)
3. **Import the workflow** and customize for your needs
4. **Test with sample data** to ensure everything works
5. **Monitor and optimize** based on real usage

## Benefits of This Approach

✅ **Flexibility**: Easy to modify workflows without code changes  
✅ **Reliability**: Built-in error handling and retry logic  
✅ **Scalability**: Handle thousands of leads efficiently  
✅ **Integration**: Connect to any service via webhooks  
✅ **Monitoring**: Built-in execution tracking and logging  
✅ **Cost-effective**: No per-message fees, just infrastructure costs  

This n8n integration gives you enterprise-grade automation capabilities while maintaining the flexibility to adapt to your specific business needs.
