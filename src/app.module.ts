import { HttpException, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configs';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtGuard } from './modules/auth/guards/jwt.guard';
import { DatabaseModule } from './database/database.module';
import { PermissionsGuard } from './modules/auth/guards/permission.guard';
import { VerificationGuard } from './modules/auth/guards/verification.guard';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { LicenseModule } from './modules/license/license.module';
import { PaymentModule } from './modules/payment/payment.module';
// import { ReferralModule } from './modules/referral/referral.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AccountManagerModule } from './modules/account-manager/account-manager.module';
import { CancelReasonModule } from './modules/cancel-reason/cancel-reason.module';
import { LocationModule } from './modules/location/location.module';
import { FaqModule } from './modules/faq/faq.module';
import { FareModule } from './modules/fare/fare.module';
import { IncentivesModule } from './modules/incentives/incentives.module';
import { PromoModule } from './modules/promo/promo.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CronModule } from './modules/cron/cron.module';
import { RedisRepositoryModule } from './modules/redis/redis-repo.module';
import { RidesModule } from './modules/rides/rides.module';
import { StatsModule } from './modules/stats/stats.module';
import { GoogleMapsApiModule } from './modules/google-maps-api/google-maps-api.module';
import { SentryModule } from './modules/sentry/sentry.module';
import { SentryInterceptor } from '@ntegral/nestjs-sentry';
import { ChatModule } from './modules/chat/chat.module';
import { SupportModule } from './modules/support/support.module';
import { DiscountModule } from './modules/discount/discount.module';
import { ReviewModule } from './modules/review/review.module';
import { TimeOnlineModule } from './modules/time-online/time-online.module';
import { HttpModule } from '@nestjs/axios';
import { MailTemplateModule } from './modules/mail-template/mail-template.module';
import { LegalModule } from './modules/legal/legal.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
        }),
        UsersModule,
        AuthModule,
        HealthModule,
        DatabaseModule,
        VehicleModule,
        LicenseModule,
        PaymentModule,
        // ReferralModule,
        SettingsModule,
        AccountManagerModule,
        FareModule,
        CancelReasonModule,
        IncentivesModule,
        LocationModule,
        PromoModule,
        FaqModule,
        RedisRepositoryModule,
        NotificationsModule,
        CronModule,
        RidesModule,
        StatsModule,
        ReviewModule,
        GoogleMapsApiModule,
        SentryModule,
        ChatModule,
        RedisRepositoryModule,
        SupportModule,
        DiscountModule,
        TimeOnlineModule,
        MailTemplateModule,
        LegalModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: JwtGuard,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionsGuard,
        },
        {
            provide: APP_GUARD,
            useClass: VerificationGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useFactory: () =>
                new SentryInterceptor({
                    filters: [
                        {
                            type: HttpException,
                            filter: (exception: HttpException) =>
                                500 > exception.getStatus(), // Only report 500 errors
                        },
                    ],
                }),
        },
        // {
        //     provide: APP_GUARD,
        //     useClass: InfoCompleteGaurd,
        // },
    ],
})
export class AppModule {}
