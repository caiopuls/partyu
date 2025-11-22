import nodemailer from 'nodemailer';

/**
 * Simple email sender using nodemailer. Configuration is read from environment variables.
 * Expected env vars:
 *   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
 */
export async function sendEmail(to: string, subject: string, html: string) {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email configuration missing; skipping email send.');
        return { messageId: 'skipped' } as any;
    }
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@partyu.com',
        to,
        subject,
        html,
    });

    console.log('Email sent:', info.messageId);
    return info;
}
