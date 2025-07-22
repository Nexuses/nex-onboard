import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OnboardingData {
  firmName: string;
  website: string;
  country: string;
  managingPartner: {
    name: string;
    email: string;
    phone: string;
  };
  spoc: {
    name: string;
    email: string;
    phone: string;
  };
  emails: Array<{
    name: string;
    email: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { onboardingData }: { onboardingData: OnboardingData } = await req.json()

    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('Resend API key not configured, skipping email notification')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Form submitted successfully (email notification skipped - API key not configured)' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎉 New Client Onboarded!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">RSM MENA Campaign Setup</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
            🏢 Firm Details
          </h2>
          <div style="display: grid; gap: 12px;">
            <div><strong style="color: #475569;">Firm Name:</strong> <span style="color: #1e293b;">${onboardingData.firmName}</span></div>
            <div><strong style="color: #475569;">Website:</strong> <span style="color: #1e293b;">${onboardingData.website || 'Not provided'}</span></div>
            <div><strong style="color: #475569;">Country:</strong> <span style="color: #1e293b;">${onboardingData.country}</span></div>
          </div>
        </div>

        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
          <h2 style="color: #0c4a6e; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #bae6fd; padding-bottom: 10px;">
            👤 Managing Partner
          </h2>
          <div style="display: grid; gap: 12px;">
            <div><strong style="color: #0369a1;">Name:</strong> <span style="color: #0c4a6e;">${onboardingData.managingPartner.name}</span></div>
            <div><strong style="color: #0369a1;">Email:</strong> <span style="color: #0c4a6e;">${onboardingData.managingPartner.email}</span></div>
            <div><strong style="color: #0369a1;">Phone:</strong> <span style="color: #0c4a6e;">${onboardingData.managingPartner.phone}</span></div>
          </div>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
          <h2 style="color: #14532d; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #bbf7d0; padding-bottom: 10px;">
            🎯 SPOC (Single Point of Contact)
          </h2>
          <div style="display: grid; gap: 12px;">
            <div><strong style="color: #15803d;">Name:</strong> <span style="color: #14532d;">${onboardingData.spoc.name}</span></div>
            <div><strong style="color: #15803d;">Email:</strong> <span style="color: #14532d;">${onboardingData.spoc.email}</span></div>
            <div><strong style="color: #15803d;">Phone:</strong> <span style="color: #14532d;">${onboardingData.spoc.phone}</span></div>
          </div>
        </div>

        <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
          <h2 style="color: #713f12; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #fde047; padding-bottom: 10px;">
            📧 Email Accounts
          </h2>
          <div style="display: grid; gap: 15px;">
            ${onboardingData.emails.map((email, index) => `
              <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #fbbf24;">
                <div><strong style="color: #92400e;">Email ${index + 1}:</strong></div>
                <div style="margin-top: 8px;">
                  <div><strong style="color: #a16207;">Name:</strong> <span style="color: #713f12;">${email.name}</span></div>
                  <div><strong style="color: #a16207;">Email:</strong> <span style="color: #713f12;">${email.email}</span></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: #1e293b; color: white; padding: 25px; border-radius: 10px; text-align: center;">
          <h3 style="margin: 0 0 15px 0; font-size: 18px;">📞 Next Steps</h3>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">
            The client onboarding is complete. Please review the information and initiate the campaign setup process.
          </p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #475569;">
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">
              This notification was sent automatically from the RSM MENA Client Onboarding System.
            </p>
          </div>
        </div>
      </div>
    `

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RSM MENA System <noreply@nexuses.agency>',
        to: ['neeraj@nexuses.in'],
        subject: `🎉 New Client Onboarded: ${onboardingData.firmName} (${onboardingData.country})`,
        html: emailContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Failed to send email:', errorText)
      
      // Return success but note email failure
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Form submitted successfully (email notification failed to send)',
          emailError: errorText
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Form submitted and notification email sent successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in notification function:', error)
    
    // Return success for form submission even if email fails
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Form submitted successfully (email notification encountered an error)',
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})