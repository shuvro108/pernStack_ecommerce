import { NextResponse } from "next/server";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller.js";
import { Resend } from "resend";

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Terracotta <onboarding@resend.dev>";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const generateEmailHTML = (title, body) => {
  const safe = String(body)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#222">
      <h2 style="margin:0 0 12px 0">${title}</h2>
      <div>${safe}</div>
      <hr style="margin:20px 0;border:none;border-top:1px solid #eee" />
      <p style="font-size:12px;color:#666;margin:0">You received this because you subscribed to Terracotta updates.</p>
    </div>
  `;
};

const sendBulkEmails = async (subject, message, recipientEmails) => {
  if (!resend) {
    throw new Error("RESEND_API_KEY is missing. Set it in your environment.");
  }

  let sent = 0;
  // Send sequentially to avoid exposing recipient lists and keep it simple
  for (const email of recipientEmails) {
    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        text: message,
        html: generateEmailHTML(subject, message),
      });
      if (error) {
        console.error(`[Resend] Failed to send to ${email}:`, error);
        continue;
      }
      sent += 1;
    } catch (err) {
      console.error(`[Resend] Error sending to ${email}:`, err);
    }
  }

  return { sent };
};

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const cu = await currentUser();
    const authUserId = userId || cu?.id;

    if (!authUserId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify seller/admin access
    const isSeller = await authSeller(authUserId);
    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Only sellers can send newsletters" },
        { status: 403 }
      );
    }

    const { subject, message, mode, to } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, message: "Subject and message are required" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email service not configured (missing RESEND_API_KEY). Ask admin to set it.",
        },
        { status: 500 }
      );
    }

    await connectDB();

    let recipientEmails = [];
    if (mode === "test") {
      const fallback =
        to ||
        process.env.RESEND_TEST_RECIPIENT ||
        cu?.emailAddresses?.[0]?.emailAddress;
      if (!fallback) {
        return NextResponse.json(
          {
            success: false,
            message:
              "No test recipient found. Provide 'to' or set RESEND_TEST_RECIPIENT.",
          },
          { status: 400 }
        );
      }
      recipientEmails = [fallback];
    } else {
      // Fetch all subscribers
      const subscribers = await prisma.newsletter.findMany({
        select: { email: true },
      });
      if (subscribers.length === 0) {
        return NextResponse.json(
          { success: false, message: "No subscribers to send to" },
          { status: 400 }
        );
      }
      recipientEmails = subscribers.map((s) => s.email);
    }

    // Send emails via Resend
    const result = await sendBulkEmails(
      subject.trim(),
      message.trim(),
      recipientEmails
    );

    console.log(
      `[Newsletter Send] Successfully sent to ${result.sent} recipients`
    );

    if (result.sent === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            mode === "test"
              ? "Test email could not be sent. Ensure the recipient matches your Resend account email."
              : "No emails sent. Resend may be in test mode. Verify a domain and set RESEND_FROM_EMAIL, or use 'Send test to me'.",
          sent: 0,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          mode === "test"
            ? `Test email sent to ${recipientEmails[0]}`
            : `Newsletter sent to ${result.sent} subscribers`,
        sent: result.sent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[newsletter/send] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
