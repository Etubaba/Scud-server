import { Test, TestingModule } from '@nestjs/testing';
import { VehicleBrandController } from './vehicle-brand.controller';

describe('VehicleBrandController', () => {
    let controller: VehicleBrandController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VehicleBrandController],
        }).compile();

        controller = module.get<VehicleBrandController>(VehicleBrandController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
