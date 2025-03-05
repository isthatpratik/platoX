import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // Add in .env
    pass: process.env.EMAIL_PASS, // Add in .env
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  return transporter.sendMail({
    from: '"platoX" <no-reply@platox.com>',
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  });
}
