import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Health Shield <onboarding@resend.dev>",
    to: [options.to],
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    console.error("❌ Resend error:", error);
    throw new Error(error.message);
  }

  console.log("✅ Email sent via Resend:", data.id);
  return data;
};
