import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationRequest {
  patientEmail: string;
  patientFirstName?: string;
  patientLastName?: string;
  message?: string;
  doctorId: string;
  invitationToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== send-invitation function started ===');
    
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey
    });

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }

    // Use service role key to bypass RLS for reading doctor profiles
    const supabaseClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Supabase client created successfully');

    const requestBody = await req.json();
    console.log('Request body received:', { 
      hasPatientEmail: !!requestBody.patientEmail,
      hasDoctorId: !!requestBody.doctorId,
      hasInvitationToken: !!requestBody.invitationToken
    });

    const { patientEmail, patientFirstName, patientLastName, message, doctorId, invitationToken }: InvitationRequest = requestBody;

    // Debug logging
    console.log('Received request body:', { patientEmail, patientFirstName, patientLastName, message, doctorId, invitationToken });
    console.log('Invitation token type:', typeof invitationToken);
    console.log('Invitation token value:', invitationToken);

    // Validate required fields
    if (!invitationToken) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invitation token is required'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Get doctor profile information
    console.log('Attempting to fetch doctor profile with ID:', doctorId);
    const { data: doctorProfile, error: doctorError } = await supabaseClient
      .from('doctor_profiles')
      .select('first_name, last_name, email, clinic_name, location, phone')
      .eq('id', doctorId)
      .single();

    console.log('Doctor profile query result:', { doctorProfile, doctorError });

    if (doctorError) {
      console.error('Doctor profile error:', doctorError);
      throw new Error(`Doctor profile error: ${doctorError.message} (Code: ${doctorError.code})`);
    }

    if (!doctorProfile) {
      throw new Error(`Doctor profile not found for ID: ${doctorId}`);
    }

    const doctorName = `${doctorProfile.first_name} ${doctorProfile.last_name}`;
    const clinicName = doctorProfile.clinic_name || 'Clinic';
    const clinicLocation = doctorProfile.location || '';
    const clinicPhone = doctorProfile.phone || '';
    const doctorEmail = doctorProfile.email;

    // Generate patient name for greeting
    const patientName = patientFirstName && patientLastName 
      ? `${patientFirstName} ${patientLastName}` 
      : patientFirstName || 'Valued Team Member';

    // Always construct the invitation link from the request origin
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://patientpathway.ai';
    const finalInvitationLink = `${origin}/team-signup?invitation=${invitationToken || 'INVALID'}`;
    console.log('Constructed invitation link:', finalInvitationLink);

    // Create invitation email content
    const subject = `Team Member Invitation from Dr. ${doctorName} - ${clinicName}`;
    
    const html = `
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #e5e7eb;">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img
            src="https://drvitjhhggcywuepyncx.supabase.co/storage/v1/object/public/logo/WhatsApp%20Image%202025-05-26%20at%2009.26.08.jpeg"
            alt="Patient Pathway Logo"
            style="max-width: 150px;"
          />
        </div>

        <!-- Header -->
        <h1 style="color: #1f2937; text-align: center; font-size: 24px; margin-bottom: 5px;">Patient Pathway</h1>
        <p style="color: #6b7280; text-align: center; font-size: 16px; margin-top: 0;">Team Member Invitation</p>

        <!-- Greeting -->
        <p style="color: #374151; font-size: 15px;">Hi ${patientName},</p>

        <!-- Body -->
        <p style="color: #374151; font-size: 15px; line-height: 1.5;">
          Dr. <strong>${doctorName}</strong> from <strong>${clinicName}</strong> has invited you to join our team as a clinic member. 
          You'll have access to our clinic portal to manage patient assessments and clinic operations.
        </p>

        ${clinicLocation || clinicPhone ? `
        <!-- Clinic Details -->
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 10px 0;">Clinic Information</h3>
          ${clinicLocation ? `<p style="color: #374151; font-size: 14px; margin: 5px 0;"><strong>Location:</strong> ${clinicLocation}</p>` : ''}
          ${clinicPhone ? `<p style="color: #374151; font-size: 14px; margin: 5px 0;"><strong>Phone:</strong> ${clinicPhone}</p>` : ''}
          <p style="color: #374151; font-size: 14px; margin: 5px 0;"><strong>Email:</strong> ${doctorEmail}</p>
        </div>
        ` : ''}

        ${message ? `
        <!-- Personal Message -->
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #92400e; font-size: 14px; margin: 0 0 8px 0;">Personal Message from Dr. ${doctorName}:</h3>
          <p style="color: #92400e; font-size: 14px; margin: 0; font-style: italic;">"${message}"</p>
        </div>
        ` : ''}

        <p style="color: #374151; font-size: 15px; line-height: 1.5;">
          As a team member, you'll be able to:
        </p>
        <ul style="color: #374151; font-size: 15px; line-height: 1.5; padding-left: 20px;">
          <li>Access the clinic dashboard and patient management tools</li>
          <li>View and manage patient assessments and results</li>
          <li>Collaborate with the medical team on patient care</li>
          <li>Access clinic resources and documentation</li>
        </ul>

        <!-- Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${finalInvitationLink}" 
             style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
             Accept Team Invitation
          </a>
        </div>

        <!-- Footer -->
        <p style="color: #6b7280; font-size: 14px; line-height: 1.4;">
          If you did not expect this invitation, you can safely ignore this email or contact Dr. ${doctorName} directly.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © 2025 Patient Pathway. All rights reserved.
        </p>
      </div>
    `;

    const text = `
Team Member Invitation from Dr. ${doctorName} - ${clinicName}

Hi ${patientName},

Dr. ${doctorName} from ${clinicName} has invited you to join our team as a clinic member. 
You'll have access to our clinic portal to manage patient assessments and clinic operations.

Clinic Information:
${clinicLocation ? `Location: ${clinicLocation}` : ''}
${clinicPhone ? `Phone: ${clinicPhone}` : ''}
Email: ${doctorEmail}

${message ? `Personal Message from Dr. ${doctorName}:\n"${message}"\n` : ''}

As a team member, you'll be able to:
- Access the clinic dashboard and patient management tools
- View and manage patient assessments and results
- Collaborate with the medical team on patient care
- Access clinic resources and documentation

Accept Team Invitation: ${finalInvitationLink}

If you did not expect this invitation, you can safely ignore this email or contact Dr. ${doctorName} directly.

---
© 2025 Patient Pathway. All rights reserved.
    `;

    // Prepare email data
    const emailData = {
      from: 'office@patientpathway.ai',
      to: patientEmail,
      subject,
      html,
      text,
      reply_to: doctorEmail,
    };

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      throw new Error(`Resend API error: ${resendResponse.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await resendResponse.json();

    // Log the invitation in the database
    await supabaseClient.from('email_logs').insert({
      doctor_id: doctorId,
      recipient_email: patientEmail,
      subject,
      status: 'sent',
      resend_id: result.id,
      sent_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      id: result.id,
      message: 'Team member invitation sent successfully'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("=== ERROR in send-invitation function ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Unknown error occurred',
      errorType: error.constructor.name,
      details: error.toString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
