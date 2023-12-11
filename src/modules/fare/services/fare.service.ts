import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Fare } from '@prisma/client';
import { Request } from 'express';
import * as moment from 'moment';

import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { GoogleMapsApiService } from 'src/modules/google-maps-api/services/google-maps-api.service';
import { Coordinate } from 'src/modules/location/dtos/create-location.dto';
import { CreateFareDto } from '../dto/create-fare.dto';
import { CalculateFareDto } from '../dto/calculate-fare.dto';
import { UpdateFareDto } from '../dto/update-fare.dto';
import { Status } from '@googlemaps/google-maps-services-js';
import { LocationServices } from 'src/modules/location/services/location.service';

@Injectable()
export class FareService {
    model: string = 'fare';
    constructor(
        private readonly ormService: OrmService,
        private readonly paginationService: PaginationService,
        private readonly googleMapsApi: GoogleMapsApiService,
        private readonly locationsService: LocationServices,
    ) {}

    async create(dto: CreateFareDto) {
        return await this.ormService.fare.create({
            data: {
                capacity: dto.capacity,
                base_fare: dto.base_fare,
                location_id: dto.location_id,
                minimum_fare: dto.minimum_fare,
                per_kilometer: dto.per_kilometer,
                per_minute: dto.per_minutes,
                vehicle_type_id: dto.vehicle_type_id,
                waiting_charges: dto.waiting_time_charges,
                waiting_time_limit: dto.waiting_time_limit,
                apply_fares: dto.apply_fares,
                apply_peak_fare: dto.apply_peak_fare,
            },
        });
    }

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                apply_fares: true,
                apply_peak_fare: true,
                base_fare: true,
                capacity: true,
                location: true,
                minimum_fare: true,
                per_kilometer: true,
                per_minute: true,
                vehicle_type: true,
                waiting_charges: true,
                waiting_time_limit: true,
                night_fare: true,
                peak_fares: true,
                created_at: true,
                updated_at: true,
            },
        );
    }
    async findByLocation(location: number, vehicle_type_id: number) {
        const fare = await this.ormService.fare.findFirst({
            where: {
                location_id: location,
                vehicle_type_id,
            },
            select: {
                id: true,
                apply_fares: true,
                apply_peak_fare: true,
                base_fare: true,
                capacity: true,
                location: true,
                minimum_fare: true,
                per_kilometer: true,
                per_minute: true,
                vehicle_type: true,
                vehicle_type_id: true,
                waiting_charges: true,
                waiting_time_limit: true,
                night_fare: true,
                peak_fares: true,
                location_id: true,
                trips: true,
                updated_at: true,
                created_at: true,
            },
        });

        if (!fare) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }
        return fare;
    }

    async findOne(id: number): Promise<Fare | any> {
        const fare = await this.ormService.fare.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                apply_fares: true,
                apply_peak_fare: true,
                base_fare: true,
                capacity: true,
                location: true,
                minimum_fare: true,
                per_kilometer: true,
                per_minute: true,
                vehicle_type: true,
                waiting_charges: true,
                waiting_time_limit: true,
                night_fare: true,
                peak_fares: true,
            },
        });

        if (!fare) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }
        return fare;
    }

    async update(id: number, dto: UpdateFareDto) {
        await this.findOne(id);
        return await this.ormService.fare.update({
            where: {
                id,
            },
            data: {
                location_id: dto.location_id,
                capacity: dto.capacity,
                base_fare: dto.base_fare,
                minimum_fare: dto.minimum_fare,
                per_kilometer: dto.per_kilometer,
                per_minute: dto.per_minutes,
                vehicle_type_id: dto.vehicle_type_id,
                waiting_charges: dto.waiting_time_charges,
                waiting_time_limit: dto.waiting_time_limit,
                apply_fares: dto.apply_fares,
                apply_peak_fare: dto.apply_peak_fare,
            },
        });
    }
    async delete(id: number) {
        await this.findOne(id);
        return await this.ormService.fare.delete({
            where: {
                id,
            },
        });
    }

    async calculatePrice(
        time: number,
        distance: number,
        locationId: number,
        vehicle_type_id: number,
        wait_time?: number,
    ) {
        const now = moment();
        const fare = await this.findByLocation(locationId, vehicle_type_id);
        let baseFare =
            fare.base_fare +
            time * fare.per_minute +
            distance * fare.per_kilometer;

        if (
            fare.night_fare &&
            now.isBetween(
                moment(fare.night_fare.start_time, ['h:mm A']),
                moment(fare.night_fare.end_time, ['h:mm A']),
            )
        ) {
            baseFare *= +fare.night_fare.multiplier;
        } else if (fare.apply_peak_fare) {
            for (let peak of fare.peak_fares) {
                if (
                    now.isBetween(
                        moment(peak.start_time),
                        moment(peak.end_time),
                    )
                ) {
                    baseFare *= +peak.multiplier;
                    break;
                }
            }
        }
        if (wait_time > fare.waiting_time_limit) {
            const actual_wait_time = fare.waiting_time_limit - wait_time;
            const calculate = Math.ceil(
                fare.waiting_charges * actual_wait_time,
            );
            baseFare += calculate;
        }

        return {
            price: Math.max(fare.minimum_fare, baseFare),
            base: fare,
        };
    }

    async calculateDistanceFare(
        pickup: Coordinate,
        dropoff: Coordinate,
        location_id: number,
        vehicle_type_id: number,
    ) {
        const info = await this.googleMapsApi.distanceMatrix(pickup, dropoff);
        if (info.status !== Status.OK) {
            throw new BadRequestException('nothing found');
        }
        const {
            origin_addresses: [originAddress],
            destination_addresses: [destinationAddress],
            rows: [
                {
                    elements: [{ distance, duration }],
                },
            ],
        } = info;

        const time = Math.ceil(duration.value * 0.0166667);
        const distanceInKm = Math.ceil(distance.value / 1000);
        const price = await this.calculatePrice(
            time,
            distanceInKm,
            location_id,
            vehicle_type_id,
        );

        return {
            origin_address: originAddress,
            destination_address: destinationAddress,
            duration_in_words: duration.text,
            duration: time,
            distance,
            price,
        };
    }

    async calculate(dto: CalculateFareDto) {
        const location = await this.locationsService.findByPoint(dto.pickup);
        return await this.calculateDistanceFare(
            dto.pickup,
            dto.destination,
            location.id,
            dto.vehicle_type_id,
        );
    }
}
