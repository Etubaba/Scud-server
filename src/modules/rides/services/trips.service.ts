import { BadRequestException, Injectable } from '@nestjs/common';
import {
    CancellledBy,
    PaymentMode,
    Prisma,
    RideRequestStatus,
    TripStatus,
} from '@prisma/client';
import * as moment from 'moment';
import { OrmService } from 'src/database/orm.service';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import { CreateTripDto } from '../dtos/create-trip.dto';
import { PaginationService } from 'src/database/pagination.service';
import { Request } from 'express';

type RideRequestType = {
    destination: string;
    driver_id: number;
    pickup_location_id: number;
    rider_id: number;
    status: RideRequestStatus;
};

@Injectable()
export class TripsService {
    private selectfields = {
        id: true,
        destination: true,
        destination_coords: true,
        driver_arrival: true,
        driver: true,
        rider: true,
        duration: true,
        trip_fare: true,
        end_date: true,
        fare: true,
        pickup: true,
        pickup_coords: true,
        start_date: true,
        status: true,
        created_at: true,
        updated_at: true,
        cancelledBy: true,
        review: true,
        cancel_reason: true,
        driver_id: true,
        rider_id: true,
    };
    constructor(
        private readonly ormService: OrmService,
        private readonly settingsService: SettingsService,
        private readonly paginationService: PaginationService,
    ) {}

    async create(dto: CreateTripDto) {
        const trip = await this.ormService.trip.create({
            data: {
                destination: dto.destination,
                destination_coords:
                    dto.destination_coords as unknown as Prisma.InputJsonValue,
                rider_id: dto.rider_id,
                pickup: dto.pickup,
                pickup_coords:
                    dto.pickup_coords as unknown as Prisma.InputJsonValue,
                status: dto.status,
                duration: dto.duration,
                driver_id: dto.driver_id,
                fare_id: dto.fare_id,
                cancel_reason: '',
            },
        });
        return trip;
    }
    async createRideRequest(dto: RideRequestType) {
        const rideRequest = await this.ormService.rideRequest.create({
            data: {
                destination: dto.destination,
                time: moment().toDate(),
                driver_id: dto.driver_id,
                pickup_location_id: dto.pickup_location_id,
                rider_id: dto.rider_id,
                status: dto.status,
            },
        });
        return rideRequest;
    }

    async update(
        id: number,
        dto: Partial<
            CreateTripDto & {
                cancelledBy: CancellledBy;
                cancel_reason: string;
            }
        >,
    ) {
        await this.find(id);
        const data = {
            destination: dto.destination,
            destination_coords:
                dto.destination_coords as unknown as Prisma.InputJsonValue,
            rider_id: dto.rider_id,
            pickup: dto.pickup,
            pickup_coords:
                dto.pickup_coords as unknown as Prisma.InputJsonValue,
            status: dto.status,
            duration: dto.duration,
            driver_id: dto.driver_id,
            drival_arrival: dto.driver_arrival,
            start_date: dto.start_date,
            end_date: dto.end_date,
            cancelledBy: dto.cancelledBy,
            cancel_reason: dto.cancel_reason,
        };
        if (dto.fare_id) {
            data['fare'] = {
                connect: {
                    id: dto.fare_id,
                },
            };
        }

        const trip = await this.ormService.trip.update({
            where: {
                id,
            },
            data: {
                ...data,
            },
        });
    }
    async find(id: number) {
        const trip = await this.ormService.trip.findFirst({
            where: {
                id,
            },
            select: this.selectfields,
        });
        if (!trip) {
            throw new BadRequestException('Record not found');
        }
        return trip;
    }
    async findRequest(id: number) {
        const trip = await this.ormService.trip.findFirst({
            where: {
                id,
            },
            select: this.selectfields,
        });
        if (!trip) {
            throw new BadRequestException('Record not found');
        }
        return trip;
    }
    async findUnstarted(id: number) {
        const trip = await this.ormService.trip.findFirst({
            where: {
                id,
                status: 'unstarted',
            },
            select: this.selectfields,
        });
        if (!trip) {
            throw new BadRequestException('Record not found');
        }
        return trip;
    }
    async findByDriver(id: number, status: TripStatus) {
        const trip = await this.ormService.trip.findFirst({
            where: {
                driver_id: id,
                status,
            },
        });
        if (!trip) {
            throw new BadRequestException('Record not found');
        }
        return trip;
    }
    async listByDriverForEarnings(
        id: number,
        status: TripStatus,
        end_date: Date,
        start_date: Date,
    ) {
        const trip = await this.ormService.trip.findMany({
            where: {
                driver_id: id,
                status,
                created_at: {
                    gte: start_date,
                    lte: end_date,
                },
            },
            select: this.selectfields,
        });

        return trip;
    }

    async listByDriver(id: number, query: any) {
        const { start_date, end_date = new Date() } = query;
        const trip = await this.ormService.trip.findMany({
            where: {
                driver_id: id,
                created_at: {
                    gte: start_date,
                    lte: end_date,
                },
            },
            select: this.selectfields,
        });
        return trip;
    }
    async listByRider(id: number, query: any) {
        const { start_date, end_date = new Date() } = query;
        const trip = await this.ormService.trip.findMany({
            where: {
                rider_id: id,
                created_at: {
                    gte: start_date,
                    lte: end_date,
                },
            },
            select: this.selectfields,
        });
        return trip;
    }
    async list(type: 'request' | 'trips', query: any, req: Request) {
        if (type == 'trips') {
            return await this.paginationService.paginate(
                req,
                'trip',
                query,
                this.selectfields,
            );
        }
        return await this.paginationService.paginate(
            req,
            'rideRequest',
            query,
            {
                created_at: true,
                updated_at: true,
                destination: true,
                driver: true,
                rider: true,
                pickup_location: true,
                status: true,
                time: true,
            },
        );
    }
    async createTripFare(
        id: number,
        data: { total: number; payment_mode: PaymentMode; base_fare: number },
    ) {
        const trip = await this.find(id);
        const service_fare = parseInt(
            (await this.settingsService.get('DRIVER_SERVICE_FARE')).value,
        );
        const commission = Math.ceil((service_fare / 100) * data.total);
        const owe = data.payment_mode == 'card' ? 0 : commission;
        const cash_colleted = data.payment_mode == 'card' ? 0 : data.total;
        const paid = data.payment_mode == 'card' ? false : true;
        const tripfare = await this.ormService.tripFare.create({
            data: {
                trip_id: id,
                base_fare: data.base_fare,
                payment_mode: data.payment_mode,
                owe_amount: owe,
                admin_commission: commission,
                driver_commission: data.total - commission,
                total_fare: data.total,
                cash_colleted,
                paid,
            },
        });
        return tripfare;
    }

    async findPayable(id: number, shouldThrow: boolean = true) {
        const trip = await this.ormService.trip.findFirst({
            where: {
                id,
                trip_fare: {
                    paid: false,
                },
            },
            include: {
                fare: true,
                trip_fare: true,
            },
        });
        if (!trip && shouldThrow) {
            throw new BadRequestException('Record not found');
        }
        if (!trip && !shouldThrow) {
            return null;
        }
        return trip;
    }
    async findUnpaidTrips(user_id: number) {
        return await this.ormService.trip.findMany({
            where: {
                driver_id: user_id,
                trip_fare: {
                    paid: true,
                },
                status: 'completed',
            },
        });
    }
    async updateTripPay(id: number, { paid }: { paid: boolean }) {
        await this.find(id);
        const update = await this.ormService.trip.update({
            where: {
                id,
            },
            data: {
                trip_fare: {
                    update: {
                        paid,
                    },
                },
            },
        });
        return update;
    }
}
