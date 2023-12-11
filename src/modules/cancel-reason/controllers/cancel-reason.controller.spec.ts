import { Test, TestingModule } from '@nestjs/testing';
import { CancelReasonController } from './cancel-reason.controller';

describe('CancelReasonController', () => {
    let controller: CancelReasonController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CancelReasonController],
        }).compile();

        controller = module.get<CancelReasonController>(CancelReasonController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
