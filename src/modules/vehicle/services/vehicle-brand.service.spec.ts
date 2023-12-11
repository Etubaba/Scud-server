import { Test, TestingModule } from '@nestjs/testing';
import { VehicleBrandService } from './vehicle-brand.service';

describe('VehicleBrandService', () => {
    let service: VehicleBrandService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [VehicleBrandService],
        }).compile();

        service = module.get<VehicleBrandService>(VehicleBrandService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
