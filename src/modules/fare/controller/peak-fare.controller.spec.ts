import { Test, TestingModule } from '@nestjs/testing';
import { PeakFareController } from './peak-fare.controller';

describe('PeakFareController', () => {
    let controller: PeakFareController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PeakFareController],
        }).compile();

        controller = module.get<PeakFareController>(PeakFareController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
