import { UpdateManySettings } from './../dto/update-many-settings.dto';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
} from '@nestjs/common';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { UpdateOweNotification } from '../dto/update-owe-notification.dto';
import { UpdateSettings } from '../dto/update-settings.dto';
import { OweNotificationSettingsService } from '../services/owe-notification-settings.service';
import { SettingsService } from '../services/settings.service';

@Controller('settings')
export class SettingsController {
    constructor(
        private readonly settingsService: SettingsService,
        private readonly oweNotificationSettings: OweNotificationSettingsService,
    ) {}

    @Patch()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-settings')
    update(@Body() dto: UpdateSettings) {
        return this.settingsService.update(dto);
    }
    @Patch('/many')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-settings')
    updateMany(@Body() dto: UpdateManySettings) {
        return this.settingsService.updateMany(dto);
    }
    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-settings')
    list() {
        return this.settingsService.list();
    }

    @Patch('/owe')
    @Permissions('update-settings')
    updateOweNotificationSettings(@Body() dto: UpdateOweNotification) {
        return this.oweNotificationSettings.update(dto);
    }

    @Get('/owe')
    @Permissions('browse-settings')
    listOweNotificationSettings() {
        return this.oweNotificationSettings.list();
    }
}
