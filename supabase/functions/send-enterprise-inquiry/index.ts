import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EnterpriseInquiry {
  name: string;
  email: string;
  organization: string;
  organizationType: string;
  estimatedUsers: string;
  message: string;
}

const orgTypeLabels: Record<string, string> = {
  government: "Government Agency",
  un_agency: "UN Agency",
  ngo: "NGO / Non-Profit",
  foundation: "Foundation",
  corporate: "Corporate CSR",
  other: "Other",
};

const userRangeLabels: Record<string, string> = {
  "1000": "Up to 1,000",
  "5000": "1,000 - 5,000",
  "10000": "5,000 - 10,000",
  "50000": "10,000 - 50,000",
  "100000+": "50,000+",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const inquiry: EnterpriseInquiry = await req.json();

    // Basic server-side validation
    if (
      !inquiry.name ||
      !inquiry.email ||
      !inquiry.organization ||
      !inquiry.organizationType ||
      !inquiry.estimatedUsers ||
      !inquiry.message
    ) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquiry.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build email HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
            .field { margin-bottom: 20px; }
            .label { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 4px; }
            .value { font-size: 16px; color: #111827; }
            .message-box { background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🏢 New Enterprise Inquiry</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Loaves & Fish Network</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Contact Name</div>
                <div class="value">${inquiry.name}</div>
              </div>
              <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${inquiry.email}">${inquiry.email}</a></div>
              </div>
              <div class="field">
                <div class="label">Organization</div>
                <div class="value">${inquiry.organization}</div>
              </div>
              <div class="field">
                <div class="label">Organization Type</div>
                <div class="value">${orgTypeLabels[inquiry.organizationType] || inquiry.organizationType}</div>
              </div>
              <div class="field">
                <div class="label">Estimated Beneficiaries</div>
                <div class="value">${userRangeLabels[inquiry.estimatedUsers] || inquiry.estimatedUsers}</div>
              </div>
              <div class="field">
                <div class="label">Message</div>
                <div class="message-box">${inquiry.message.replace(/\n/g, "<br>")}</div>
              </div>
            </div>
            <div class="footer">
              This inquiry was submitted through the Loaves & Fish Network website.
            </div>
          </div>
        </body>
      </html>
    `;

    // Send notification email to the team
    const { error: sendError } = await resend.emails.send({
      from: "Loaves & Fish Network <onboarding@resend.dev>",
      to: ["hello@loavesandfish.network"], // Replace with actual email
      replyTo: inquiry.email,
      subject: `Enterprise Inquiry: ${inquiry.organization}`,
      html,
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      throw new Error("Failed to send email");
    }

    // Send confirmation to the inquirer
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
            .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🙏 Thank You, ${inquiry.name}!</h1>
            </div>
            <div class="content">
              <p>We've received your inquiry from <strong>${inquiry.organization}</strong> and are excited about the potential to work together.</p>
              <p>Our enterprise team will review your request and get back to you within <strong>24-48 hours</strong>.</p>
              <p>In the meantime, feel free to explore our platform or reach out directly if you have urgent questions.</p>
              <p style="margin-top: 24px;">
                Best regards,<br>
                <strong>The Loaves & Fish Network Team</strong>
              </p>
            </div>
            <div class="footer">
              © 2024 Loaves & Fish Network. Feeding communities, creating dignity.
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: "Loaves & Fish Network <onboarding@resend.dev>",
      to: [inquiry.email],
      subject: "We received your inquiry – Loaves & Fish Network",
      html: confirmationHtml,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing inquiry:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process inquiry" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
