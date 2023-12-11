import { Test, TestingModule } from '@nestjs/testing';
import { OweNotificationSettingsService } from './owe-notification-settings.service';

describe('OweNotificationSettingsService', () => {
    let service: OweNotificationSettingsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [OweNotificationSettingsService],
        }).compile();

        service = module.get<OweNotificationSettingsService>(
            OweNotificationSettingsService,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
