import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';
import { CreateSupportCategoryDto } from '../dtos/create-support-category.dto';
import { SupportQuestionService } from './support-questions.service';
import { CreateSupportQuestionDto } from '../dtos/create-support-question.dto';
import { UpdateSupportCategoryDto } from '../dtos/update-support-category.dto';

@Injectable()
export class SupportCategoriesService {
    private includeFields = {
        support_questions: {
            select: {
                id: true,
                question: true,
                answer: true,
                created_at: true,
                updated_at: true,
            },
        },
    };

    constructor(
        private readonly ormService: OrmService,
        private readonly supportQuestionService: SupportQuestionService,
    ) {}

    async list() {
        return this.ormService.supportCategory.findMany({
            include: this.includeFields,
        });
    }

    async create(dto: CreateSupportCategoryDto) {
        const category = await this.ormService.supportCategory.create({
            data: {
                name: dto.name,
            },
        });

        const data: CreateSupportQuestionDto = {
            category_id: category.id,
            answer: dto.answer,
            question: dto.question,
        };

        const question = await this.supportQuestionService.create(data);

        return {
            category,
            question,
        };
    }

    async findOne(id: number) {
        const category = await this.ormService.supportCategory.findUnique({
            where: {
                id,
            },
            include: this.includeFields,
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async update(id: number, dto: UpdateSupportCategoryDto) {
        await this.findOne(id);

        const category = await this.ormService.supportCategory.findFirst({
            where: {
                name: dto.name,
                NOT: {
                    id,
                },
            },
        });

        if (category) {
            throw new ConflictException('Category already exists');
        }

        return await this.ormService.supportCategory.update({
            where: {
                id,
            },
            data: {
                name: dto.name,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);

        return this.ormService.supportCategory.delete({
            where: {
                id,
            },
        });
    }
}
