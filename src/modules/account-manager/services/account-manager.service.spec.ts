import { Test, TestingModule } from '@nestjs/testing';
import { AccountManagerService } from './account-manager.service';

describe('AccountManagerService', () => {
    let service: AccountManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AccountManagerService],
        }).compile();

        service = module.get<AccountManagerService>(AccountManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
