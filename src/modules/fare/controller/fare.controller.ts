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
import { CreateFareDto } from '../dto/create-fare.dto';
import { UpdateFareDto } from '../dto/update-fare.dto';
import { FareService } from '../services/fare.service';
import { CalculateFareDto } from '../dto/calculate-fare.dto';

@Controller('fare')
export class FareController {
    constructor(private readonly fareService: FareService) {}

    @Post()
    @Permissions('create-fares')
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createFareDto: CreateFareDto) {
        return this.fareService.create(createFareDto);
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
        return this.fareService.list(query, request);
    }

    @Get(':id')
    @Permissions('read-fares')
    @HttpCode(HttpStatus.FOUND)
    getOne(@Param('id') id: string) {
        return this.fareService.findOne(+id);
    }

    @Patch(':id')
    @Permissions('update-fares')
    @HttpCode(HttpStatus.OK)
    update(@Param('id') id, @Body() updateFareDto: UpdateFareDto) {
        return this.fareService.update(+id, updateFareDto);
    }

    @Delete(':id')
    @Permissions('delete-fares')
    @HttpCode(HttpStatus.GONE)
    delete(@Param('id') id: string) {
        return this.fareService.delete(+id);
    }

    @Post('/calculate')
    calculate(@Body() dto: CalculateFareDto) {
        return this.fareService.calculate(dto);
    }
}
