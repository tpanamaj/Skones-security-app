import axios from 'axios';
import { z } from 'zod';

interface NotificationRecipient {
  type: 'sms' | 'email';
  value: string;
  name?: string;
}

interface NotificationContent {
  subject?: string;
  body: string;
  templateId?: string;
  variables?: Record<string, string>;
}

class CommunicationService {
  private static instance: CommunicationService;
  private smsProvider: string = process.env.SMS_PROVIDER || 'twilio';
  private emailProvider: string = process.env.EMAIL_PROVIDER || 'sendgrid';

  private constructor() {}

  static getInstance(): CommunicationService {
    if (!CommunicationService.instance) {
      CommunicationService.instance = new CommunicationService();
    }
    return CommunicationService.instance;
  }

  async sendSMS(recipient: string, message: string): Promise<void> {
    try {
      // Implement SMS sending logic (Twilio, AWS SNS, etc.)
      console.log(`[SMS] Sending to ${recipient}: ${message}`);
      // Example with Twilio:
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: recipient,
      // });
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  async sendEmail(
    recipient: string,
    subject: string,
    html: string,
    attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
  ): Promise<void> {
    try {
      // Implement email sending logic (SendGrid, AWS SES, etc.)
      console.log(`[Email] Sending to ${recipient}: ${subject}`);
      // Example with SendGrid:
      // const msg = {
      //   to: recipient,
      //   from: process.env.SENDGRID_FROM_EMAIL,
      //   subject,
      //   html,
      //   attachments,
      // };
      // await sgMail.send(msg);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendIncidentAlert(
    recipients: NotificationRecipient[],
    incident: any
  ): Promise<void> {
    const message = `INCIDENT ALERT [${incident.severity.toUpperCase()}]: ${incident.title} at ${incident.location}`;

    for (const recipient of recipients) {
      if (recipient.type === 'sms') {
        await this.sendSMS(recipient.value, message);
      } else if (recipient.type === 'email') {
        const html = `
          <h2>Incident Alert</h2>
          <p><strong>Severity:</strong> ${incident.severity}</p>
          <p><strong>Title:</strong> ${incident.title}</p>
          <p><strong>Location:</strong> ${incident.location}</p>
          <p><strong>Description:</strong> ${incident.description}</p>
          <p><strong>Reported by:</strong> ${incident.reportedBy}</p>
        `;
        await this.sendEmail(recipient.value, `Incident Alert: ${incident.title}`, html);
      }
    }
  }

  async sendPayrollNotification(
    recipients: NotificationRecipient[],
    payrollData: any
  ): Promise<void> {
    const message = `Your payroll for ${payrollData.period} has been processed. Net Pay: GH₵${payrollData.netPay}`;

    for (const recipient of recipients) {
      if (recipient.type === 'sms') {
        await this.sendSMS(recipient.value, message);
      } else if (recipient.type === 'email') {
        const html = `
          <h2>Payroll Statement</h2>
          <p>Period: ${payrollData.period}</p>
          <p>Base Salary: GH₵${payrollData.baseSalary}</p>
          <p>Allowances: GH₵${payrollData.allowances}</p>
          <p>Deductions: GH₵${payrollData.deductions}</p>
          <p><strong>Net Pay: GH₵${payrollData.netPay}</strong></p>
        `;
        await this.sendEmail(recipient.value, `Payroll Statement: ${payrollData.period}`, html);
      }
    }
  }

  async sendShiftNotification(
    recipients: NotificationRecipient[],
    shift: any
  ): Promise<void> {
    const message = `New shift assignment: ${shift.postName} from ${shift.startTime} to ${shift.endTime}`;

    for (const recipient of recipients) {
      if (recipient.type === 'sms') {
        await this.sendSMS(recipient.value, message);
      } else if (recipient.type === 'email') {
        const html = `
          <h2>Shift Assignment</h2>
          <p>Post: ${shift.postName}</p>
          <p>Date: ${shift.date}</p>
          <p>Start Time: ${shift.startTime}</p>
          <p>End Time: ${shift.endTime}</p>
          <p>Location: ${shift.location}</p>
        `;
        await this.sendEmail(recipient.value, 'Shift Assignment Notification', html);
      }
    }
  }
}

export default CommunicationService;
