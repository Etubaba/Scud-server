import { Module } from '@nestjs/common';
import { GoogleMapsApiModule } from '../google-maps-api/google-maps-api.module';
import { SettingsService } from '../settings/services/settings.service';
import { SettingsModule } from '../settings/settings.module';
import { FareController } from './controller/fare.controller';
import { NightFareController } from './controller/night-fare.controller';
import { PeakFareController } from './controller/peak-fare.controller';
import { FareService } from './services/fare.service';
import { NightFareService } from './services/night-fare.service';
import { PeakFareService } from './services/peak-fare.service';

@Module({
    controllers: [FareController, NightFareController, PeakFareController],
    providers: [
        FareService,
        NightFareService,
        PeakFareService,
        SettingsService,
    ],
    imports: [SettingsModule, GoogleMapsApiModule],
})
export class FareModule {}
