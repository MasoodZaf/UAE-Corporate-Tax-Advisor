/**
 * Email Service
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';
import { logger } from '../config/logger';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('Email service connected successfully');
    } catch (error) {
      logger.error('Email service connection failed:', error);
    }
  }

  /**
   * Send email
   */
  public async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string,
    attachments?: any[]
  ): Promise<void> {
    try {
      const mailOptions = {
        from: config.email.from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        attachments,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}`);
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send email verification
   */
  public async sendEmailVerification(
    email: string,
    firstName: string,
    token: string
  ): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const template = this.getEmailVerificationTemplate(firstName, verificationUrl);
    
    await this.sendEmail(
      email,
      template.subject,
      template.html,
      template.text
    );
  }

  /**
   * Send password reset email
   */
  public async sendPasswordReset(
    email: string,
    firstName: string,
    token: string
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const template = this.getPasswordResetTemplate(firstName, resetUrl);
    
    await this.sendEmail(
      email,
      template.subject,
      template.html,
      template.text
    );
  }

  /**
   * Send welcome email
   */
  public async sendWelcome(
    email: string,
    firstName: string,
    companyName?: string
  ): Promise<void> {
    const template = this.getWelcomeTemplate(firstName, companyName);
    
    await this.sendEmail(
      email,
      template.subject,
      template.html,
      template.text
    );
  }

  /**
   * Send tax filing reminder
   */
  public async sendFilingReminder(
    email: string,
    firstName: string,
    companyName: string,
    dueDate: Date,
    daysRemaining: number
  ): Promise<void> {
    const template = this.getFilingReminderTemplate(
      firstName,
      companyName,
      dueDate,
      daysRemaining
    );
    
    await this.sendEmail(
      email,
      template.subject,
      template.html,
      template.text
    );
  }

  /**
   * Send compliance alert
   */
  public async sendComplianceAlert(
    email: string,
    firstName: string,
    companyName: string,
    alertMessage: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    const template = this.getComplianceAlertTemplate(
      firstName,
      companyName,
      alertMessage,
      severity
    );
    
    await this.sendEmail(
      email,
      template.subject,
      template.html,
      template.text
    );
  }

  /**
   * Send monthly report
   */
  public async sendMonthlyReport(
    email: string,
    firstName: string,
    companyName: string,
    reportData: any,
    attachments?: any[]
  ): Promise<void> {
    const template = this.getMonthlyReportTemplate(
      firstName,
      companyName,
      reportData
    );
    
    await this.sendEmail(
      email,
      template.subject,
      template.html,
      template.text,
      attachments
    );
  }

  // Email Templates

  private getEmailVerificationTemplate(firstName: string, verificationUrl: string): EmailTemplate {
    return {
      subject: 'Verify Your Email - TaxMaster AI',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">TaxMaster AI</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">UAE Corporate Tax Compliance</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Welcome ${firstName}!</h2>
            
            <p>Thank you for registering with TaxMaster AI. To complete your account setup, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
              This verification link will expire in 24 hours. If you didn't create an account with TaxMaster AI, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2025 TaxMaster AI. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome ${firstName}!
        
        Thank you for registering with TaxMaster AI. To complete your account setup, please verify your email address by visiting:
        
        ${verificationUrl}
        
        This verification link will expire in 24 hours. If you didn't create an account with TaxMaster AI, please ignore this email.
        
        © 2025 TaxMaster AI. All rights reserved.
      `
    };
  }

  private getPasswordResetTemplate(firstName: string, resetUrl: string): EmailTemplate {
    return {
      subject: 'Reset Your Password - TaxMaster AI',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">TaxMaster AI</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName},</h2>
            
            <p>We received a request to reset your password for your TaxMaster AI account. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>Security Note:</strong> This reset link will expire in 24 hours for your security. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2025 TaxMaster AI. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${firstName},
        
        We received a request to reset your password for your TaxMaster AI account. Visit the link below to create a new password:
        
        ${resetUrl}
        
        This reset link will expire in 24 hours for your security. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        
        © 2025 TaxMaster AI. All rights reserved.
      `
    };
  }

  private getWelcomeTemplate(firstName: string, companyName?: string): EmailTemplate {
    return {
      subject: 'Welcome to TaxMaster AI - Your UAE Tax Compliance Journey Begins',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to TaxMaster AI</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to TaxMaster AI!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your UAE Tax Compliance Made Simple</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName}!</h2>
            
            <p>Welcome to TaxMaster AI! ${companyName ? `We're excited to help ${companyName}` : 'We\'re excited to help you'} navigate UAE corporate tax compliance with ease and confidence.</p>
            
            <div style="background: white; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #28a745;">🚀 Get Started in 3 Easy Steps:</h3>
              <ol style="padding-left: 20px;">
                <li><strong>Set up your company profile</strong> - Add your trade license and business details</li>
                <li><strong>Connect your bank accounts</strong> - Import transactions automatically</li>
                <li><strong>Upload your documents</strong> - Let our AI categorize and process them</li>
              </ol>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">✨ What You Can Do:</h3>
              <ul style="list-style-type: none; padding-left: 0;">
                <li style="padding: 5px 0;">📊 Automated tax calculations and compliance monitoring</li>
                <li style="padding: 5px 0;">🤖 AI-powered expense categorization</li>
                <li style="padding: 5px 0;">📄 Document management with OCR processing</li>
                <li style="padding: 5px 0;">📈 Real-time financial insights and reports</li>
                <li style="padding: 5px 0;">⚠️ Compliance alerts and deadline reminders</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Your Journey</a>
            </div>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
              Need help getting started? Our support team is here to assist you at <a href="mailto:support@taxmaster.ai" style="color: #28a745;">support@taxmaster.ai</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2025 TaxMaster AI. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };
  }

  private getFilingReminderTemplate(
    firstName: string,
    companyName: string,
    dueDate: Date,
    daysRemaining: number
  ): EmailTemplate {
    const urgencyColor = daysRemaining <= 7 ? '#dc3545' : daysRemaining <= 30 ? '#ffc107' : '#28a745';
    const dueDateStr = dueDate.toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      subject: `⏰ Tax Filing Due in ${daysRemaining} Days - ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${urgencyColor}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 28px;">⏰ Filing Reminder</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">TaxMaster AI</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName},</h2>
            
            <p>This is a reminder that <strong>${companyName}</strong>'s corporate tax filing is due in <strong style="color: ${urgencyColor};">${daysRemaining} days</strong>.</p>
            
            <div style="background: white; border-left: 4px solid ${urgencyColor}; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: ${urgencyColor};">Filing Details:</h3>
              <p><strong>Due Date:</strong> ${dueDateStr}</p>
              <p><strong>Days Remaining:</strong> ${daysRemaining} days</p>
              <p><strong>Company:</strong> ${companyName}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/filings" style="background: ${urgencyColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Review & Submit Filing</a>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getComplianceAlertTemplate(
    firstName: string,
    companyName: string,
    alertMessage: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): EmailTemplate {
    const severityColors = {
      low: '#17a2b8',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };

    const severityIcons = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🔸',
      critical: '🚨'
    };

    return {
      subject: `${severityIcons[severity]} Compliance Alert - ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${severityColors[severity]}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 28px;">${severityIcons[severity]} Compliance Alert</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">TaxMaster AI</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName},</h2>
            
            <p>We have detected a <strong style="color: ${severityColors[severity]}; text-transform: uppercase;">${severity}</strong> priority compliance issue for <strong>${companyName}</strong>:</p>
            
            <div style="background: white; border-left: 4px solid ${severityColors[severity]}; padding: 20px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">${alertMessage}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/compliance" style="background: ${severityColors[severity]}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Compliance Dashboard</a>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getMonthlyReportTemplate(firstName: string, companyName: string, reportData: any): EmailTemplate {
    return {
      subject: `📊 Monthly Tax Report - ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 28px;">📊 Monthly Report</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${companyName}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName},</h2>
            
            <p>Here's your monthly tax compliance summary for <strong>${companyName}</strong>:</p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #6f42c1;">📈 Key Metrics:</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <p><strong>Total Income:</strong><br>AED ${reportData.totalIncome?.toLocaleString() || '0'}</p>
                  <p><strong>Total Expenses:</strong><br>AED ${reportData.totalExpenses?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p><strong>Tax Liability:</strong><br>AED ${reportData.taxLiability?.toLocaleString() || '0'}</p>
                  <p><strong>Compliance Score:</strong><br>${reportData.complianceScore || 'N/A'}%</p>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/reports" style="background: #6f42c1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Detailed Report</a>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
}