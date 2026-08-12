import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "FX Trading Zone <onboarding@resend.dev>";

export async function sendVerificationEmail(to, code) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set. Add it to server/.env.");
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Your FXTZ verification code",
    html: `<p>Your verification code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in 15 minutes.</p>`,
  });
  if (error) {
    throw new Error(error.message || "Resend failed to send the email.");
  }
}
