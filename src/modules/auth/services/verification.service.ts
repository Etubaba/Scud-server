import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpType, Provider } from '@prisma/client';
import { MailService } from '../../notifications/services/mail.service';
import { OtpService } from '../../notifications/services/otp.service';
import { SmsService } from '../../notifications/services/sms.service';
import { UsersService } from '../../users/users.service';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import * as moment from 'moment';

@Injectable()
export class VerificationService {
    constructor(
        private readonly otpService: OtpService,
        private readonly mailService: MailService,
        private readonly smsService: SmsService,
        @Inject(forwardRef(() => UsersService))
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
    ) {}

    async sendOtp(
        userId: number,
        otpType?: OtpType,
        provider?: Provider,
    ): Promise<object | any> {
        const user = await this.userService.findOne(userId);
        const providerInUse = provider || user.provider;
        const type = otpType || <OtpType>user.provider;
        const { token, expiry } = await this.otpService.create(user.id, type);
        const delay = Math.round(
            moment.duration(moment(expiry).diff(moment())).asMinutes(),
        );
        const isProductionEnvironment =
            this.configService.get('app.environment') === 'production';
        try {
            if (providerInUse == Provider.email) {
                isProductionEnvironment &&
                    (await this.mailService.send(
                        user.email,
                        'OTP Verification',
                        'verify-mail',
                        {
                            token,
                            email: user.email,
                            otpType,
                            delay,
                        },
                    ));
            }

            if (providerInUse == Provider.phone) {
                const body = `Your OTP for ${type.toUpperCase()} is ${token}`;
                isProductionEnvironment &&
                    (await this.smsService.send(user.phone, body));
            }
        } catch (error) {
            console.error(error);
            return {
                sent: false,
                token: null,
                message: 'Could not send verification code. Please try again',
            };
        }

        return {
            sent: true,
            token: !isProductionEnvironment && token,
            message: 'Verification code successfully sent',
        };
    }

    async verifyOtp(
        userId: number,
        verifyOtpDto: VerifyOtpDto,
    ): Promise<object> {
        const user = await this.userService.findOne(userId);
        const type = verifyOtpDto.otp_type || user.provider;
        const verified = await this.otpService.verify(
            userId,
            verifyOtpDto.otp,
            <OtpType>type,
        );
        if (
            type == OtpType.register ||
            type == OtpType.phone ||
            type == OtpType.email
        ) {
            const data = new Object();
            switch (user.provider) {
                case Provider.phone:
                    data['phone_verified'] = true;
                    break;
                case Provider.email:
                    data['email_verified'] = true;
                default:
                    break;
            }
            await this.userService.updateFields(userId, data);
        }
        return {
            verified,
        };
    }
}
