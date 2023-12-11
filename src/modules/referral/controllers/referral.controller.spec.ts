import { Test, TestingModule } from '@nestjs/testing';
import { ReferralService } from '../services/referral.service';
import { ReferralController } from './referral.controller';

describe('ReferralController', () => {
    let controller: ReferralController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReferralController],
            providers: [ReferralService],
        }).compile();

        controller = module.get<ReferralController>(ReferralController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
