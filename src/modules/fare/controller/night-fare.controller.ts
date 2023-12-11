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
import { CreateNightFareDto } from '../dto/create-night-fare.dto';
import { UpdateNightFareDto } from '../dto/update-night-fare.dto';
import { NightFareService } from '../services/night-fare.service';

@Controller('night-fare')
export class NightFareController {
    constructor(private readonly nightFareService: NightFareService) {}

    @Post()
    @Permissions('create-fares')
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createNightFareDto: CreateNightFareDto) {
        return this.nightFareService.create(createNightFareDto);
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
        return this.nightFareService.list(query, request);
    }

    @Get(':id')
    @Permissions('read-fares')
    @HttpCode(HttpStatus.OK)
    find(@Param('id') id: string) {
        return this.nightFareService.findOne(+id);
    }

    @Patch(':id')
    @Permissions('update-fares')
    @HttpCode(HttpStatus.OK)
    update(
        @Param('id') id: number,
        @Body() updateNightFareDto: UpdateNightFareDto,
    ) {
        return this.nightFareService.update(+id, updateNightFareDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    delete(@Param('id') id: string) {
        return this.nightFareService.delete(+id);
    }
}
