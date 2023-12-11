import { Test, TestingModule } from '@nestjs/testing';
import { NightFareController } from './night-fare.controller';

describe('NightFareController', () => {
    let controller: NightFareController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NightFareController],
        }).compile();

        controller = module.get<NightFareController>(NightFareController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
