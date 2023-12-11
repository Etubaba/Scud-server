import { Module } from '@nestjs/common';
import { FareModule } from '../fare/fare.module';
import { FareService } from '../fare/services/fare.service';
import { LocationModule } from '../location/location.module';
import { LocationServices } from '../location/services/location.service';
import { RedisRepositoryModule } from '../redis/redis-repo.module';
import { RidesGateway } from './gateways/ride.gateway';
import { MapStore } from './helpers/map.store';
import { RidesGatewayService } from './services/ride.gateway.service';
import { TripsService } from './services/trips.service';
import { TripsController } from './controllers/trips.controller';
import { TimeOnlineModule } from '../time-online/time-online.module';
import { AcceptanceRateService } from './services/acceptance-rate/acceptance-rate.service';
import { AcceptanceRateController } from './controllers/acceptance-rate/acceptance-rate.controller';
import { VehicleModule } from '../vehicle/vehicle.module';

@Module({
    imports: [
        RedisRepositoryModule,
        FareModule,
        LocationModule,
        TimeOnlineModule,
        VehicleModule,
    ],
    providers: [
        RidesGatewayService,
        RidesGateway,
        FareService,
        LocationServices,
        MapStore,
        TripsService,
        AcceptanceRateService,
    ],
    exports: [TripsService],
    controllers: [TripsController, AcceptanceRateController],
})
export class RidesModule {}
