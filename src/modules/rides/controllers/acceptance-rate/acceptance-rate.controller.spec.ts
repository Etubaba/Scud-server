import { Test, TestingModule } from '@nestjs/testing';
import { AcceptanceRateController } from './acceptance-rate.controller';

describe('AcceptanceRateController', () => {
    let controller: AcceptanceRateController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AcceptanceRateController],
        }).compile();

        controller = module.get<AcceptanceRateController>(
            AcceptanceRateController,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
