// Email templates for different assessments
// Based on the exact templates from ShareQuizPage.tsx

interface DoctorProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  clinic_name: string | null;
  website: string | null;
  avatar_url: string | null;
}

interface EmailTemplateOptions {
  doctorProfile: DoctorProfile;
  baseUrl: string;
  recipientName?: string;
}

export function generateAssessmentEmailTemplate(
  assessmentType: 'nose' | 'snot12' | 'snot22' | 'tnss',
  options: EmailTemplateOptions
): { html: string; text: string; subject: string } {
  const { doctorProfile, baseUrl, recipientName = 'Patient' } = options;
  
  // Generate the appropriate URL for each assessment
  const getAssessmentUrl = () => {
    const doctorId = doctorProfile.id || 'demo';
    switch (assessmentType) {
      case 'nose':
        return `${baseUrl}/share/nose?doctor=${doctorId}&utm_source=email`;
      case 'snot12':
        return `${baseUrl}/share/snot12?doctor=${doctorId}&utm_source=email`;
      case 'snot22':
        return `${baseUrl}/share/snot22?doctor=${doctorId}&utm_source=email`;
      case 'tnss':
        return `${baseUrl}/share/tnss?doctor=${doctorId}&utm_source=email`;
      default:
        return `${baseUrl}/share/nose?doctor=${doctorId}&utm_source=email`;
    }
  };

  const assessmentUrl = getAssessmentUrl();
  
  // Generate website link (logo) - exact from ShareQuizPage
  const websiteLink = doctorProfile.website
    ? `<a target="_blank" href="${doctorProfile.website}" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#1376C8;font-size:14px"><img src="${doctorProfile?.avatar_url || 'Your Website Image'}" alt="" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="200" height="47"></a>`
    : `<img src="https://cdn.prod.website-files.com/6213b8b7ae0610f9484d627a/63d85029011f18f6bfabf2f3_Exhale_Sinus_Horizontal_logo-p-800.png" alt="" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="200" height="47">`;

  // Generate buttons - exact from ShareQuizPage
  const amIACandidateButton = `<span class="x" style="border-style:solid;border-color:#2CB543;background:#6fa8dc;border-width:0px 0px 2px 0px;display:inline-block;border-radius:5px;width:auto"><a href="${assessmentUrl}" class="b b-1619632113981" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:14px;display:inline-block;background:#6fa8dc;border-radius:5px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:16.8px;width:auto;text-align:center;padding:10px 20px;mso-padding-alt:0;mso-border-alt:10px solid #6fa8dc">Am I a Candidate?</a></span>`;

  const takeTheTestButton = `<span class="x" style="border-style:solid;border-color:#2CB543;background:#6fa8dc;border-width:0px 0px 2px 0px;display:inline-block;border-radius:5px;width:auto"><a href="${assessmentUrl}" class="b" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:14px;display:inline-block;background:#6fa8dc;border-radius:5px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:16.8px;width:auto;text-align:center;padding:10px 20px 10px 20px;mso-padding-alt:0;mso-border-alt:10px solid #6fa8dc">Take the ${getAssessmentTitle(assessmentType)} Test</a></span>`;

  // Get assessment-specific content
  const assessmentContent = getAssessmentContent(assessmentType);

  // Generate subject line
  const subject = `Patient Assessment Invitation from Dr. ${doctorProfile.first_name} ${doctorProfile.last_name}`;

  // Generate HTML email - using exact template structure from ShareQuizPage
  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" style="padding:0;Margin:0"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>E</title> <!--[if (mso 16)]><style type="text/css"> a {text-decoration: none;}  </style><![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]><noscript> <xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> </noscript>
<![endif]--><!--[if mso]><xml> <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word"> <w:DontUseAdvancedTypographyReadingMail></w:DontUseAdvancedTypographyReadingMail> </w:WordDocument> </xml>
<![endif]--><style type="text/css">#outlook a { padding:0;}.ExternalClass { width:100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div { line-height:100%;}.b { mso-style-priority:100!important; text-decoration:none!important;}a[x-apple-data-detectors] { color:inherit!important; text-decoration:none!important; font-size:inherit!important; font-family:inherit!important; font-weight:inherit!important; line-height:inherit!important;}.a { display:none; float:left; overflow:hidden; width:0; max-height:0; line-height:0; mso-hide:all;}@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:30px!important; text-align:center } h2 { font-size:26px!important; text-align:center } h3 { font-size:20px!important; text-align:center }
 .bd p, .bd ul li, .bd ol li, .bd a { font-size:16px!important } *[class="gmail-fix"] { display:none!important } .x { display:block!important } .p table, .q table, .r table, .p, .r, .q { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } a.b, button.b { font-size:20px!important; display:block!important; padding:10px 0px 10px 0px!important } }@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }</style>
 </head> <body data-new-gr-c-s-loaded="14.1244.0" style="font-family:arial, 'helvetica neue', helvetica, sans-serif;width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6"><!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f6f6f6"></v:fill> </v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6"><tr style="border-collapse:collapse">
<td valign="top" style="padding:0;Margin:0"><table class="p" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0"><table class="bd" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr style="border-collapse:collapse"><td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse">
<td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;font-size:0px">${websiteLink}</td></tr><tr style="border-collapse:collapse">
<td align="left" style="padding:0;Margin:0;padding-top:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Hello ${recipientName},<br><br>This is ${doctorProfile?.first_name || 'your ENT'}. Do you experience difficulty breathing through your nose and nothing seems to help? You may have nasal obstruction, a common condition that affects millions of Americans.<br><br>I am now offering non-invasive treatment options that can help you breathe better with lasting results. The non-invasive treatments may be performed right in our office, and patients may return to normal activities on the same day.<br><br>Are you a candidate? Click below to take a quick test and find out.</p></td></tr> <tr style="border-collapse:collapse">
<td align="center" style="padding:10px;Margin:0">${amIACandidateButton}</td></tr> <tr style="border-collapse:collapse">
<td align="left" style="padding:0;Margin:0;padding-top:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">${assessmentContent.description}</p>
 <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">It takes less than a minute to complete and is a simple first step toward breathing easier.</p></td></tr> <tr style="border-collapse:collapse">
<td align="center" style="padding:10px;Margin:0">${takeTheTestButton}</td></tr> <tr style="border-collapse:collapse">
<td align="left" style="padding:0;Margin:0;padding-top:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">You may be eligible to use your Medicare or insurance benefits towards your treatment. If you have any questions or would like help checking your insurance coverage, please call us at <a target="_blank" href="tel:(630)513-1691" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#1376C8;font-size:14px"></a><a href="tel:${doctorProfile?.phone || '224-412-5949'}" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#1376C8;font-size:14px">${doctorProfile?.phone || '224-412-5949'}</a>.</p>
 <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Sincerely,</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">${doctorProfile?.first_name || 'Ryan'} ${doctorProfile?.last_name || 'Vaughn'}, MD<br>${doctorProfile?.clinic_name || 'Your Clinic Name'}&nbsp;</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table>
 <table class="r" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0"><table class="bc" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"><tr style="border-collapse:collapse"><td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse">
<td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;display:none"></td> </tr></table></td></tr></table></td></tr></table></td></tr></table> <table class="p" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0"><table class="bd" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center" role="none"><tr style="border-collapse:collapse">
<td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-bottom:30px"><table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;display:none"></td> </tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body></html>`;

  // Generate plain text version
  const text = `Hello ${recipientName},

This is ${doctorProfile?.first_name || 'your ENT'}. Do you experience difficulty breathing through your nose and nothing seems to help? You may have nasal obstruction, a common condition that affects millions of Americans.

I am now offering non-invasive treatment options that can help you breathe better with lasting results. The non-invasive treatments may be performed right in our office, and patients may return to normal activities on the same day.

Are you a candidate? Click below to take a quick test and find out.

${assessmentContent.textDescription}

It takes less than a minute to complete and is a simple first step toward breathing easier.

Take the ${getAssessmentTitle(assessmentType)} Test: ${assessmentUrl}

You may be eligible to use your Medicare or insurance benefits towards your treatment. If you have any questions or would like help checking your insurance coverage, please call us at ${doctorProfile?.phone || '224-412-5949'}.

Sincerely,
${doctorProfile?.first_name || 'Ryan'} ${doctorProfile?.last_name || 'Vaughn'}, MD
${doctorProfile?.clinic_name || 'Your Clinic Name'}`;

  return { html, text, subject };
}

function getAssessmentTitle(assessmentType: string): string {
  switch (assessmentType) {
    case 'nose':
      return 'NOSE';
    case 'snot12':
      return 'SNOT-12';
    case 'snot22':
      return 'SNOT-22';
    case 'tnss':
      return 'TNSS';
    default:
      return 'NOSE';
  }
}

function getAssessmentContent(assessmentType: string): { description: string; textDescription: string } {
  switch (assessmentType) {
    case 'nose':
      return {
        description: 'If you experience difficulty breathing through your nose and nothing seems to help, we recommend taking the NOSE Test to measure your nasal blockage severity.<br><br>The <b>Nasal Obstruction Symptom Evaluation (NOSE)</b>&nbsp;Test is a short, 5-question survey. <span style="color:#333333">Each question is scored from 0 (not a problem) to 5 (severe problem). Your total score helps your provider understand how serious your symptoms are and what treatment options might be appropriate.</span>',
        textDescription: 'If you experience difficulty breathing through your nose and nothing seems to help, we recommend taking the NOSE Test to measure your nasal blockage severity.\n\nThe Nasal Obstruction Symptom Evaluation (NOSE) Test is a short, 5-question survey. Each question is scored from 0 (not a problem) to 5 (severe problem). Your total score helps your provider understand how serious your symptoms are and what treatment options might be appropriate.'
      };
    case 'snot12':
      return {
        description: 'If you experience difficulty breathing through your nose and nothing seems to help, we recommend taking the SNOT12 Test to evaluate your nasal and sinus symptoms and their impact on your quality of life.<br><br>The <b>Sino-Nasal Outcome Test (SNOT)</b>&nbsp;Test is a short, 12-question survey. <span style="color:#333333">Each question is scored from 0 (not a problem) to 5 (severe problem). Your total score helps your provider understand how serious your symptoms are and what treatment options might be appropriate.</span>',
        textDescription: 'If you experience difficulty breathing through your nose and nothing seems to help, we recommend taking the SNOT12 Test to evaluate your nasal and sinus symptoms and their impact on your quality of life.\n\nThe Sino-Nasal Outcome Test (SNOT) Test is a short, 12-question survey. Each question is scored from 0 (not a problem) to 5 (severe problem). Your total score helps your provider understand how serious your symptoms are and what treatment options might be appropriate.'
      };
    case 'snot22':
      return {
        description: 'If you experience difficulty breathing through your nose and nothing seems to help, we recommend taking the SNOT22 Test to evaluate your nasal and sinus symptoms and their impact on your quality of life.<br><br>The <b>Sino-Nasal Outcome Test (SNOT)</b>&nbsp;Test is a short, 22-question survey. <span style="color:#333333">Each question is scored from 0 (not a problem) to 5 (severe problem). Your total score helps your provider understand how serious your symptoms are and what treatment options might be appropriate.</span>',
        textDescription: 'If you experience difficulty breathing through your nose and nothing seems to help, we recommend taking the SNOT22 Test to evaluate your nasal and sinus symptoms and their impact on your quality of life.\n\nThe Sino-Nasal Outcome Test (SNOT) Test is a short, 22-question survey. Each question is scored from 0 (not a problem) to 5 (severe problem). Your total score helps your provider understand how serious your symptoms are and what treatment options might be appropriate.'
      };
    case 'tnss':
      return {
        description: 'If you experience difficulty breathing through your nose and nothing seems to help, we recommend taking the TNSS Test to evaluate your nasal and sinus symptoms and their impact on your quality of life.<br><br>The <b>Total Nasal Symptom Score (TNSS)</b>&nbsp;Test is a short, 22-question survey. <span style="color:#333333">Each question is scored from 0 (not a problem) to 5 (severe problem). Your total score helps your provider understand how serious your symptoms are and what treatment options might be appropriate.</span>',
        textDescription: 'If you experience difficulty breathing through your nose and nothing seems to help, we recommend taking the TNSS Test to evaluate your nasal and sinus symptoms and their impact on your quality of life.\n\nThe Total Nasal Symptom Score (TNSS) Test is a short, 22-question survey. Each question is scored from 0 (not a problem) to 5 (severe problem). Your total score helps your provider understand how serious your symptoms are and what treatment options might be appropriate.'
      };
    default:
      return {
        description: 'If you experience difficulty breathing through your nose and nothing seems to help, we recommend taking the NOSE Test to measure your nasal blockage severity.<br><br>The <b>Nasal Obstruction Symptom Evaluation (NOSE)</b>&nbsp;Test is a short, 5-question survey. <span style="color:#333333">Each question is scored from 0 (not a problem) to 5 (severe problem). Your total score helps your provider understand how serious your symptoms are and what treatment options might be appropriate.</span>',
        textDescription: 'If you experience difficulty breathing through your nose and nothing seems to help, we recommend taking the NOSE Test to measure your nasal blockage severity.\n\nThe Nasal Obstruction Symptom Evaluation (NOSE) Test is a short, 5-question survey. Each question is scored from 0 (not a problem) to 5 (severe problem). Your total score helps your provider understand how serious your symptoms are and what treatment options might be appropriate.'
      };
  }
}