import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    HttpCode,
    HttpStatus,
    Query,
    Req,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { CreatePromoDto } from '../dto/create-promo.dto';
import { UpdatePromoDto } from '../dto/update-promo.dto';
import { PromoService } from '../services/promo.service';

@Controller('promos')
export class PromoController {
    constructor(private readonly promoService: PromoService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-promos')
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
        return this.promoService.list(query, request);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-promos')
    create(@Body() createPromoDto: CreatePromoDto) {
        return this.promoService.create(createPromoDto);
    }

    @Get(':id')
    @Permissions('read-promos')
    find(@Param('id') id: string) {
        return this.promoService.find(+id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-promos')
    update(@Body() updatePromoDto: UpdatePromoDto, @Param('id') id: string) {
        return this.promoService.update(+id, updatePromoDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-promos')
    delete(@Param('id') id: string) {
        return this.promoService.remove(+id);
    }
}
