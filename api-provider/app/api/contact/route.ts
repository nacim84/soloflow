import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import { queueEmail } from "@/lib/queue";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = contactSchema.parse(json);

    const toEmail = process.env.SUPPORT_EMAIL || "support@soloflow.com";
    console.log(`[Contact API] Queueing email to: ${toEmail}`);

    await queueEmail({
      type: "contact",
      to: toEmail,
      replyTo: body.email,
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
    });

    console.log("[Contact API] Email queued successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact API] Unexpected Error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
