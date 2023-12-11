import { Test, TestingModule } from '@nestjs/testing';
import { TimeOnlineService } from './time_online.service';

describe('TimeOnlineService', () => {
    let service: TimeOnlineService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TimeOnlineService],
        }).compile();

        service = module.get<TimeOnlineService>(TimeOnlineService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
