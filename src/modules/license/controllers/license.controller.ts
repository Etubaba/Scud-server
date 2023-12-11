import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    Patch,
    Get,
    HttpException,
    HttpStatus,
    HttpCode,
    Delete,
    Param,
    Query,
    Req,
    UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { FileInterceptorConfig } from 'src/common/interceptors/file.interceptor.config';

import { CreateLicenseDto } from '../dto/create-license.dto';
import { UpdateLicenseDto } from '../dto/update-license.dto';
import { LicenseService } from '../services/license.service';
import { IMAGE_MIME_TYPE } from 'src/common/types/mime.types';

@Controller('licenses')
export class LicenseController {
    constructor(private readonly licenseService: LicenseService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-licenses')
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
        return this.licenseService.list(query, request);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-licenses')
    @UseInterceptors(
        FilesInterceptor(
            'images',
            2,
            new FileInterceptorConfig(
                IMAGE_MIME_TYPE,
                './uploads/licenses',
            ).createMulterOptions(),
        ),
    )
    async create(
        @Body() createLicenseDto: CreateLicenseDto,
        @UploadedFiles() images,
    ) {
        if ((images && !images) || images.length < 2) {
            throw new HttpException('Images not found', HttpStatus.BAD_REQUEST);
        }
        return this.licenseService.create(createLicenseDto, images);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-licenses')
    find(@Param('id') id: string) {
        return this.licenseService.findOne(+id);
    }
    @Get('find/user')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-licenses')
    findByUser(@Req() request) {
        const { sub, ..._ }: { sub: number; _: any } = request.user;
        return this.licenseService.findByUser(+sub);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-licenses')
    @UseInterceptors(
        FilesInterceptor(
            'images',
            2,
            new FileInterceptorConfig(
                IMAGE_MIME_TYPE,
                './uploads/licenses',
            ).createMulterOptions(),
        ),
    )
    update(
        @Param('id') id: string,
        @Body() updateLicenseDto: UpdateLicenseDto,
        @UploadedFiles() images,
    ) {
        return this.licenseService.update(updateLicenseDto, +id, images);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-licenses')
    delete(@Param('id') id: string) {
        return this.licenseService.remove(+id);
    }
}
