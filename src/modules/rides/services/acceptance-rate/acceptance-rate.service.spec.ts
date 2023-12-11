import { Test, TestingModule } from '@nestjs/testing';
import { AcceptanceRateService } from './acceptance-rate.service';

describe('AcceptanceRateService', () => {
    let service: AcceptanceRateService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AcceptanceRateService],
        }).compile();

        service = module.get<AcceptanceRateService>(AcceptanceRateService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
