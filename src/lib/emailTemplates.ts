// ... existing code ...

export const clinicInvitationTemplate = {
  subject: "You're invited to join {{clinicName}}!",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Team Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #0E7C9D 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .role-badge { background: #0E7C9D; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited!</h1>
          <p>Join the team at {{clinicName}}</p>
        </div>
        <div class="content">
          <h2>Welcome to {{clinicName}}!</h2>
          <p>Hello!</p>
          <p>{{inviterName}} has invited you to join <strong>{{clinicName}}</strong> as a <span class="role-badge">{{role}}</span>.</p>
          
          <p>As a team member, you'll have access to:</p>
          <ul>
            <li>Patient leads and quiz results</li>
            <li>Content management tools</li>
            <li>Team collaboration features</li>
            <li>Analytics and reporting</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="{{invitationLink}}" class="button">Accept Invitation</a>
          </div>
          
          <p><strong>Important:</strong> This invitation will expire in {{expirationDays}} days. If you don't have an account yet, you'll be prompted to create one when you click the link.</p>
          
          <p>If you have any questions, please contact your team administrator.</p>
          
          <p>Best regards,<br>The {{clinicName}} Team</p>
        </div>
        <div class="footer">
          <p>This invitation was sent by Patient Pathway. If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

export const clinicWelcomeTemplate = {
  subject: "Welcome to {{clinicName}}!",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to the Team</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #0E7C9D 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .role-badge { background: #0E7C9D; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to the Team!</h1>
          <p>{{clinicName}}</p>
        </div>
        <div class="content">
          <h2>Hello {{memberName}}!</h2>
          <p>Welcome to <strong>{{clinicName}}</strong>! You're now part of our team as a <span class="role-badge">{{role}}</span>.</p>
          
          <p>You can now access your clinic dashboard where you can:</p>
          <ul>
            <li>View and manage patient leads</li>
            <li>Create and customize content</li>
            <li>Collaborate with your team</li>
            <li>Access analytics and reports</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="{{portalUrl}}" class="button">Go to Dashboard</a>
          </div>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to your team administrator.</p>
          
          <p>We're excited to have you on the team!</p>
          
          <p>Best regards,<br>The {{clinicName}} Team</p>
        </div>
        <div class="footer">
          <p>This welcome email was sent by Patient Pathway.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

export const forgotPasswordTemplate = {
  subject: "Reset your password - Patient Pathway",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #0E7C9D 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
          <p>Patient Pathway</p>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Hello!</p>
          <p>We received a request to reset your password for your Patient Pathway account.</p>
          
          <div style="text-align: center;">
            <a href="{{resetLink}}" class="button">Reset Password</a>
          </div>
          
          <div class="warning">
            <p><strong>Important Security Information:</strong></p>
            <ul>
              <li>This link will expire in 1 hour for security reasons</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Your password will not be changed until you click the link above</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">{{resetLink}}</p>
          
          <p>If you continue to have problems, please contact our support team.</p>
          
          <p>Best regards,<br>The Patient Pathway Team</p>
        </div>
        <div class="footer">
          <p>This password reset email was sent by Patient Pathway. If you didn't request this reset, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
};