import {
    Controller,
    Post,
    Body,
    Get,
    Patch,
    Delete,
    Query,
    Req,
    Param,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { BypassVerification } from 'src/modules/auth/decorators/bypass-verification.decorator';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { Guest } from 'src/modules/auth/decorators/public.decorator';
import { CreateDiscountDto } from '../dto/create_discount.dto';
import { DiscountService } from '../services/discount.service';

@Controller('discount')
export class DiscountController {
    constructor(private readonly discountService: DiscountService) {}
    @Permissions('create-discounts')
    @Post()
    async create(@Body() dto: CreateDiscountDto) {
        return this.discountService.create(dto);
    }

    @Permissions('browse-discounts')
    @Get()
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
    async list(@Query() query, @Req() request: Request) {
        return this.discountService.list(query, request);
    }

    @Permissions('read-discounts')
    @Get(':id')
    async get(@Param('id') id: string) {
        return this.discountService.find(+id);
    }

    @Permissions('update-discounts')
    @Patch(':id')
    async update(@Body() dto, @Param('id') id: string) {
        return this.discountService.update(+id, dto);
    }

    @Permissions('delete-discounts')
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.discountService.delete(+id);
    }
}
