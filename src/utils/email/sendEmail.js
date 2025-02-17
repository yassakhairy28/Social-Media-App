import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
    pool: true,  
    maxConnections: 5,
    maxMessages: 100
  });

  const info = await transporter.sendMail({
    from: `"social media Application" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
  return info.rejected.length === 0 ? true : false;
};

export const subject = {
  register: "Activaie Account",
  resetPassword: "Reset Password",
  login: "Login",
  updateEmail: "Update Email",
};
