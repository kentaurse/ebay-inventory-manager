import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { User } from '../../models/User';
import { NotificationPreference } from '../../models/NotificationPreference';
import { Logger } from '../../utils/logger';

interface NotificationPayload {
  type: 'LOW_STOCK' | 'PRICE_CHANGE' | 'ERROR';
  title: string;
  message: string;
  itemId?: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable()
export class NotificationService {
  private readonly emailTransporter;
  private readonly notificationPreferenceRepository;

  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.notificationPreferenceRepository = AppDataSource.getRepository(NotificationPreference);
  }

  async sendLowStockAlert(data: {
    itemId: string;
    title: string;
    currentStock: number;
    minimumStock: number;
  }) {
    const notification: NotificationPayload = {
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      message: `Item "${data.title}" (${data.itemId}) has low stock: ${data.currentStock} units remaining (minimum: ${data.minimumStock})`,
      itemId: data.itemId,
      urgency: 'HIGH'
    };

    await this.processNotification(notification);
  }

  async sendPriceChangeAlert(data: {
    itemId: string;
    title: string;
    oldPrice: number;
    newPrice: number;
    reason: string;
  }) {
    const notification: NotificationPayload = {
      type: 'PRICE_CHANGE',
      title: 'Price Change Alert',
      message: `Price changed for "${data.title}" from $${data.oldPrice} to $${data.newPrice}. Reason: ${data.reason}`,
      itemId: data.itemId,
      urgency: 'MEDIUM'
    };

    await this.processNotification(notification);
  }

  private async processNotification(notification: NotificationPayload) {
    try {
      const preferences = await this.notificationPreferenceRepository.find({
        relations: ['user']
      });

      for (const pref of preferences) {
        if (this.shouldNotify(pref, notification)) {
          await this.sendNotification(pref.user, notification);
        }
      }
    } catch (error) {
      Logger.error('Failed to process notification:', error);
    }
  }

  private shouldNotify(pref: NotificationPreference, notification: NotificationPayload): boolean {
    if (!pref.enabled) return false;

    switch (notification.type) {
      case 'LOW_STOCK':
        return pref.lowStockAlerts;
      case 'PRICE_CHANGE':
        return pref.priceChangeAlerts;
      case 'ERROR':
        return pref.errorAlerts;
      default:
        return false;
    }
  }

  private async sendNotification(user: User, notification: NotificationPayload) {
    // メール通知
    if (user.email) {
      await this.sendEmail(user.email, notification);
    }

    // Webhook通知（設定されている場合）
    if (user.webhookUrl) {
      await this.sendWebhook(user.webhookUrl, notification);
    }
  }

  private async sendEmail(email: string, notification: NotificationPayload) {
    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: `[${notification.type}] ${notification.title}`,
        text: notification.message,
        html: this.generateEmailHtml(notification)
      });
    } catch (error) {
      Logger.error('Failed to send email notification:', error);
    }
  }

  private async sendWebhook(webhookUrl: string, notification: NotificationPayload) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      Logger.error('Failed to send webhook notification:', error);
    }
  }

  private generateEmailHtml(notification: NotificationPayload): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: ${this.getUrgencyColor(notification.urgency)};">
          ${notification.title}
        </h2>
        <p style="font-size: 16px; line-height: 1.5;">
          ${notification.message}
        </p>
        ${notification.itemId ? `
          <p>
            <a href="${process.env.FRONTEND_URL}/items/${notification.itemId}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Item
            </a>
          </p>
        ` : ''}
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from your eBay Inventory Manager
        </p>
      </div>
    `;
  }

  private getUrgencyColor(urgency: NotificationPayload['urgency']): string {
    switch (urgency) {
      case 'HIGH':
        return '#dc3545';
      case 'MEDIUM':
        return '#ffc107';
      case 'LOW':
        return '#28a745';
      default:
        return '#007bff';
    }
  }
} 