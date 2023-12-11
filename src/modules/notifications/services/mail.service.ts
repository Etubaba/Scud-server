import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}

    async send(
        email: string,
        subject: string,
        template: string,
        context: object | null,
    ) {
        try {
            return this.mailerService.sendMail({
                to: email,
                subject,
                template,
                context,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async sendWithoutTemplate(email: string, subject: string, body: string) {
        try {
            return this.mailerService.sendMail({
                to: email,
                subject,
                html: body,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async sendMany(emails: string[], subject: string, body: string) {
        const promises = emails.map((email) =>
            this.sendWithoutTemplate(email, subject, body),
        );
        return Promise.all(promises);
    }
}
