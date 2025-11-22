import { sendEmail } from '@/lib/email';

async function testEmail() {
    const to = process.env.TEST_EMAIL_TO;
    if (!to) {
        console.error('Please set TEST_EMAIL_TO environment variable to the recipient email address.');
        return;
    }
    const result = await sendEmail(to, 'Test Email from PartyU', '<p>This is a test email to verify the email notification setup.</p>');
    console.log('Email send result:', result);
}

testEmail();
