import {
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { OrmService } from 'src/database/orm.service';
import { CreateSupportQuestionDto } from '../dtos/create-support-question.dto';
import { UpdateSupportQuestionDto } from '../dtos/update-support-question.dto';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import { MailService } from 'src/modules/notifications/services/mail.service';
import { RaiseSupportIssueDto } from '../dtos/raise-issue.dto';
import { settings } from 'src/modules/settings/settings';
import { User } from '@prisma/client';

@Injectable()
export class SupportQuestionService {

    constructor(
        private readonly ormService: OrmService,
        private readonly mailService: MailService,
        private readonly settingService: SettingsService
    ) {}

    async list(category_id: number) {
        return await this.ormService.supportQuestion.findMany({
            where: {
                category_id: category_id,
            },
        });
    }

    async create(dto: CreateSupportQuestionDto) {
        const questionExists = await this.ormService.supportQuestion.findFirst({
            where: {
                question: dto.question,
                category_id: dto.category_id,
            },
        });

        if (questionExists) {
            throw new ConflictException('Question already exists');
        }

        return this.ormService.supportQuestion.create({
            data: {
                category_id: dto.category_id,
                question: dto.question,
                answer: dto.answer,
            },
        });
    }

    async findOne(id: number) {
        const question = await this.ormService.supportQuestion.findUnique({
            where: {
                id,
            },
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        return question;
    }

    async update(id: number, dto: UpdateSupportQuestionDto) {
        await this.findOne(id);

        const questionExists = await this.ormService.supportQuestion.findFirst({
            where: {
                question: dto.question,
                category_id: dto.category_id,
                NOT: {
                    id,
                },
            },
        });

        if (questionExists) {
            throw new ConflictException('Question already exists');
        }

        return this.ormService.supportQuestion.update({
            where: {
                id,
            },
            data: {
                answer: dto.answer,
                question: dto.question,
            },
        });
    }

    async remove(id: number) {
        await this.findOne(id);

        return this.ormService.supportQuestion.delete({
            where: {
                id,
            },
        });
    }

    async raiseIssue (dto: RaiseSupportIssueDto, user: User) {

        const { value: SUPPORT_EMAIL } = await this.settingService.get("SUPPORT_EMAIL");
        
        try {
            await this.mailService.sendWithoutTemplate(
                SUPPORT_EMAIL,
                dto.subject,
                `
                    Raised By: ${user.first_name} ${user.last_name} <br />
                    Phone: ${user.phone} <br />
                    Primary Email: ${user.email} <br />
                    Secondary Email: ${user.email} <br />
                    <br /><br />
                    <p>
                    ${dto.content}
                    </p>
                `
            )

            return {
                status: true,
                message: "Issue raised successsfully. Our correspondents will get to you shortly"
            }
        } catch (error) {
            throw new HttpException(
                "Failed to process this request. Please try again",
                HttpStatus.BAD_REQUEST
            )
        }

    }
}
