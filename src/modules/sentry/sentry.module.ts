import { Module } from '@nestjs/common';
import { SentryModule as SentryModuleConfig } from '@ntegral/nestjs-sentry';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeverityLevel } from '@sentry/types';

@Module({
    imports: [
        SentryModuleConfig.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                dsn: config.get('sentry.dsn'),
                debug: config.get('sentry.debug'),
                environment: config.get('sentry.environment'),
                release: config.get('sentry.release'),
                logLevel: 'debug' as SeverityLevel,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class SentryModule {}
