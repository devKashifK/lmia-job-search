import nodemailer from 'nodemailer';

const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};

const transporter = nodemailer.createTransport(smtpConfig);

export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"JobMaze" <noreply@jobmaze.ca>',
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html,
        });
        console.log(`Email sent successfully: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
