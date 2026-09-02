import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const PRIMARY_EMAIL = process.env.NOTIFICATION_EMAIL || "attechfirm@gmail.com";
const SECONDARY_EMAIL = "realtirtharaj@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, email, phone, message, subject, planTitle, amount, utrNumber } = body;

    let emailSubject = "";
    let htmlContent = "";

    if (type === "purchase") {
      emailSubject = `🎉 New Package Purchase: ${planTitle} from ${name} (${amount})`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #34d399; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 12px;">
            🚀 New Package Order Received!
          </h2>
          <p style="font-size: 14px; color: #94a3b8;">A new client has completed UPI payment on <strong>A&T Tech Firm</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Client Name:</td>
              <td style="padding: 10px 0; color: #ffffff; font-weight: bold;">${name || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Email Address:</td>
              <td style="padding: 10px 0; color: #38bdf8;"><a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email || "N/A"}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Phone Number:</td>
              <td style="padding: 10px 0; color: #ffffff;">${phone || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Selected Package:</td>
              <td style="padding: 10px 0; color: #34d399; font-weight: bold;">${planTitle || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Amount:</td>
              <td style="padding: 10px 0; color: #fbbf24; font-weight: bold; font-size: 16px;">${amount || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">UPI / UTR Ref ID:</td>
              <td style="padding: 10px 0; color: #fbbf24; font-family: monospace; font-weight: bold;">${utrNumber || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Submitted At:</td>
              <td style="padding: 10px 0; color: #cbd5e1;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
            </tr>
          </table>

          <div style="margin-top: 24px; padding: 14px; background-color: #1e293b; border-radius: 8px; font-size: 13px; color: #cbd5e1; text-align: center;">
            Log in to the <a href="https://ais-dev-ja2vzc7o2p23hyvr4wuxi5-841291359049.asia-southeast1.run.app/admin" style="color: #38bdf8; font-weight: bold;">Admin Dashboard</a> to manage this client order.
          </div>
        </div>
      `;
    } else {
      // Contact query
      emailSubject = `📩 New Contact Query from ${name}: "${subject || "Project Inquiry"}"`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #38bdf8; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 12px;">
            📬 New Contact Message Received
          </h2>
          <p style="font-size: 14px; color: #94a3b8;">A visitor sent a new message from the <strong>A&T Tech Firm</strong> website contact panel.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold; width: 120px;">Sender Name:</td>
              <td style="padding: 10px 0; color: #ffffff; font-weight: bold;">${name || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Sender Email:</td>
              <td style="padding: 10px 0; color: #38bdf8;"><a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email || "N/A"}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Phone Number:</td>
              <td style="padding: 10px 0; color: #ffffff;">${phone || "Not provided"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Subject:</td>
              <td style="padding: 10px 0; color: #f1f5f9; font-weight: bold;">${subject || "General Query"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 10px 0; color: #f8fafc; line-height: 1.5; white-space: pre-wrap; background: #020617; padding: 12px; border-radius: 6px;">${message || "(Empty message)"}</td>
            </tr>
          </table>

          <div style="margin-top: 24px; padding: 14px; background-color: #1e293b; border-radius: 8px; font-size: 13px; color: #cbd5e1; text-align: center;">
            <a href="mailto:${email}?subject=Re:%20${encodeURIComponent(subject || "Your inquiry with A&T Tech Firm")}" style="background-color: #38bdf8; color: #020617; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Reply Directly to ${name}</a>
          </div>
        </div>
      `;
    }

    let emailSent = false;
    let errorDetails = null;

    // 1. Check if SMTP configuration is present
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"A&T Tech Firm Alerts" <${process.env.SMTP_USER}>`,
          to: `${PRIMARY_EMAIL}, ${SECONDARY_EMAIL}`,
          replyTo: email,
          subject: emailSubject,
          html: htmlContent,
        });

        emailSent = true;
      } catch (smtpErr: any) {
        console.error("Nodemailer SMTP Error:", smtpErr);
        errorDetails = smtpErr.message;
      }
    }

    // 2. Try Web3Forms / Transactional fallback if SMTP was not used or failed
    if (!emailSent) {
      try {
        const fallbackRes = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: process.env.WEB3FORMS_ACCESS_KEY || "8171f251-574d-44a6-905e-85cbb126f5d8",
            subject: emailSubject,
            from_name: name || "Website Visitor",
            email: email,
            to_email: PRIMARY_EMAIL,
            message: `Type: ${type.toUpperCase()}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nSubject/Plan: ${subject || planTitle || "N/A"}\nAmount/UTR: ${amount || utrNumber || "N/A"}\n\nMessage/Details:\n${message || "Package Purchase Order"}`
          }),
        });

        if (fallbackRes.ok) {
          emailSent = true;
        }
      } catch (fbErr: any) {
        console.warn("Fallback email webhook notice:", fbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      recipient: PRIMARY_EMAIL,
      errorDetails: emailSent ? null : errorDetails
    });
  } catch (error: any) {
    console.error("Notify API unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process notification" },
      { status: 500 }
    );
  }
}
