import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { UpdateLocationStatusDto } from '../dto/update-location-status.dto';

@Injectable()
export class StatesService {
    model: string = 'state';

    constructor(
        private readonly ormService: OrmService,
        private readonly paginationService: PaginationService,
    ) {}

    async list(query: any) {
        return await this.ormService.state.findMany({
            where: {
                country_id: +query.country_id,
            },
            select: {
                id: true,
                name: true,
                code: true,
                latitude: true,
                longitude: true,
            },
        });
    }

    async listPaginated(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                name: true,
                code: true,
                latitude: true,
                longitude: true,
                is_active: true,
                created_at: true,
            },
        );
    }

    async update(id: number, updateLocationStatusDto: UpdateLocationStatusDto) {
        const state = await this.ormService.state.findUnique({
            where: {
                id: id,
            },
        });

        if (!state) {
            throw new BadRequestException('Record Not Found');
        }

        // GETS STATE'S COUNTRY ACTIVE STATUS
        const countryIsActive = await this.ormService.country.findFirst({
            where: {
                id: state.country_id,
                is_active: true,
            },
        });

        // THROWS HTTP EXCEPTION IF COUNTRY IS INACTIVE
        if (!countryIsActive) {
            throw new HttpException(
                `State's country is inactive`,
                HttpStatus.CONFLICT,
            );
        }

        if (!updateLocationStatusDto.is_active) {
            // MAKE ALL CITIES UNDER STATE INACTIVE
            await this.ormService.city.updateMany({
                where: {
                    state_id: id,
                },
                data: {
                    is_active: false,
                },
            });
        }

        return this.ormService.state.update({
            where: {
                id: id,
            },
            data: {
                is_active: updateLocationStatusDto.is_active,
            },
        });
    }
}
