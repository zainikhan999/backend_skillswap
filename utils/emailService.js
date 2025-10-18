// import crypto from "crypto";
// import nodemailer from "nodemailer";

// // Create transporter using Gmail (FREE)
// // You need to:
// // 1. Create a Gmail account for your app
// // 2. Enable 2-factor authentication
// // 3. Generate an "App Password" from Google Account settings
// const createTransport = () => {
//   return nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER, // Your Gmail address
//       pass: process.env.EMAIL_PASSWORD, // Your App Password (not regular password)
//     },
//   });
// };

// // Generate 6-digit OTP
// export const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // Send verification email with OTP
// export const sendVerificationEmail = async (email, otp) => {
//   const transporter = createTransport();

//   const mailOptions = {
//     from: `SkillSwap <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Verify Your Email - SkillSwap",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
//         <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
//           <h1 style="color: white; margin: 0;">SkillSwap</h1>
//         </div>
//         <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
//           <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
//           <p style="color: #666; font-size: 16px; line-height: 1.5;">
//             Thank you for signing up! Please use the following OTP to verify your email address:
//           </p>
//           <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
//             <h1 style="color: #059669; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
//           </div>
//           <p style="color: #666; font-size: 14px;">
//             This OTP will expire in <strong>10 minutes</strong>.
//           </p>
//           <p style="color: #999; font-size: 12px; margin-top: 30px;">
//             If you didn't request this verification, please ignore this email.
//           </p>
//         </div>
//       </div>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };

// // Send password reset email with OTP
// export const sendPasswordResetEmail = async (email, otp) => {
//   const transporter = createTransport();

//   const mailOptions = {
//     from: `SkillSwap <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Reset Your Password - SkillSwap",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
//         <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
//           <h1 style="color: white; margin: 0;">SkillSwap</h1>
//         </div>
//         <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
//           <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
//           <p style="color: #666; font-size: 16px; line-height: 1.5;">
//             We received a request to reset your password. Use the OTP below to proceed:
//           </p>
//           <div style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
//             <h1 style="color: #dc2626; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
//           </div>
//           <p style="color: #666; font-size: 14px;">
//             This OTP will expire in <strong>10 minutes</strong>.
//           </p>
//           <p style="color: #999; font-size: 12px; margin-top: 30px;">
//             If you didn't request a password reset, please ignore this email and secure your account.
//           </p>
//         </div>
//       </div>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();
// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email with OTP
export const sendVerificationEmail = async (email, otp) => {
  const msg = {
    to: email,
    from: "skillswap.pak@gmail.com", // Your verified email
    subject: "Verify Your Email - SkillSwap",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">SkillSwap</h1>
        </div>
        <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for signing up! Please use the following OTP to verify your email address:
          </p>
          <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h1 style="color: #059669; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you didn't request this verification, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Verification email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("❌ SendGrid Error:", error);
    if (error.response) {
      console.error("Error details:", error.response.body);
    }
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Send password reset email with OTP
export const sendPasswordResetEmail = async (email, otp) => {
  const msg = {
    to: email,
    from: "skillswap.pak@gmail.com", // Your verified email
    subject: "Reset Your Password - SkillSwap",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">SkillSwap</h1>
        </div>
        <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            We received a request to reset your password. Use the OTP below to proceed:
          </p>
          <div style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h1 style="color: #dc2626; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you didn't request a password reset, please ignore this email and secure your account.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Password reset email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("❌ SendGrid Error:", error);
    if (error.response) {
      console.error("Error details:", error.response.body);
    }
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};
