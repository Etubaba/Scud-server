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
import { Request } from 'express';
import { BypassVerification } from 'src/modules/auth/decorators/bypass-verification.decorator';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { Guest } from 'src/modules/auth/decorators/public.decorator';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { UpdateFaqDto } from '../dto/update-faq.dto';
import { FaqService } from '../services/faq.service';

@Controller('faqs')
export class FaqController {
    constructor(private readonly faqService: FaqService) {}

    @Get()
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
    @Guest()
    @BypassVerification()
    async list(@Query() query, @Req() request: Request) {
        return this.faqService.list(query, request);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-faqs')
    async create(@Body() createFaqDto: CreateFaqDto) {
        return this.faqService.create(createFaqDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-faqs')
    async find(@Param('id') id: string) {
        return this.faqService.findOne(+id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-faqs')
    async update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
        return this.faqService.update(+id, updateFaqDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-faqs')
    async delete(@Param('id') id: string) {
        return this.faqService.delete(+id);
    }
}
