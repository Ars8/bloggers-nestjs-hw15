import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailManager {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(to: string, subject: string, html: string) {
    return this.mailerService.sendMail({
      to,
      from: `"Bloggers social media" <noreply.notifycations@gmail.com>`,
      subject,
      html,
    });
  }
  async sendRegistrationEmail(to: string, confirmationCode: string) {
    const subject = 'Registration';
    const html = `<p style="white-space: pre-line;">Thank you!\n You have successfully registered!\n Confirm your email: <a href="https://somesite.com/confirm-email?code=${confirmationCode}">Confirm</a></p>`;
    return this.sendMail(to, subject, html);
  }
}
