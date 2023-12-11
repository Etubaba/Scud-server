import {
    Client,
    LatLng,
    TravelMode,
} from '@googlemaps/google-maps-services-js';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Coordinate } from 'src/modules/location/dtos/create-location.dto';

@Injectable()
export class GoogleMapsApiService {
    private readonly client: Client;

    constructor(private readonly configService: ConfigService) {
        this.client = new Client({});
    }

    async distanceMatrix(pickup: Coordinate, destination: Coordinate) {
        try {
            const res = await this.client.distancematrix({
                params: {
                    origins: [this.toLatLng(pickup)],
                    destinations: [this.toLatLng(destination)],
                    mode: TravelMode.driving,
                    key: this.configService.get('google.api_key'),
                },
            });
            if (res.status === 200) {
                return res.data;
            }
            return null;
        } catch (error) {
            throw new HttpException('error occured', HttpStatus.BAD_REQUEST, {
                cause: error,
            });
        }
    }

    toLatLng(coordinates: Coordinate): LatLng {
        return {
            latitude: +coordinates.latitude,
            longitude: +coordinates.longitude,
        };
    }
}
