/**
 * Email Service using Resend.com
 * Handles all email notifications for TaxCore360
 */

import { Resend } from 'resend';

// Only initialize Resend if API key is present
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = 'TaxCore360 <notifications@taxcore360.com>';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!resend) {
    console.log('[MOCK EMAIL] Welcome email to:', to);
    return;
  }

  const template = getWelcomeTemplate(name);
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<void> {
  if (!resend) {
    console.log('[MOCK EMAIL] Password reset to:', to);
    return;
  }

  const template = getPasswordResetTemplate(name, resetUrl);
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

/**
 * Send deadline reminder email
 */
export async function sendDeadlineReminderEmail(
  to: string,
  name: string,
  formType: string,
  dueDate: Date,
  daysRemaining: number
): Promise<void> {
  if (!resend) {
    console.log('[MOCK EMAIL] Deadline reminder to:', to);
    return;
  }

  const template = getDeadlineReminderTemplate(name, formType, dueDate, daysRemaining);
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

/**
 * Send form generation complete email
 */
export async function sendFormGeneratedEmail(
  to: string,
  name: string,
  formType: string,
  year: number,
  count: number
): Promise<void> {
  if (!resend) {
    console.log('[MOCK EMAIL] Form generated to:', to);
    return;
  }

  const template = getFormGeneratedTemplate(name, formType, year, count);
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

/**
 * Send filing confirmation email
 */
export async function sendFilingConfirmationEmail(
  to: string,
  name: string,
  formType: string,
  year: number,
  submittedAt: Date
): Promise<void> {
  if (!resend) {
    console.log('[MOCK EMAIL] Filing confirmation to:', to);
    return;
  }

  const template = getFilingConfirmationTemplate(name, formType, year, submittedAt);
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

/**
 * Send TIN verification alert
 */
export async function sendTINVerificationAlert(
  to: string,
  name: string,
  vendorName: string,
  match: boolean
): Promise<void> {
  if (!resend) {
    console.log('[MOCK EMAIL] TIN verification to:', to);
    return;
  }

  const template = getTINVerificationTemplate(name, vendorName, match);
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

/**
 * Send weekly summary email
 */
export async function sendWeeklySummaryEmail(
  to: string,
  name: string,
  stats: {
    newPayments: number;
    pendingForms: number;
    upcomingDeadlines: number;
  }
): Promise<void> {
  if (!resend) {
    console.log('[MOCK EMAIL] Weekly summary to:', to);
    return;
  }

  const template = getWeeklySummaryTemplate(name, stats);
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

// Email Templates

function getWelcomeTemplate(name: string): EmailTemplate {
  return {
    subject: 'Welcome to TaxCore360!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to TaxCore360!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining TaxCore360. Your account is now ready to use.</p>
        <p>With TaxCore360, you can:</p>
        <ul>
          <li>File 1099s and W-2s directly with the IRS</li>
          <li>Verify vendor TINs in real-time</li>
          <li>Manage payroll and tax compliance</li>
          <li>Get automated deadline reminders</li>
        </ul>
        <p><a href="https://taxcore360.com/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a></p>
        <p>Need help? Reply to this email or contact our support team.</p>
        <p>Best regards,<br>The TaxCore360 Team</p>
      </div>
    `,
    text: `Welcome to TaxCore360!

Hi ${name},

Thank you for joining TaxCore360. Your account is now ready to use.

With TaxCore360, you can:
- File 1099s and W-2s directly with the IRS
- Verify vendor TINs in real-time
- Manage payroll and tax compliance
- Get automated deadline reminders

Go to Dashboard: https://taxcore360.com/dashboard

Need help? Reply to this email or contact our support team.

Best regards,
The TaxCore360 Team`
  };
}

function getPasswordResetTemplate(name: string, resetUrl: string): EmailTemplate {
  return {
    subject: 'Reset your TaxCore360 password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p><a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The TaxCore360 Team</p>
      </div>
    `,
    text: `Password Reset Request

Hi ${name},

We received a request to reset your password. Click the link below to reset it:

${resetUrl}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

Best regards,
The TaxCore360 Team`
  };
}

function getDeadlineReminderTemplate(
  name: string,
  formType: string,
  dueDate: Date,
  daysRemaining: number
): EmailTemplate {
  const urgency = daysRemaining <= 7 ? 'urgent' : 'upcoming';
  const color = daysRemaining <= 7 ? '#dc2626' : '#2563eb';
  
  return {
    subject: `${urgency === 'urgent' ? 'URGENT: ' : ''}${formType} Filing Due in ${daysRemaining} Days`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${color};">Tax Filing Reminder</h1>
        <p>Hi ${name},</p>
        <p><strong>${formType}</strong> filing is due on <strong>${dueDate.toLocaleDateString()}</strong> (${daysRemaining} days).</p>
        <p style="background: ${urgency === 'urgent' ? '#fee2e2' : '#dbeafe'}; padding: 16px; border-radius: 6px;">
          ${urgency === 'urgent' 
            ? '⚠️ This deadline is approaching soon. Please file immediately to avoid penalties.' 
            : '📅 Please prepare your forms to ensure timely filing.'}
        </p>
        <p><a href="https://taxcore360.com/dashboard/tax-forms" style="background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Tax Forms</a></p>
        <p>Best regards,<br>The TaxCore360 Team</p>
      </div>
    `,
    text: `Tax Filing Reminder

Hi ${name},

${formType} filing is due on ${dueDate.toLocaleDateString()} (${daysRemaining} days).

${urgency === 'urgent' 
  ? '⚠️ This deadline is approaching soon. Please file immediately to avoid penalties.' 
  : '📅 Please prepare your forms to ensure timely filing.'}

View Tax Forms: https://taxcore360.com/dashboard/tax-forms

Best regards,
The TaxCore360 Team`
  };
}

function getFormGeneratedTemplate(
  name: string,
  formType: string,
  year: number,
  count: number
): EmailTemplate {
  return {
    subject: `${formType} Forms Generated Successfully`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Forms Generated! ✅</h1>
        <p>Hi ${name},</p>
        <p>Your <strong>${formType}</strong> forms for tax year <strong>${year}</strong> have been generated successfully.</p>
        <div style="background: #dcfce7; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <strong>Forms Generated:</strong> ${count}
        </div>
        <p><a href="https://taxcore360.com/dashboard/tax-forms" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review and Submit</a></p>
        <p>Best regards,<br>The TaxCore360 Team</p>
      </div>
    `,
    text: `Forms Generated! ✅

Hi ${name},

Your ${formType} forms for tax year ${year} have been generated successfully.

Forms Generated: ${count}

Review and Submit: https://taxcore360.com/dashboard/tax-forms

Best regards,
The TaxCore360 Team`
  };
}

function getFilingConfirmationTemplate(
  name: string,
  formType: string,
  year: number,
  submittedAt: Date
): EmailTemplate {
  return {
    subject: `${formType} Filing Submitted Successfully`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Filing Submitted! 🎉</h1>
        <p>Hi ${name},</p>
        <p>Your <strong>${formType}</strong> filing for tax year <strong>${year}</strong> has been submitted to the IRS.</p>
        <div style="background: #dcfce7; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <strong>Submitted At:</strong> ${submittedAt.toLocaleString()}<br>
          <strong>Status:</strong> Pending IRS Acceptance
        </div>
        <p>You'll receive another email once the IRS accepts your filing.</p>
        <p><a href="https://taxcore360.com/dashboard/tax-forms" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Status</a></p>
        <p>Best regards,<br>The TaxCore360 Team</p>
      </div>
    `,
    text: `Filing Submitted! 🎉

Hi ${name},

Your ${formType} filing for tax year ${year} has been submitted to the IRS.

Submitted At: ${submittedAt.toLocaleString()}
Status: Pending IRS Acceptance

You'll receive another email once the IRS accepts your filing.

View Status: https://taxcore360.com/dashboard/tax-forms

Best regards,
The TaxCore360 Team`
  };
}

function getTINVerificationTemplate(
  name: string,
  vendorName: string,
  match: boolean
): EmailTemplate {
  const status = match ? 'Verified ✅' : 'Mismatch ⚠️';
  const color = match ? '#16a34a' : '#dc2626';
  
  return {
    subject: `TIN Verification ${match ? 'Successful' : 'Alert'} for ${vendorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${color};">TIN Verification ${status}</h1>
        <p>Hi ${name},</p>
        <p>The TIN verification for <strong>${vendorName}</strong> has been completed.</p>
        <div style="background: ${match ? '#dcfce7' : '#fee2e2'}; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <strong>Status:</strong> ${status}<br>
          ${!match ? '<strong>Action Required:</strong> Please request a corrected W-9 from the vendor.' : ''}
        </div>
        <p><a href="https://taxcore360.com/dashboard/vendors" style="background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Vendor</a></p>
        <p>Best regards,<br>The TaxCore360 Team</p>
      </div>
    `,
    text: `TIN Verification ${status}

Hi ${name},

The TIN verification for ${vendorName} has been completed.

Status: ${status}
${!match ? 'Action Required: Please request a corrected W-9 from the vendor.' : ''}

View Vendor: https://taxcore360.com/dashboard/vendors

Best regards,
The TaxCore360 Team`
  };
}

function getWeeklySummaryTemplate(
  name: string,
  stats: { newPayments: number; pendingForms: number; upcomingDeadlines: number }
): EmailTemplate {
  return {
    subject: 'Your Weekly Tax Compliance Summary',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Weekly Summary</h1>
        <p>Hi ${name},</p>
        <p>Here's your tax compliance summary for this week:</p>
        <div style="background: #eff6ff; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <div style="margin-bottom: 8px;">📊 <strong>New Payments:</strong> ${stats.newPayments}</div>
          <div style="margin-bottom: 8px;">📝 <strong>Pending Forms:</strong> ${stats.pendingForms}</div>
          <div>⏰ <strong>Upcoming Deadlines:</strong> ${stats.upcomingDeadlines}</div>
        </div>
        <p><a href="https://taxcore360.com/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a></p>
        <p>Best regards,<br>The TaxCore360 Team</p>
      </div>
    `,
    text: `Weekly Summary

Hi ${name},

Here's your tax compliance summary for this week:

📊 New Payments: ${stats.newPayments}
📝 Pending Forms: ${stats.pendingForms}
⏰ Upcoming Deadlines: ${stats.upcomingDeadlines}

View Dashboard: https://taxcore360.com/dashboard

Best regards,
The TaxCore360 Team`
  };
}
