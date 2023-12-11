import { Module, Global } from '@nestjs/common';
import { CitiesController } from './controllers/cities.controller';
import { CountriesController } from './controllers/countries.controller';
import { LocationController } from './controllers/location.controller';
import { StatesController } from './controllers/states.controller';
import { CitiesService } from './services/cities.service';
import { CountriesService } from './services/countries.service';
import { LocationServices } from './services/location.service';
import { StatesService } from './services/states.service';

@Global()
@Module({
    controllers: [
        CountriesController,
        StatesController,
        CitiesController,
        LocationController,
    ],
    providers: [
        CountriesService,
        StatesService,
        CitiesService,
        LocationServices,
    ],
    exports: [CountriesService, StatesService, CitiesService, LocationServices],
})
export class LocationModule {}
