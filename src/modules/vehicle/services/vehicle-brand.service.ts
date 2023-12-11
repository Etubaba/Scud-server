import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';
import { CreateVehicleBrandDto } from '../dto/create-vehicle-brand.dto';
import { UpdateVehicleBrandDto } from '../dto/update-vehicle-brand.dto';

@Injectable()
export class VehicleBrandService {
    constructor(private readonly ormService: OrmService) {}

    async list() {
        return await this.ormService.vehicleBrand.findMany({});
    }

    async create(dto: CreateVehicleBrandDto) {
        return await this.ormService.vehicleBrand.create({
            data: {
                name: dto.name,
                is_active: dto.is_active,
            },
        });
    }

    async findOne(id: number) {
        const brand = await this.ormService.vehicleBrand.findUnique({
            where: {
                id,
            },
        });
        if (!brand) {
            throw new HttpException(
                'Vehicle brand not found',
                HttpStatus.NOT_FOUND,
            );
        }
        return brand;
    }

    async update(id: number, dto: UpdateVehicleBrandDto) {
        await this.findOne(id);
        return await this.ormService.vehicleBrand.update({
            where: {
                id,
            },
            data: {
                name: dto.name,
                is_active: dto.is_active,
            },
        });
    }

    async delete(id: number) {
        await this.findOne(id);
        return await this.ormService.vehicleBrand.delete({
            where: {
                id,
            },
        });
    }
}
