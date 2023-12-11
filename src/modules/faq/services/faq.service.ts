import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { OrmService } from 'src/database/orm.service';
import { PaginationService } from 'src/database/pagination.service';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { UpdateFaqDto } from '../dto/update-faq.dto';

@Injectable()
export class FaqService {
    model: string = 'faq';
    constructor(
        private readonly ormService: OrmService,
        private settingsService: SettingsService,
        private readonly paginationService: PaginationService,
    ) {}

    async list(query: any, request: Request) {
        return await this.paginationService.paginate(
            request,
            this.model,
            query,
            {
                id: true,
                question: true,
                answer: true,
                created_at: true,
                updated_at: true,
            },
        );
    }

    async create(dto: CreateFaqDto) {
        const faq = await this.ormService.faq.create({
            data: {
                answer: dto.answer,
                question: dto.question,
            },
        });

        return faq;
    }

    async findOne(id: number) {
        const faq = await this.ormService.faq.findFirst({
            where: {
                id,
            },
        });
        if (!faq) {
            throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
        }
        return faq;
    }

    async update(id: number, dto: UpdateFaqDto) {
        await this.findOne(id);
        return this.ormService.faq.update({
            where: {
                id,
            },
            data: {
                answer: dto.answer,
                question: dto.question,
            },
        });
    }
    async delete(id: number) {
        await this.findOne(id);
        return this.ormService.faq.delete({
            where: {
                id,
            },
        });
    }
}
