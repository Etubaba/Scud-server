import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    Patch,
    Get,
    HttpException,
    HttpStatus,
    HttpCode,
    Delete,
} from '@nestjs/common';
import {
    Param,
    Req,
    UploadedFiles,
} from '@nestjs/common/decorators/http/route-params.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { FileInterceptorConfig } from 'src/common/interceptors/file.interceptor.config';

import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehicleService } from '../services/vehicle.service';
import { IMAGE_MIME_TYPE } from 'src/common/types/mime.types';

@Controller('vehicles')
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-vehicles')
    list() {
        return this.vehicleService.list();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-vehicles')
    @UseInterceptors(
        FilesInterceptor(
            'images',
            3,
            new FileInterceptorConfig(
                IMAGE_MIME_TYPE,
                './uploads/vehicles',
            ).createMulterOptions(),
        ),
    )
    async create(
        @Body() createVehicleDto: CreateVehicleDto,
        @UploadedFiles() images,
    ) {
        if (!images || images.length < 3) {
            throw new HttpException('Images not found', HttpStatus.BAD_REQUEST);
        }
        return this.vehicleService.create(createVehicleDto, images);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-vehicles')
    find(@Param('id') id: string) {
        return this.vehicleService.findOne(+id);
    }

    @Get('find/user')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-vehicles')
    findByUser(@Req() request) {
        const { sub, ..._ }: { sub: number; _: any } = request.user;
        return this.vehicleService.findByUser(+sub);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('update-vehicles')
    @UseInterceptors(
        FilesInterceptor(
            'images',
            3,
            new FileInterceptorConfig(
                IMAGE_MIME_TYPE,
                './uploads/vehicles',
            ).createMulterOptions(),
        ),
    )
    update(
        @Param('id') id: string,
        @Body() updateVehicleDto: UpdateVehicleDto,
        @UploadedFiles() images,
    ) {
        return this.vehicleService.update(updateVehicleDto, +id, images);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-vehicles')
    delete(@Param('id') id: string) {
        return this.vehicleService.remove(+id);
    }
}
