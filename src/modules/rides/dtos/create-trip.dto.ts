//Using pure types instead of class validator because these are used internally only

import { TripStatus } from '@prisma/client';
import { Coordinate } from 'src/modules/location/dtos/create-location.dto';

export interface CreateTripDto {
    rider_id: number;
    driver_id: number;
    status: TripStatus;
    driver_arrival?: Date | string | null;
    pickup_coords: Coordinate;
    destination_coords: Coordinate;
    pickup: string;
    destination: string;
    start_date?: Date | string;
    end_date?: Date | string;
    duration?: number;
    fare_id?: number;
}
