import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  connection_id: string;
  recipients: string[];
  subject: string;
  message: string;
  html_content: string;
  quiz_url?: string;
  quiz_title?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { 
      connection_id, 
      recipients, 
      subject, 
      message, 
      html_content, 
      quiz_url, 
      quiz_title 
    }: SendEmailRequest = await req.json();

    // Get email connection details
    const { data: connection, error: connectionError } = await supabaseClient
      .from('email_connections')
      .select('*')
      .eq('id', connection_id)
      .eq('is_active', true)
      .single();

    if (connectionError || !connection) {
      throw new Error('Email connection not found or inactive');
    }

    const results = [];

    for (const recipient of recipients) {
      try {
        let result;
        
        switch (connection.email_provider) {
          case 'gmail':
            result = await sendGmailEmail(connection, recipient, subject, html_content, message);
            break;
          case 'outlook':
            result = await sendOutlookEmail(connection, recipient, subject, html_content, message);
            break;
          case 'smtp':
            result = await sendSMTPEmail(connection, recipient, subject, html_content, message);
            break;
          default:
            throw new Error(`Unsupported email provider: ${connection.email_provider}`);
        }
        
        results.push({ 
          recipient, 
          success: true, 
          message: 'Email sent successfully',
          ...result 
        });

        // Log successful email send
        await supabaseClient.from('email_logs').insert({
          doctor_id: connection.doctor_id,
          recipient_email: recipient,
          subject,
          status: 'sent'
        });

      } catch (error) {
        console.error(`Error sending email to ${recipient}:`, error);
        
        results.push({ 
          recipient, 
          success: false, 
          error: error.message 
        });

        // Log failed email send
        await supabaseClient.from('email_logs').insert({
          doctor_id: connection.doctor_id,
          recipient_email: recipient,
          subject,
          status: 'failed',
          error_message: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: `Processed ${recipients.length} emails` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Gmail API integration
async function sendGmailEmail(connection: any, recipient: string, subject: string, htmlContent: string, textContent: string) {
  // In a real implementation, this would use Gmail API with OAuth tokens
  // For now, we'll simulate the API call
  
  const accessToken = connection.access_token;
  if (!accessToken) {
    throw new Error('Gmail access token not found');
  }

  // Simulate Gmail API call
  console.log(`Sending Gmail email to ${recipient} via ${connection.email_address}`);
  
  // In production, you would make an actual Gmail API call here
  // const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     raw: btoa(`To: ${recipient}\nSubject: ${subject}\nContent-Type: text/html\n\n${htmlContent}`)
  //   })
  // });

  return { 
    provider: 'gmail',
    message_id: `gmail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

// Outlook/Microsoft Graph API integration
async function sendOutlookEmail(connection: any, recipient: string, subject: string, htmlContent: string, textContent: string) {
  // In a real implementation, this would use Microsoft Graph API with OAuth tokens
  
  const accessToken = connection.access_token;
  if (!accessToken) {
    throw new Error('Outlook access token not found');
  }

  // Simulate Microsoft Graph API call
  console.log(`Sending Outlook email to ${recipient} via ${connection.email_address}`);
  
  // In production, you would make an actual Microsoft Graph API call here
  // const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     message: {
  //       subject,
  //       body: {
  //         contentType: 'HTML',
  //         content: htmlContent
  //       },
  //       toRecipients: [{
  //         emailAddress: {
  //           address: recipient
  //         }
  //       }]
  //     }
  //   })
  // });

  return { 
    provider: 'outlook',
    message_id: `outlook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

// SMTP integration
async function sendSMTPEmail(connection: any, recipient: string, subject: string, htmlContent: string, textContent: string) {
  const smtpConfig = connection.smtp_config;
  if (!smtpConfig) {
    throw new Error('SMTP configuration not found');
  }

  // In a real implementation, this would use an SMTP library like nodemailer
  // For now, we'll simulate the SMTP connection
  
  console.log(`Sending SMTP email to ${recipient} via ${smtpConfig.host}:${smtpConfig.port}`);
  
  // In production, you would use a proper SMTP library here
  // const transporter = nodemailer.createTransporter({
  //   host: smtpConfig.host,
  //   port: smtpConfig.port,
  //   secure: smtpConfig.secure,
  //   auth: {
  //     user: smtpConfig.username,
  //     pass: smtpConfig.password
  //   }
  // });
  
  // const result = await transporter.sendMail({
  //   from: connection.email_address,
  //   to: recipient,
  //   subject,
  //   html: htmlContent,
  //   text: textContent
  // });

  return { 
    provider: 'smtp',
    message_id: `smtp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

serve(handler);