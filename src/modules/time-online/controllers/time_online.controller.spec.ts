import { Test, TestingModule } from '@nestjs/testing';
import { TimeOnlineController } from './time_online.controller';

describe('TimeOnlineController', () => {
    let controller: TimeOnlineController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TimeOnlineController],
        }).compile();

        controller = module.get<TimeOnlineController>(TimeOnlineController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
