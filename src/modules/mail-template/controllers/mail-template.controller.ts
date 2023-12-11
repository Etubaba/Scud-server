import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileInterceptorConfig } from 'src/common/interceptors/file.interceptor.config';
import { TEXT_MIME_TYPE } from 'src/common/types/mime.types';
import { MailTemplateService } from '../services/mail-template.service';
import { CreateTemplateDto } from '../dtos/create-template.dto';
import { UpdateTemplateDto } from '../dtos/update-template.dto';
import { ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { permissions } from 'src/modules/auth/permissions';

@Controller('mail-templates')
export class MailTemplateController {
    constructor(private readonly mailTemplateService: MailTemplateService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions(permissions.MAIL_TEMPLATES.BROWSE)
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
        return this.mailTemplateService.list(query, request);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions(permissions.MAIL_TEMPLATES.READ)
    find(@Param('id') id: string) {
        return this.mailTemplateService.findOne(+id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions(permissions.MAIL_TEMPLATES.CREATE)
    @UseInterceptors(
        FilesInterceptor(
            'template',
            1,
            new FileInterceptorConfig(
                TEXT_MIME_TYPE,
                './src/mail-templates',
            ).createMulterOptions(),
        ),
    )
    async create(@Body() dto: CreateTemplateDto, @UploadedFiles() templates) {
        if (!templates || !templates.length) {
            throw new HttpException(
                'Attach template files',
                HttpStatus.BAD_REQUEST,
            );
        }
        return this.mailTemplateService.create(dto, templates);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions(permissions.MAIL_TEMPLATES.UPDATE)
    async update(@Body() dto: UpdateTemplateDto, @Param('id') id: string) {
        return this.mailTemplateService.update(dto, +id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions(permissions.MAIL_TEMPLATES.DELETE)
    async remove(@Param('id') id: string) {
        return this.mailTemplateService.remove(+id);
    }
}
