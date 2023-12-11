import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import moment from 'moment';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import { CreateNightFareDto } from '../dto/create-night-fare.dto';
import { UpdateNightFareDto } from '../dto/update-night-fare.dto';
import { FareService } from './fare.service';

@Injectable()
export class NightFareService {
    model: string = 'nightFare';
    constructor(
        private readonly ormService: OrmService,
        private readonly fareService: FareService,
        private readonly paginationService: PaginationService,
        private readonly settingsService: SettingsService,
    ) {}

    async create(dto: CreateNightFareDto) {
        const { value: nightStart } = await this.settingsService.get(
            'DEFAULT_NIGHT_START_TIME',
        );
        const { value: nightEnd } = await this.settingsService.get(
            'DEFAULT_NIGHT_END_TIME',
        );
        const fare = await this.fareService.findOne(dto.fare_id);

        try {
            if (
                !moment(dto.start_time).isBetween(nightStart, nightEnd) ||
                !moment(dto.end_time).isBetween(nightStart, nightEnd)
            ) {
                throw new HttpException(
                    'Night fares must be between the specified range',
                    HttpStatus.CONFLICT,
                );
            }

            if (fare.night_fare) {
                throw new HttpException(
                    'A night fare already exists',
                    HttpStatus.CONFLICT,
                );
            }

            return await this.ormService.nightFare.create({
                data: {
                    fare_id: fare.id,
                    start_time: dto.start_time,
                    end_time: dto.end_time,
                    multiplier: dto.multiplier,
                },
            });
        } catch (error) {
            throw new HttpException(
                'An error occurred while creating the night fare',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                fare_id: true,
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
        const fare = await this.ormService.nightFare.findUnique({
            where: {
                id: id,
            },
        });
        if (!fare) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }
        return fare;
    }

    async update(id: number, dto: UpdateNightFareDto) {
        await this.findOne(id);
        return await this.ormService.nightFare.update({
            where: {
                id: id,
            },
            data: {
                start_time: dto.start_time,
                end_time: dto.end_time,
                multiplier: dto.multiplier,
            },
        });
    }

    async delete(id: number) {
        await this.findOne(id);
        const night_peak_fare = await this.ormService.nightFare.delete({
            where: {
                id,
            },
        });
        return night_peak_fare;
    }
}
