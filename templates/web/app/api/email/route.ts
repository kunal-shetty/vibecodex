import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();
    if (!to) return Response.json({ error: "to is required" }, { status: 400 });

    const data = await resend.emails.send({
      from: "noreply@yourdomain.com",
      to,
      subject: subject || "Hello from your app",
      html: html || "<p>Your message here 🚀</p>",
    });

    return Response.json({ success: true, data });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
