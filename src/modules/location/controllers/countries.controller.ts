import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Query,
    Req,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { UpdateLocationStatusDto } from '../dto/update-location-status.dto';
import { CountriesService } from '../services/countries.service';

@Controller('countries')
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    list(@Query() query) {
        return this.countriesService.list();
    }

    @Get('/paginated')
    @HttpCode(HttpStatus.OK)
    @ApiQuery({
        name: 'next_cursor',
    })
    @ApiQuery({
        name: 'sort',
    })
    @ApiQuery({
        name: 'direction',
    })
    @ApiQuery({
        name: 'filter',
    })
    listPaginated(@Query() query, @Req() request: Request) {
        return this.countriesService.listPaginated(query, request);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    update(
        @Param('id') id: string,
        @Body() updateLocationStatusDto: UpdateLocationStatusDto,
    ) {
        return this.countriesService.update(+id, updateLocationStatusDto);
    }
}
