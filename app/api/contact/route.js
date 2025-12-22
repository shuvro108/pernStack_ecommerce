import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const toEmail = process.env.CONTACT_TO_EMAIL || "shuvrod2017@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111">
        <p style="font-size: 16px; margin: 0 0 12px 0;"><strong>New contact form submission</strong></p>
        <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${name}</p>
        <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 0 0 12px 0;"><strong>Message:</strong></p>
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
    `;

    await resend.emails.send({
      from: `Terracotta <${fromEmail}>`,
      to: [toEmail],
      reply_to: email,
      subject: `Contact form: ${name}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/contact error", err);
    return NextResponse.json(
      { error: "Unable to send message right now." },
      { status: 500 }
    );
  }
}
