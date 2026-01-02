import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validations/contact";
import ContactNotificationEmail from "@/emails/contact-notification";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = contactSchema.parse(json);

    const toEmail = process.env.SUPPORT_EMAIL || "support@soloflow.com";

    const { data, error } = await resend.emails.send({
      from: "SoloFlow Contact <onboarding@resend.dev>",
      to: toEmail,
      replyTo: body.email,
      subject: `[${body.subject.toUpperCase()}] New message from ${body.name}`,
      react: ContactNotificationEmail({ data: body }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
