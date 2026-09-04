import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS,    
    },
});

export const sendPasswordResetOtp = async (to,otp) =>{
    await transporter.sendMail({
        from: `"Web App Software Solution" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Admin Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>

        <p>Your Admin password reset OTP is:</p>

        <h1 style="letter-spacing: 5px;">${otp}</h1>

        <p>
          This OTP is valid for <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request a password reset,
          please ignore this email.
        </p>
      </div>
    `,
    });
};