import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    Query,
} from '@nestjs/common';
import { Request } from 'express';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { UpdateLocationStatusDto } from '../dto/update-location-status.dto';

@Injectable()
export class CitiesService {
    model: string = 'city';

    constructor(
        private readonly ormService: OrmService,
        private readonly paginationSerive: PaginationService,
    ) {}

    async list(query: any) {
        return await this.ormService.city.findMany({
            where: {
                state_id: +query.state_id,
            },
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
            },
        });
    }

    async listPaginated(query: any, request: Request) {
        return await this.paginationSerive.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                is_active: true,
                created_at: true,
            },
        );
    }

    async update(id: number, updateLocationStatusDto: UpdateLocationStatusDto) {
        const city = await this.ormService.city.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                state: true,
                state_id: true,
            },
        });

        if (!city) {
            throw new BadRequestException('Record Not Found');
        }

        // GETS CITY'S COUNTRY ACTIVE STATUS
        const countryIsActive = await this.ormService.country.findFirst({
            where: {
                id: city.state.country_id,
                is_active: true,
            },
        });

        // THROWS HTTP EXCEPTION IF CITY'S COUNTRY IS INACTIVE
        if (!countryIsActive) {
            throw new HttpException(
                `City's country is inactive`,
                HttpStatus.CONFLICT,
            );
        }

        // GETS CITY'S STATE ACTIVE STATUS
        const stateIsActive = await this.ormService.state.findFirst({
            where: {
                id: city.state_id,
                is_active: true,
            },
        });

        // THROWS HTTP EXCEPTION IF CITY'S STATE IS INACTIVE
        if (!stateIsActive) {
            throw new HttpException(
                `City's state is inactive`,
                HttpStatus.CONFLICT,
            );
        }

        return this.ormService.city.update({
            where: {
                id: id,
            },
            data: {
                is_active: updateLocationStatusDto.is_active,
            },
        });
    }
}
