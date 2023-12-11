import { Test, TestingModule } from '@nestjs/testing';
import { IncentivesService } from './incentives.service';

describe('IncentivesService', () => {
    let service: IncentivesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [IncentivesService],
        }).compile();

        service = module.get<IncentivesService>(IncentivesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
