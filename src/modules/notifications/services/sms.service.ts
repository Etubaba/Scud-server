import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class SmsService {
    constructor(
        private readonly twilioService: TwilioService,
        private readonly configService: ConfigService,
    ) {}

    async send(to: string, body: string): Promise<any> {
        try {
            const smsObject = await this.twilioService.client.messages.create({
                from: this.configService.get('twilio.phone_number'),
                to,
                body,
            });
            return smsObject;
        } catch (error) {
            throw new HttpException(
                'Error occurred sending sms',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
    async sendMany(numbers: string[], body: string) {
        const promises = numbers.map((email) => this.send(email, body));

        return Promise.all(promises);
    }
}
