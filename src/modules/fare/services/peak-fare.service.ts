import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as moment from 'moment';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { CreatePeakFareDto } from '../dto/create-peak-fare.dto';
import { UpdatePeakFareDto } from '../dto/update-peak-fare.dto';
import { FareService } from './fare.service';

@Injectable()
export class PeakFareService {
    model: string = 'peakFare';
    constructor(
        private readonly ormService: OrmService,
        private readonly fareServices: FareService,
        private readonly paginationService: PaginationService,
    ) {}

    async create(dto: CreatePeakFareDto) {
        const fare = await this.fareServices.findOne(dto.fare_id);
        fare.peak_fares.forEach((peak_fare) => {
            const endTime = peak_fare.end_time;
            const startTime = peak_fare.start_time;
            const isUsed = moment(dto.start_time, ['h:m a', 'H:m']).isBetween(
                moment(startTime, ['h:m a', 'H:m']),
                moment(endTime, ['h:m a', 'H:m']),
            );
            if (isUsed && peak_fare.day == dto.day) {
                throw new HttpException(
                    'Start time in use',
                    HttpStatus.CONFLICT,
                );
            }
        });

        const peak_fare = await this.ormService.peakFare.create({
            data: {
                fare_id: dto.fare_id,
                day: dto.day,
                end_time: dto.end_time,
                start_time: dto.start_time,
                multiplier: dto.multiplier,
            },
        });
        return peak_fare;
    }

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                fare_id: true,
                day: true,
                start_time: true,
                end_time: true,
                multiplier: true,
                created_at: true,
                updated_at: true,
                fare: true,
            },
        );
    }

    async findOne(id: number) {
        const peak_fare = await this.ormService.peakFare.findUnique({
            where: {
                id,
            },
        });
        if (!peak_fare) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }
        return peak_fare;
    }

    async update(id: number, dto: UpdatePeakFareDto) {
        await this.findOne(id);
        return await this.ormService.peakFare.update({
            where: {
                id,
            },
            data: {
                day: dto.day,
                end_time: dto.end_time,
                start_time: dto.start_time,
                multiplier: dto.multiplier,
            },
        });
    }

    async delete(id: number) {
        await this.findOne(id);
        return this.ormService.peakFare.delete({
            where: {
                id: id,
            },
        });
    }

    async deleteMany(fare_id: number) {
        return this.ormService.peakFare.deleteMany({
            where: {
                fare_id,
            },
        });
    }
}
