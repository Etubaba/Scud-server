import { Request } from 'express';
import {
    Body,
    Controller,
    Delete,
    Get,
    Req,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { VehicleBrandService } from '../services/vehicle-brand.service';
import { CreateVehicleBrandDto } from '../dto/create-vehicle-brand.dto';
import { UpdateVehicleBrandDto } from '../dto/update-vehicle-brand.dto';

@Controller('vehicle-brands')
export class VehicleBrandController {
    constructor(private readonly vehicleBrandService: VehicleBrandService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-vehicle-brands')
    list() {
        return this.vehicleBrandService.list();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-vehicle-brands')
    create(@Body() createVehicleBrandDto: CreateVehicleBrandDto) {
        return this.vehicleBrandService.create(createVehicleBrandDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-vehicle-brands')
    find(@Param('id') id: string) {
        return this.vehicleBrandService.findOne(+id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('update-vehicle-brands')
    update(
        @Param('id') id: string,
        @Body() updateVehicleBrandDto: UpdateVehicleBrandDto,
    ) {
        return this.vehicleBrandService.update(+id, updateVehicleBrandDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-vehicle-brands')
    delete(@Param('id') id: string) {
        return this.vehicleBrandService.delete(+id);
    }
}
