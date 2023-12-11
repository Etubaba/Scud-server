import { Distance } from '@googlemaps/google-maps-services-js';
import { Fare, PaymentMode } from '@prisma/client';
import { Coordinate } from 'src/modules/location/dtos/create-location.dto';

export type SocketUsers = {
    id: number;
    socket_id: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    driverScore?: number;
    acceptable_rides: PaymentMode | 'both';
    role: 'driver' | 'rider';
    is_online: boolean;
    max_distance: number;
    fence: string;
    is_in_ride: boolean;
    arrival_time?: number;
    vehicle_type: string;
};

export type RequestRoom = {
    id: number;
    current_driver_id: number;
    rider_id: number;
    next_driver_ids: string[];
};

export type RidesMeta = {
    origin_address: string;
    destination_address: string;
    duration_in_words: string;
    duration: number;
    distance: Distance;
    price: any;
    destination_coords: Coordinate;
    pickup_coords: Coordinate;
    location_fare: Fare;
    payment_mode: PaymentMode;
    vehicle_type_id: number;
};
