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
import { CreateIncentivesDto } from '../dto/create-incentives.dto';
import { UpdateIncentivesDto } from '../dto/update-incentives.dto';
import { IncentivesService } from '../services/incentives.service';

@Controller('incentives')
export class IncentivesController {
    constructor(private readonly incentivesService: IncentivesService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-incentives')
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
        return this.incentivesService.list(query, request);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-incentives')
    create(@Body() createIncentivesDto: CreateIncentivesDto) {
        return this.incentivesService.create(createIncentivesDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-incentives')
    find(@Param('id') id: string) {
        return this.incentivesService.findOne(+id, 'Record not found');
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-incentives')
    update(
        @Param('id') id: string,
        @Body() updateIncentivesDto: UpdateIncentivesDto,
    ) {
        return this.incentivesService.update(+id, updateIncentivesDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-incentives')
    delete(@Param('id') id: string) {
        return this.incentivesService.remove(+id);
    }
}
