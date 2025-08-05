import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  QrCode, 
  Mail, 
  Share2, 
  Globe, 
  MessageSquare, 
  Maximize, 
  Eye,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  Monitor,
  FileText,
  Printer,
  Facebook,
  Linkedin,
  Twitter,
  Link2,
  Loader2,
  Users,
  Edit,
  Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';

export function ShareQuizPage() {
  const { quizId, customQuizId } = useParams<{ quizId?: string; customQuizId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customQuiz, setCustomQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('full-page');
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [webSource, setWebSource] = useState('website');
  const [error, setError] = useState<string | null>(null);
  const [contactLists, setContactLists] = useState<any[]>([
    { id: '1', name: 'All Patients', count: 245 },
    { id: '2', name: 'New Patients', count: 78 },
    { id: '3', name: 'Follow-up Patients', count: 124 }
  ]);
  const [selectedList, setSelectedList] = useState('');
  const [shortUrl, setShortUrl] = useState<string>('');
  const [isGeneratingShortUrl, setIsGeneratingShortUrl] = useState(false);
  const [ctaText, setCtaText] = useState('For more info about non-invasive in office procedure to give you relief, Schedule a 5min screening phone call.');
  const [customMessage, setCustomMessage] = useState('');
  const baseUrl = window.location.origin;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user) {
          // Get all doctor profiles for this user
          const { data: profiles, error: profileError } = await supabase
            .from('doctor_profiles')
            .select('*')
            .eq('user_id', user.id);
          
          if (profileError) {
            console.error('Error fetching doctor profile:', profileError);
            setError('Could not fetch doctor profile');
          } else if (profiles && profiles.length > 0) {
            // Use the first profile if multiple exist
            setDoctorProfile(profiles[0]);
          } else {
            // Create a new profile if none exists
            const { data: newProfile, error: createError } = await supabase
              .from('doctor_profiles')
              .insert([{ 
                user_id: user.id,
                first_name: 'Doctor',
                last_name: 'User',
                email: user.email,
                doctor_id: Math.floor(100000 + Math.random() * 900000).toString()
              }])
              .select();

            if (createError) {
              console.error('Error creating doctor profile:', createError);
              setError('Failed to create doctor profile');
            } else if (newProfile && newProfile.length > 0) {
              setDoctorProfile(newProfile[0]);
            }
          }
        }

        if (customQuizId) {
          const { data, error } = await supabase
            .from('custom_quizzes')
            .select('*')
            .eq('id', customQuizId)
            .single();
          
          if (error) throw error;
          if (data) {
            setCustomQuiz(data);
            if (data.cta_text) {
              setCtaText(data.cta_text);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };
 
    fetchData();
  }, [customQuizId]);
 
  const getQuizUrl = (source?: string) => {
    const baseQuizUrl = customQuizId 
      ? `${baseUrl}/custom-quiz/${customQuizId}`
      : `${baseUrl}/quiz/${quizId?.toLowerCase()}`;
    
    const trackingParams = new URLSearchParams();
    
    // Add doctor ID if available
    if (doctorProfile?.id) {
      trackingParams.set('doctor', doctorProfile.id);
    }

    // Add source tracking
    const sourceParam = source || webSource;
    trackingParams.set('source', sourceParam);
    trackingParams.set('utm_source', sourceParam);
    trackingParams.set('utm_medium', getSourceMedium(sourceParam));
    trackingParams.set('utm_campaign', 'quiz_share');

    return `${baseQuizUrl}?${trackingParams.toString()}`;
  };

  const getSourceMedium = (source: string) => {
    switch (source) {
      case 'facebook':
      case 'linkedin':
      case 'twitter':
        return 'social';
      case 'email':
        return 'email';
      case 'text':
        return 'sms';
      case 'website':
        return 'web';
      default:
        return 'referral';
    }
  };

  const generateShortUrl = async () => {
    setIsGeneratingShortUrl(true);
    try {
      const longUrl = getQuizUrl();
      
      // Call the ulvis.net API to shorten the URL
      const response = await fetch(`https://ulvis.net/api.php?url=${encodeURIComponent(longUrl)}`);
      const data = await response.json();
      
      if (data && data.success && data.data && data.data.url) {
        setShortUrl(data.data.url);
        toast.success('Short URL generated successfully!');
      } else {
        throw new Error('Failed to generate short URL');
      }
    } catch (error) {
      console.error('Error generating short URL:', error);
      toast.error('Failed to generate short URL. Please try again.');
    } finally {
      setIsGeneratingShortUrl(false);
    }
  };

  const handleSocialShare = (platform: string) => {
    if (!shareUrl) return;

    // Add source parameter to the URL for tracking
    const urlWithSource = new URL(shareUrl);
    urlWithSource.searchParams.set('source', platform);
    const finalUrl = urlWithSource.toString();

    let socialUrl = '';
    const message = encodeURIComponent(`Take this ${quizId} assessment to evaluate your health.`);

    switch (platform) {
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}`;
        break;
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(finalUrl)}`;
        break;
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(finalUrl)}`;
        break;
      case 'whatsapp':
        socialUrl = `https://wa.me/?text=${message}%20${encodeURIComponent(finalUrl)}`;
        break;
      case 'telegram':
        socialUrl = `https://t.me/share/url?url=${encodeURIComponent(finalUrl)}&text=${message}`;
        break;
      default:
        return;
    }

    window.open(socialUrl, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Could not copy text: ", err);
        toast.error('Failed to copy link to clipboard.');
      });
  };

  const generateQrCode = () => {
    setShowQrCode(true);
  };

  const shareUrl = getQuizUrl();
  const doctorLandingUrl = doctorProfile?.id ? `${baseUrl}/share/nose/${doctorProfile.id}` : `${baseUrl}/share/nose/demo`;
  const doctorEditingUrl = doctorProfile?.id ? `${baseUrl}/nose-editor/${doctorProfile.id}` : `${baseUrl}/share/nose/demo`;
  const handleShareWithContactList = () => {
    if (!selectedList) {
      toast.error('Please select a contact list');
      return;
    }

    // Simulate sharing with contact list
    toast.success(`Assessment shared with "${contactLists.find(list => list.id === selectedList)?.name}" contact list`);
  };

  const handleCopyShortUrl = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      toast.success('Short URL copied to clipboard!');
    } else {
      toast.error('No short URL available. Please generate one first.');
    }
  };

  const mailHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" style="padding:0;Margin:0"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>E</title> <!--[if (mso 16)]><style type="text/css"> a {text-decoration: none;}  </style><![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]><noscript> <xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml> </noscript>
<![endif]--><!--[if mso]><xml> <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word"> <w:DontUseAdvancedTypographyReadingMail></w:DontUseAdvancedTypographyReadingMail> </w:WordDocument> </xml>
<![endif]--><style type="text/css">#outlook a { padding:0;}.ExternalClass { width:100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div { line-height:100%;}.b { mso-style-priority:100!important; text-decoration:none!important;}a[x-apple-data-detectors] { color:inherit!important; text-decoration:none!important; font-size:inherit!important; font-family:inherit!important; font-weight:inherit!important; line-height:inherit!important;}.a { display:none; float:left; overflow:hidden; width:0; max-height:0; line-height:0; mso-hide:all;}@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:30px!important; text-align:center } h2 { font-size:26px!important; text-align:center } h3 { font-size:20px!important; text-align:center }
 .bd p, .bd ul li, .bd ol li, .bd a { font-size:16px!important } *[class="gmail-fix"] { display:none!important } .x { display:block!important } .p table, .q table, .r table, .p, .r, .q { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } a.b, button.b { font-size:20px!important; display:block!important; padding:10px 0px 10px 0px!important } }@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }</style>
 </head> <body data-new-gr-c-s-loaded="14.1244.0" style="font-family:arial, 'helvetica neue', helvetica, sans-serif;width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6"><!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f6f6f6"></v:fill> </v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6"><tr style="border-collapse:collapse">
<td valign="top" style="padding:0;Margin:0"><table class="p" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0"><table class="bd" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr style="border-collapse:collapse"><td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse">
<td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="http://nta.breatheeasy.life/relief-asi-pop-nose-medicare" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#1376C8;font-size:14px"><img src="https://cdn.prod.website-files.com/6213b8b7ae0610f9484d627a/63d85029011f18f6bfabf2f3_Exhale_Sinus_Horizontal_logo-p-800.png" alt="" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="200" height="47"></a> </td></tr><tr style="border-collapse:collapse">
<td align="left" style="padding:0;Margin:0;padding-top:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Hello {{contact.first_name}},<br><br>This is Dr. Vaughn, your ENT. Do you experience difficulty breathing through your nose and nothing seems to help? You may have nasal obstruction, a common condition that affects millions of Americans.<br><br>I am now offering non-invasive treatment options that can help you breathe better with lasting results. The non-invasive treatments may be performed right in our office, and patients may return to normal activities on the same day.<br><br>Are you a candidate? Click below to take a quick test and find out.</p></td></tr> <tr style="border-collapse:collapse">
<td align="center" style="padding:10px;Margin:0"><span class="x" style="border-style:solid;border-color:#2CB543;background:#6fa8dc;border-width:0px 0px 2px 0px;display:inline-block;border-radius:5px;width:auto"><a href="http://nta.breatheeasy.life/relief-asi-pop-nose-medicare" class="b b-1619632113981" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:14px;display:inline-block;background:#6fa8dc;border-radius:5px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:16.8px;width:auto;text-align:center;padding:10px 20px;mso-padding-alt:0;mso-border-alt:10px solid #6fa8dc">Am I a Candidate?</a></span></td></tr> <tr style="border-collapse:collapse">
<td align="left" style="padding:0;Margin:0;padding-top:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">If you experience difficulty breathing through your nose and nothing seems to help, we recommend taking the NOSE Test to measure your nasal blockage severity.<br><br>The <b>Nasal Obstruction Symptom Evaluation (NOSE)</b>&nbsp;Test is a short, 5-question survey. <span style="color:#333333">Each question is scored from 0 (not a problem) to 5 (severe problem). Your total score helps your provider understand how serious your symptoms are and what treatment options might be appropriate.</span></p>
 <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">It takes less than a minute to complete and is a simple first step toward breathing easier.</p></td></tr> <tr style="border-collapse:collapse">
<td align="center" style="padding:10px;Margin:0"><span class="x" style="border-style:solid;border-color:#2CB543;background:#6fa8dc;border-width:0px 0px 2px 0px;display:inline-block;border-radius:5px;width:auto"><a href="http://nta.breatheeasy.life/relief-asi-pop-nose-medicare" class="b" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:14px;display:inline-block;background:#6fa8dc;border-radius:5px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:16.8px;width:auto;text-align:center;padding:10px 20px 10px 20px;mso-padding-alt:0;mso-border-alt:10px solid #6fa8dc">Take the NOSE Test</a></span></td></tr> <tr style="border-collapse:collapse">
<td align="left" style="padding:0;Margin:0;padding-top:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">You may be eligible to use your Medicare or insurance benefits towards your treatment. If you have any questions or would like help checking your insurance coverage, please call us at <a target="_blank" href="tel:(630)513-1691" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#1376C8;font-size:14px"></a><a href="tel:224-412-5949" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#1376C8;font-size:14px">224-412-5949</a>.</p>
 <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Sincerely,</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#000000;font-size:14px">Ryan Vaughn, MD<br>Exhale Sinus&nbsp;</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table>
 <table class="r" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0"><table class="bc" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"><tr style="border-collapse:collapse"><td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse">
<td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;display:none"></td> </tr></table></td></tr></table></td></tr></table></td></tr></table> <table class="p" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0"><table class="bd" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center" role="none"><tr style="border-collapse:collapse">
<td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-bottom:30px"><table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;display:none"></td> </tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body></html>`;

const blob = new Blob([mailHtml], { type: 'text/html' });
const mailiframSrc = URL.createObjectURL(blob);
 const generateEmbedCode = (quizUrl: string) => {
   const iframeCode = `<iframe src="${quizUrl}" width="100%" height="500px" frameBorder="0"></iframe>`;
   setEmbedCode(iframeCode);
 };

 const handleCopy = (text: string, successMessage: string) => {
   navigator.clipboard.writeText(text)
     .then(() => {
       toast.success(successMessage);
     })
     .catch(err => {
       console.error("Could not copy text: ", err);
       toast.error('Failed to copy to clipboard.');
     });
 };

 useEffect(() => {
   if (shareUrl) {
     generateEmbedCode(shareUrl);
   }
 }, [shareUrl]);

 if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">Error</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <Button onClick={() => navigate('/portal')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const quizExists = customQuizId ? customQuiz : Object.values(quizzes).find(
    quiz => quiz.id.toLowerCase() === quizId?.toLowerCase()
  );
  
  if (!quizExists) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h2>
            <p className="text-gray-600 mb-6">The requested assessment could not be found.</p>
          <Button onClick={() => navigate('/portal')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const quizInfo = customQuiz ? {
    title: customQuiz.title,
    description: customQuiz.description,
    shareMessage: customQuiz.share_message || `Take this ${customQuiz.title} assessment to evaluate your symptoms.`,
    linkedinMessage: customQuiz.linkedin_message || `Share this ${customQuiz.title} assessment with your patients to evaluate their symptoms.`
  } : {
    title: quizId || 'Assessment',
    description: quizExists.description || "Medical assessment tool",
    shareMessage: `Take this ${quizId || 'assessment'} to evaluate your symptoms.`,
    linkedinMessage: `Share this ${quizId || 'assessment'} with your patients to evaluate their symptoms.`
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/portal')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Share Assessment</h1>
                <p className="text-gray-600">{quizInfo.title}</p>
                {doctorProfile && (
                  <p className="text-sm text-gray-500">
                    Doctor ID: {doctorProfile.id} | {doctorProfile.first_name} {doctorProfile.last_name}
                  </p>
                )}
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-[#f7904f] to-[#04748f] text-white px-4 py-2">
              {customQuiz ? 'Custom Quiz' : 'Standard Quiz'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="full-page" className="flex items-center gap-2">
              <Maximize className="w-4 h-4" />
              Full Page
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Embed
            </TabsTrigger>
            <TabsTrigger value="contact-lists" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contact Lists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="full-page" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Share Assessment with Source Tracking</CardTitle>
                <CardDescription>
                  Share this link to track where your leads come from
                  {doctorProfile && (
                    <span className="block text-sm text-green-600 mt-1">
                      ✓ Doctor ID ({doctorProfile.id}) is included in all URLs
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Web Source (for direct links)
                    </label>
                    <select 
                      value={webSource} 
                      onChange={(e) => setWebSource(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="website">Website</option>
                      <option value="blog">Blog</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="print">Print Materials</option>
                      <option value="direct">Direct Link</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl} 
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      onClick={() => copyToClipboard()}
                      className="min-w-[100px]"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    {(quizId && quizId.toUpperCase() === 'NOSE') && (
                      <>
                      <Button
                        variant="outline"
                        onClick={() => window.open(doctorLandingUrl, '_blank')}
                        className="border-[#0E7C9D] text-[#0E7C9D] font-bold hover:bg-blue-50"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Landing Page
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(doctorEditingUrl, '_blank')}
                        className="border-[#0E7C9D] text-[#0E7C9D] font-bold hover:bg-blue-50"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Open Editing Page
                      </Button>
                      </>
                    )}
                    {(!quizId || quizId.toUpperCase() !== 'NOSE') && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(shareUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    )}
                  </div>

                  {/* Short URL Generator */}
                  <div className="flex gap-2">
                    <Input
                      value={shortUrl || "Generate a short URL for easier sharing"}
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    {shortUrl ? (
                      <Button
                        onClick={handleCopyShortUrl}
                        className="min-w-[100px]"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    ) : (
                      <Button
                        onClick={generateShortUrl}
                        disabled={isGeneratingShortUrl}
                        className="min-w-[140px]"
                      >
                        {isGeneratingShortUrl ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4 mr-2" />
                            Generate Short URL
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Social Media Sharing</CardTitle>
                      <CardDescription>Each platform gets tracked separately</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleSocialShare('facebook')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Facebook className="w-4 h-4 mr-2" />
                          Facebook
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleSocialShare('linkedin')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleSocialShare('twitter')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Twitter className="w-4 h-4 mr-2" />
                          Twitter
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleSocialShare('email')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleSocialShare('text')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Smartphone className="w-4 h-4 mr-2" />
                          Text/SMS
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => window.open(shareUrl, '_blank')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Monitor className="w-4 h-4 mr-2" />
                          Open
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => window.print()}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print Page
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleCopyShortUrl()}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">QR Code</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      {showQrCode ? (
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <QRCodeSVG value={shareUrl} size={200} />
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={generateQrCode}
                          className="w-full"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Generate QR Code
                        </Button>
                        
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="h-[500px]">
                    <CardHeader>
                      <CardTitle className="text-xl text-center">Mail</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video h-[400px] w-[520px] bg-white border rounded-lg flex items-center justify-center">
                        <iframe
                          src={mailiframSrc}
                          className="w-full h-full rounded-lg"
                          title={`Mail Preview`}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Email options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Send from</h4>
                        <p className="text-sm text-gray-600">{doctorProfile ? (doctorProfile.email) : "your-email@exmaple.com"}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Sender Name</h4>
                        <p className="text-sm text-gray-600">{doctorProfile ? (doctorProfile.first_name) : "Your name" }</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Subject</h4>
                        <p className="text-sm text-gray-600">Give {quizId} Assessment and get to know about your results instantly</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
                <CardDescription>
                  Add this assessment directly to your website
                  {doctorProfile && (
                    <span className="block text-sm text-green-600 mt-1">
                      ✓ Doctor ID ({doctorProfile.id}) is included in the embed URL
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Input 
                    value={embedCode} 
                    readOnly 
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={() => handleCopy(embedCode, 'Embed code copied!')}
                    className="min-w-[100px]"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-white border rounded-lg flex items-center justify-center">
                        <iframe
                          src={shareUrl}
                          className="w-full h-full rounded-lg"
                          title={`${quizInfo.title} Preview`}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Implementation Guide</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">1. Copy the embed code</h4>
                        <p className="text-sm text-gray-600">Click the copy button above to copy the embed code to your clipboard.</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">2. Paste into your website</h4>
                        <p className="text-sm text-gray-600">Paste the code into your website's HTML where you want the assessment to appear.</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">3. Source tracking included</h4>
                        <p className="text-sm text-gray-600">All leads will be tracked with "website" as the source automatically.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact-lists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Share with Contact Lists</CardTitle>
                <CardDescription>
                  Send this assessment to your existing patient lists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Contact List
                    </label>
                    <select 
                      value={selectedList} 
                      onChange={(e) => setSelectedList(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">-- Select a list --</option>
                      {contactLists.map(list => (
                        <option key={list.id} value={list.id}>
                          {list.name} ({list.count} contacts)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Communication Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        SMS
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Template
                    </label>
                    <textarea 
                      className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                      defaultValue={`Hello,\n\nI'd like to invite you to take our ${quizInfo.title}. This assessment will help us better understand your symptoms.\n\n${shareUrl}\n\nThank you,\nDr. ${doctorProfile?.first_name || ''} ${doctorProfile?.last_name || ''}`}
                    ></textarea>
                  </div>
                  
                  <Button 
                    onClick={handleShareWithContactList}
                    className="w-full"
                    disabled={!selectedList}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share with Selected List
                  </Button>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Contact List Management</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    You can manage your contact lists in the Integrations section. Import contacts from your existing patient database or create new lists.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-700 border-blue-200 hover:bg-blue-100"
                    onClick={() => navigate('/portal?tab=integrations')}
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Manage Contact Lists
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}