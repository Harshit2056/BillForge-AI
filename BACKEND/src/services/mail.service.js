import nodemailer from "nodemailer";

export const getTransporter = () => {
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_PASS?.replace(/\s+/g, "");

    if (!user || !pass) {
        throw new Error(
            "Missing EMAIL_USER or EMAIL_PASS credentials in backend .env file"
        );
    }

    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,

        auth: {
            user,
            pass
        }
    });
};

export const sendEmail = async ({ to, subject, html, text }) => {

    const transporter = getTransporter();
    const user = process.env.EMAIL_USER?.trim();

    return await transporter.sendMail({
        from: `"GenAI Resume" <${user}>`,
        to,
        subject,
        text: text || "Password Reset Request from GenAI Resume",
        html
    });
};

export default sendEmail;