import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Query,
    Req,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { UpdateLocationStatusDto } from '../dto/update-location-status.dto';
import { CitiesService } from '../services/cities.service';

@Controller('cities')
export class CitiesController {
    constructor(private readonly citiesService: CitiesService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiQuery({ name: 'state_id' })
    list(@Query() query) {
        if (!query.length && !query.state_id) {
            throw new HttpException(
                'You need to provide state_id as query parameter',
                HttpStatus.BAD_REQUEST,
            );
        }
        return this.citiesService.list(query);
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
        return this.citiesService.listPaginated(query, request);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    update(
        @Param('id') id: string,
        @Body() updateLocationStatusDto: UpdateLocationStatusDto,
    ) {
        return this.citiesService.update(+id, updateLocationStatusDto);
    }
}
