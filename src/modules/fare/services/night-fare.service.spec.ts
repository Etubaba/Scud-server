import { Test, TestingModule } from '@nestjs/testing';
import { NightFareService } from './night-fare.service';

describe('NightFareService', () => {
    let service: NightFareService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [NightFareService],
        }).compile();

        service = module.get<NightFareService>(NightFareService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
