import { Test, TestingModule } from '@nestjs/testing';
import { PeakFareService } from './peak-fare.service';

describe('PeakFareService', () => {
    let service: PeakFareService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PeakFareService],
        }).compile();

        service = module.get<PeakFareService>(PeakFareService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
