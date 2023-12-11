import { Test, TestingModule } from '@nestjs/testing';
import { RedisRepositoryService } from './redis-repository.service';

describe('RedisRepositoryService', () => {
    let service: RedisRepositoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RedisRepositoryService],
        }).compile();

        service = module.get<RedisRepositoryService>(RedisRepositoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
