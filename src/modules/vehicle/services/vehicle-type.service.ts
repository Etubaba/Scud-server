import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';
import * as moment from 'moment';
import { CreateVehicleTypeDto } from '../dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from '../dto/update-vehicle-type.dto';

@Injectable()
export class VehicleTypeService {
    constructor(private readonly ormService: OrmService) {}

    async list() {
        return await this.ormService.vehicleType.findMany();
    }

    async create(dto: CreateVehicleTypeDto) {
        const typeExists = await this.ormService.vehicleType.findFirst({
            where: {
                name: dto.name,
            },
        });

        if (typeExists) {
            throw new ConflictException('Vehicle type already exists');
        }

        return await this.ormService.vehicleType.create({
            data: {
                name: dto.name,
                minimum_year: moment(dto.minimum_year, true).format(),
                maximum_year: dto.maximum_year
                    ? moment(dto.maximum_year, true).format()
                    : null,
                is_active: dto.is_active,
            },
        });
    }

    async findOne(id: number) {
        const vehicleType = await this.ormService.vehicleType.findFirst({
            where: { id },
        });

        if (!vehicleType) {
            throw new NotFoundException('Record not found');
        }

        return vehicleType;
    }

    async update(id: number, dto: UpdateVehicleTypeDto) {
        await this.findOne(id);

        const { name = '' } = dto;
        const typeExists = await this.ormService.vehicleType.findFirst({
            where: {
                name,
                NOT: { id },
            },
        });

        if (typeExists) {
            throw new ConflictException('Vehicle type already exists');
        }

        return await this.ormService.vehicleType.update({
            where: { id },
            data: {
                name: dto.name,
                minimum_year: dto.minimum_year
                    ? moment(dto.minimum_year).format()
                    : undefined,
                maximum_year: dto.maximum_year
                    ? moment(dto.maximum_year).format()
                    : undefined,
                is_active: dto.is_active,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);

        return this.ormService.vehicleType.delete({
            where: { id },
        });
    }
}
