import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';
import * as moment from 'moment';
import { OtpType } from '@prisma/client';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
    constructor(
        private readonly ormService: OrmService,
        private readonly settingService: SettingsService,
        private readonly configService: ConfigService,
    ) {}

    async create(userId: number, type: OtpType) {
        const [delayTimeSetting, activeOtp] = await Promise.all([
            this.settingService.get('OTP_DELAY_TIME'),
            this.ormService.otp.findFirst({
                where: {
                    user_id: userId,
                    used: false,
                },
                select: {
                    created_at: true,
                    token: true,
                },
                orderBy: {
                    created_at: 'desc',
                },
            }),
        ]);
        const delayTime = Number(delayTimeSetting.value);

        if (activeOtp) {
            const lastOtpTime = moment(activeOtp.created_at);
            const timeSinceLastOtp = moment
                .duration(moment().diff(lastOtpTime))
                .asMinutes();
            const timeLeft = (delayTime - timeSinceLastOtp).toFixed(2);
            const isProductionEnvironment =
                this.configService.get('app.environment') === 'production';
            /** This is sensitive. Only viewable in local environment */
            const sensitiveString =
                (!isProductionEnvironment &&
                    ` Last requested OTP:${activeOtp.token}`) ||
                '';
            if (timeSinceLastOtp < delayTime) {
                throw new HttpException(
                    `Please wait for ${timeLeft} minutes before generating a new OTP.${sensitiveString}`,
                    HttpStatus.BAD_REQUEST,
                );
            }
        }

        await this.clearOtps(userId, type);

        const otp = await this.ormService.otp.create({
            data: {
                type,
                user_id: userId,
                token: await this.genRandomToken(),
                expiry: moment().add(30, 'minutes').toDate(),
            },
        });

        if (!otp) {
            throw new HttpException(
                'An error occurred',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return otp;
    }

    private async clearOtps(userId: number, type: OtpType) {
        await this.ormService.otp.deleteMany({
            where: {
                type: type,
                user_id: userId,
            },
        });
    }

    async verify(
        userId: number,
        token: string,
        otpType: OtpType,
    ): Promise<boolean> {
        const otp = await this.ormService.otp.findFirst({
            where: {
                token,
                user_id: userId,
                used: false,
            },
            select: {
                type: true,
                expiry: true,
                id: true,
            },
        });

        if (!otp || otp.type !== otpType) {
            throw new HttpException('OTP is incorrect', HttpStatus.BAD_REQUEST);
        }
        if (moment(otp.expiry).isSameOrBefore(Date.now())) {
            throw new HttpException(
                'OTP has expired. Please request a new one',
                HttpStatus.BAD_REQUEST,
            );
        }
        const updated = await this.ormService.otp.update({
            data: {
                used: true,
            },
            where: {
                id: otp.id,
            },
        });

        return updated ? true : false;
    }

    private async genRandomToken(): Promise<string> {
        const token = [...Array(6)]
            .map(() => Math.floor(Math.random() * 9))
            .join('');
        const exist = await this.ormService.otp.findFirst({
            where: {
                token,
            },
        });
        if (exist) {
            return await this.genRandomToken();
        }
        return token;
    }
}
