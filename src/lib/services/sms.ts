/**
 * SMS Service using Twilio
 * Handles urgent alerts only
 */

import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? Twilio(accountSid, authToken) : null;

/**
 * Send urgent deadline reminder via SMS
 */
export async function sendUrgentDeadlineSMS(
  to: string,
  formType: string,
  daysRemaining: number
): Promise<void> {
  if (!client || !fromNumber) {
    console.log('[MOCK SMS]', { to, formType, daysRemaining });
    return;
  }

  const message = daysRemaining === 1
    ? `URGENT: ${formType} filing is due TOMORROW. File now at taxcore360.com`
    : `REMINDER: ${formType} filing due in ${daysRemaining} days. File at taxcore360.com`;

  await client.messages.create({
    body: message,
    from: fromNumber,
    to
  });
}

/**
 * Send MFA backup code via SMS
 */
export async function sendMFABackupCodeSMS(
  to: string,
  code: string
): Promise<void> {
  if (!client || !fromNumber) {
    console.log('[MOCK SMS MFA]', { to, code });
    return;
  }

  await client.messages.create({
    body: `Your TaxCore360 backup code is: ${code}. This code will expire in 10 minutes.`,
    from: fromNumber,
    to
  });
}

/**
 * Send security alert via SMS
 */
export async function sendSecurityAlertSMS(
  to: string,
  alertType: 'login' | 'password_change' | 'suspicious_activity'
): Promise<void> {
  if (!client || !fromNumber) {
    console.log('[MOCK SMS Security]', { to, alertType });
    return;
  }

  const messages: Record<string, string> = {
    login: 'Security Alert: New login detected on your TaxCore360 account. If this wasn\'t you, contact support immediately.',
    password_change: 'Security Alert: Your TaxCore360 password was changed. If you didn\'t make this change, contact support immediately.',
    suspicious_activity: 'URGENT: Suspicious activity detected on your TaxCore360 account. Please log in and review your security settings.'
  };

  await client.messages.create({
    body: messages[alertType],
    from: fromNumber,
    to
  });
}

/**
 * Send TIN verification urgent alert
 */
export async function sendTINUrgentAlertSMS(
  to: string,
  vendorName: string,
  deadline: string
): Promise<void> {
  if (!client || !fromNumber) {
    console.log('[MOCK SMS TIN]', { to, vendorName, deadline });
    return;
  }

  await client.messages.create({
    body: `URGENT: Vendor ${vendorName} has unverified TIN. Deadline: ${deadline}. Verify at taxcore360.com`,
    from: fromNumber,
    to
  });
}
