import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { UpdateLocationStatusDto } from '../dto/update-location-status.dto';

@Injectable()
export class CountriesService {
    model: string = 'country';

    constructor(
        private readonly ormService: OrmService,
        private readonly paginationService: PaginationService,
    ) {}

    async list() {
        return await this.ormService.country.findMany({});
    }

    async listPaginated(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                name: true,
                iso3: true,
                iso2: true,
                numeric_code: true,
                phone_code: true,
                capital: true,
                currency: true,
                currency_name: true,
                currency_symbol: true,
                region: true,
                subregion: true,
                timezones: true,
                emoji: true,
                latitude: true,
                longitude: true,
                is_active: true,
                created_at: true,
            },
        );
    }

    async update(id: number, updateLocationStatusDto: UpdateLocationStatusDto) {
        const country = await this.ormService.country.findUnique({
            where: {
                id: id,
            },
        });

        if (!country) {
            throw new BadRequestException('Record Not Found');
        }

        if (!updateLocationStatusDto.is_active) {
            //  MAKE ALL STATES UNDER COUNTRY INACTIVE
            await this.ormService.state.updateMany({
                where: {
                    country_id: id,
                },
                data: {
                    is_active: false,
                },
            });

            // MAKE ALL CITIES UNDER COUNTRY INACTIVE
            await this.ormService.city.updateMany({
                where: {
                    state: {
                        country_id: id,
                    },
                },
                data: {
                    is_active: false,
                },
            });
        }

        return this.ormService.country.update({
            where: {
                id: id,
            },
            data: {
                is_active: updateLocationStatusDto.is_active,
            },
        });
    }
}
