import crypto from "crypto";
import nodemailer from "nodemailer";
const EMAIL_PASS = process.env.EMAIL_PASS as string;
const EMAIL_USER = process.env.EMAIL_USER as string;

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `Veda-Verse <${EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

// Generate a secure 6-digit OTP for mobile password reset
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const sendOTPEmail = async (to: string) => {
  const otp = generateOTP();

  const subject = "Your Verification Code";
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Email Verification</h2>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>This code will expire in 5 minutes.</p>
    </div>
  `;

  await sendEmail(to, subject, html);

  return otp;
};
