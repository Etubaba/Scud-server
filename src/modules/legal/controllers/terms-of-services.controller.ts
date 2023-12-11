import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { TermsOfServicesService } from '../services/terms-of-services.service';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { permissions } from 'src/modules/auth/permissions';
import { CreateTermsOfServicesDto } from '../dtos/create-terms-of-services.dto';
import { UpdateTermsOfServicesDto } from '../dtos/update-terms-of-services.dto';

@Controller('terms-of-services')
export class TermsOfServicesController {
    constructor(
        private readonly termsOfServiceService: TermsOfServicesService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions(permissions.LEGAL.BROWSE)
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
        return this.termsOfServiceService.list(query, request);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions(permissions.LEGAL.CREATE)
    create(@Body() dto: CreateTermsOfServicesDto) {
        return this.termsOfServiceService.create(dto);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions(permissions.LEGAL.UPDATE)
    update(@Body() dto: UpdateTermsOfServicesDto, @Param('id') id: string) {
        return this.termsOfServiceService.update(dto, +id);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions(permissions.LEGAL.READ)
    findOne(@Param('id') id: string) {
        return this.termsOfServiceService.findOne(+id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions(permissions.LEGAL.DELETE)
    remove(@Param('id') id: string) {
        return this.termsOfServiceService.remove(+id);
    }
}
