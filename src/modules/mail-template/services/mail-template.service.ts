import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';
import { CreateTemplateDto } from '../dtos/create-template.dto';
import { UpdateTemplateDto } from '../dtos/update-template.dto';
import { PaginationService } from 'src/database/pagination.service';
import { Request } from 'express';
import { unlink } from 'fs';
import { resolve } from 'path';
import { MediaService } from 'src/modules/media/media.service';
import * as _ from 'lodash';
@Injectable()
export class MailTemplateService {
    model: string = 'mailTemplate';

    constructor(
        private readonly ormService: OrmService,
        private readonly paginationService: PaginationService,
        private readonly mediaService: MediaService,
    ) {}

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                name: true,
                template_type: true,
                is_active: true,
                created_at: true,
                updated_at: true,
            },
        );
    }

    async create(dto: CreateTemplateDto, template: Express.Multer.File[]) {
        const templateExists = await this.ormService.mailTemplate.findFirst({
            where: {
                name: dto.name,
            },
        });

        if (templateExists) {
            throw new HttpException(
                'Template with same name already exists',
                HttpStatus.CONFLICT,
            );
        }

        return this.ormService.mailTemplate.create({
            data: {
                name: dto.name,
                is_active: dto.is_active === 'true' ? true : false,
                template_type: dto.template_type,
                path: template[0].path,
            },
        });
    }

    async update(dto: UpdateTemplateDto, id: number) {
        const template = await this.findOne(id);

        /* This code is checking if a template can be made inactive or not. It first finds the
        currently active template of the same type as the template being updated. If the template
        being updated is not of type "notification" and is being made inactive, it checks if there
        is an active template of the same type. If there is no active template of the same type, it
        throws an HTTP exception with a message indicating that a new active template with the same
        type needs to be created before making the current template inactive. */
        const activeTypeTemplate = await this.ormService.mailTemplate.findFirst(
            {
                where: {
                    template_type: template.template_type,
                    is_active: true,
                    NOT: {
                        id,
                    },
                },
            },
        );

        if (
            template.template_type !== 'notification' &&
            !dto.is_active &&
            !activeTypeTemplate
        ) {
            throw new HttpException(
                'Cannot make this template inactive...Create a new active template with same template type',
                HttpStatus.BAD_REQUEST,
            );
        }

        return this.ormService.mailTemplate.update({
            where: { id },
            data: {
                is_active: dto.is_active,
            },
        });
    }

    async findOne(id: number) {
        const template = await this.ormService.mailTemplate.findFirst({
            where: { id },
        });

        if (!template) {
            throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
        }

        return template;
    }

    async remove(id: number) {
        const template = await this.findOne(id);

        const activeTypeTemplate = await this.ormService.mailTemplate.findFirst(
            {
                where: {
                    template_type: template.template_type,
                    is_active: true,
                    NOT: {
                        id,
                    },
                },
            },
        );

        if (template.template_type !== 'notification' && !activeTypeTemplate) {
            throw new HttpException(
                'Cannot delete this template...Create a new active template with same template type',
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.mediaService.deleteFile(template.path);

        return this.ormService.mailTemplate.delete({
            where: {
                id,
            },
        });
    }
}
