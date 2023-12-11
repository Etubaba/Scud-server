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
import { StatesService } from '../services/states.service';

@Controller('states')
export class StatesController {
    constructor(private readonly statesService: StatesService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiQuery({ name: 'country_id' })
    list(@Query() query) {
        if (!query.length && !query.country_id) {
            throw new HttpException(
                'You need to provide country_id as query parameter',
                HttpStatus.BAD_REQUEST,
            );
        }
        return this.statesService.list(query);
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
        return this.statesService.listPaginated(query, request);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    update(
        @Param('id') id: string,
        @Body() updateLocationStatusDto: UpdateLocationStatusDto,
    ) {
        return this.statesService.update(+id, updateLocationStatusDto);
    }
}
