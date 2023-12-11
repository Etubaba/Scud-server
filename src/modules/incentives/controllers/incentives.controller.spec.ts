import { Test, TestingModule } from '@nestjs/testing';
import { IncentivesController } from './incentives.controller';

describe('IncentivesController', () => {
    let controller: IncentivesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [IncentivesController],
        }).compile();

        controller = module.get<IncentivesController>(IncentivesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
