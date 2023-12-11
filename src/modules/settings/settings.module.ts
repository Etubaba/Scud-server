import { Global, Module } from '@nestjs/common';
import { SettingsController } from './controllers/settings.controller';
import { SettingsService } from './services/settings.service';
import { OweNotificationSettingsService } from './services/owe-notification-settings.service';

@Global()
@Module({
    controllers: [SettingsController],
    providers: [SettingsService, OweNotificationSettingsService],
    exports: [SettingsService, OweNotificationSettingsService],
})
export class SettingsModule {}
