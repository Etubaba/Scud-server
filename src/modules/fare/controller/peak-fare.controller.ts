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
    Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { CreatePeakFareDto } from '../dto/create-peak-fare.dto';
import { UpdatePeakFareDto } from '../dto/update-peak-fare.dto';
import { PeakFareService } from '../services/peak-fare.service';

@Controller('peak-fare')
export class PeakFareController {
    constructor(private readonly peakFareService: PeakFareService) {}
    @Post()
    @Permissions('create-fares')
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createPeakFareDto: CreatePeakFareDto) {
        return this.peakFareService.create(createPeakFareDto);
    }

    @Get()
    @Permissions('browse-fares')
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
    list(@Query() query, @Req() request: Request) {
        return this.peakFareService.list(query, request);
    }

    @Get(':id')
    @Permissions('read-fares')
    @HttpCode(HttpStatus.FOUND)
    find(@Param('id') id: string) {
        return this.peakFareService.findOne(+id);
    }

    @Patch(':id')
    @Permissions('update-fares')
    @HttpCode(HttpStatus.OK)
    update(
        @Param('id') id: number,
        @Body() updatePeakFareDto: UpdatePeakFareDto,
    ) {
        return this.peakFareService.update(+id, updatePeakFareDto);
    }

    @Delete(':id')
    @Permissions('delete-fares')
    @HttpCode(HttpStatus.OK)
    delete(@Param('id') id: string) {
        return this.peakFareService.delete(+id);
    }
}
