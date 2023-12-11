import { Module } from '@nestjs/common';
import { VehicleService } from './services/vehicle.service';
import { VehicleController } from './controllers/vehicle.controller';
import { UsersService } from '../users/users.service';
import { MediaModule } from '../media/media.module';
import { VehicleBrandController } from './controllers/vehicle-brand.controller';
import { VehicleBrandService } from './services/vehicle-brand.service';
import { VehicleTypeService } from './services/vehicle-type.service';
import { VehicleTypeController } from './controllers/vehicle-type.controlller';

@Module({
    imports: [MediaModule],
    controllers: [
        VehicleController,
        VehicleBrandController,
        VehicleTypeController,
    ],
    providers: [
        VehicleService,
        UsersService,
        VehicleBrandService,
        VehicleTypeService,
    ],
    exports: [VehicleService, VehicleTypeService],
})
export class VehicleModule {}
