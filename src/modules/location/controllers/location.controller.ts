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
    Query,
} from '@nestjs/common';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { CreateLocationDto } from '../dtos/create-location.dto';
import { UpdateLocationDto } from '../dtos/update-location.dto';
import { LocationServices } from '../services/location.service';

@Controller('locations')
export class LocationController {
    constructor(private locationService: LocationServices) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-locations')
    list(@Query('city_id') city_id: string) {
        return this.locationService.list(+city_id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-locations')
    create(@Body() createLocationDto: CreateLocationDto) {
        return this.locationService.create(createLocationDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-locations')
    find(@Param('id') id: string) {
        return this.locationService.findOne(+id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-locations')
    update(
        @Param('id') id: string,
        @Body() updateLocationDto: UpdateLocationDto,
    ) {
        return this.locationService.update(+id, updateLocationDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-locations')
    delete(@Param('id') id: string) {
        return this.locationService.remove(+id);
    }
}
