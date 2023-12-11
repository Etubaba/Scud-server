import { Client } from '@googlemaps/google-maps-services-js';
import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleMapsApiService } from './services/google-maps-api.service';

@Global()
@Module({
    providers: [GoogleMapsApiService],
    exports: [GoogleMapsApiService],
})
export class GoogleMapsApiModule {}
