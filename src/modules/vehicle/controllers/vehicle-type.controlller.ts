import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { VehicleTypeService } from '../services/vehicle-type.service';
import { CreateVehicleTypeDto } from '../dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from '../dto/update-vehicle-type.dto';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';

@Controller('vehicle-types')
export class VehicleTypeController {
    constructor(private readonly vehicleTypeService: VehicleTypeService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-vehicle-types')
    list() {
        return this.vehicleTypeService.list();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-vehicle-types')
    create(@Body() dto: CreateVehicleTypeDto) {
        return this.vehicleTypeService.create(dto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-vehicle-types')
    findOne(@Param('id') id: string) {
        return this.vehicleTypeService.findOne(+id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-vehicle-types')
    update(@Param('id') id: string, @Body() dto: UpdateVehicleTypeDto) {
        return this.vehicleTypeService.update(+id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-vehicle-types')
    remove(@Param('id') id: string) {
        return this.vehicleTypeService.remove(+id);
    }
}
