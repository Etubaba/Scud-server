import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controller/notification.controller';
import { OrmService } from 'src/database/orm.service';
import { SettingsModule } from '../settings/settings.module';
import { CronModule } from '../cron/cron.module';
import { SmsService } from './services/sms.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { TwilioModule } from 'nestjs-twilio';
import { MailService } from './services/mail.service';
import { OtpService } from './services/otp.service';
import { cwd } from 'process';
import * as AWS from '@aws-sdk/client-ses';

@Module({
    imports: [
        SettingsModule,
        CronModule,
        TwilioModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                accountSid: config.get('twilio.account_sid'),
                authToken: config.get('twilio.auth_token'),
            }),
            inject: [ConfigService],
        }),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                transport: {
                    SES: {
                        ses: new AWS.SESClient({
                            apiVersion: config.get('aws.api_version'),
                            region: config.get('aws.region'),
                        }),
                        aws: AWS,
                    },
                },
                defaults: {
                    from: config.get('mail.from'),
                },
                template: {
                    dir: join(cwd(), './dist/mail-templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: false,
                    },
                },
            }),
            inject: [ConfigService],
        }),
        ConfigModule,
    ],
    providers: [
        NotificationService,
        OrmService,
        SmsService,
        MailService,
        OtpService,
    ],
    controllers: [NotificationController],
    exports: [
        NotificationService,
        OrmService,
        SmsService,
        MailService,
        OtpService,
    ],
})
export class NotificationsModule {}
