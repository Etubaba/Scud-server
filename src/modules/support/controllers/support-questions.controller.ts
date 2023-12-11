import {
    BadRequestException,
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
} from '@nestjs/common';
import { SupportQuestionService } from '../services/support-questions.service';
import { ApiQuery } from '@nestjs/swagger';
import { CreateSupportQuestionDto } from '../dtos/create-support-question.dto';
import { UpdateSupportQuestionDto } from '../dtos/update-support-question.dto';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { Guest } from 'src/modules/auth/decorators/public.decorator';
import { RaiseSupportIssueDto } from '../dtos/raise-issue.dto';
import { BypassVerification } from 'src/modules/auth/decorators/bypass-verification.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '@prisma/client';

@Controller('support-questions')
export class SupportQuestionController {
    constructor(
        private readonly supportQuestionService: SupportQuestionService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiQuery({ name: 'category_id' })
    @Guest()
    @BypassVerification()
    list(@Query() query) {
        if (!query.length && !query.category_id) {
            throw new BadRequestException(
                'You need to provide category_id as query parameter',
            );
        }

        return this.supportQuestionService.list(+query.category_id);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Guest()
    @BypassVerification()
    findOne(@Param('id') id: string) {
        return this.supportQuestionService.findOne(+id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-support')
    create(@Body() data: CreateSupportQuestionDto) {
        return this.supportQuestionService.create(data);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-support')
    update(@Body() data: UpdateSupportQuestionDto, @Param('id') id: string) {
        return this.supportQuestionService.update(+id, data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-support')
    remove(@Param('id') id: string) {
        return this.supportQuestionService.remove(+id);
    }

    @Post('raise-issue')
    @HttpCode(HttpStatus.CREATED)
    raiseIssue(@Body() data: RaiseSupportIssueDto, @AuthUser() user: User) {
        return this.supportQuestionService.raiseIssue(data, user);
    }
}
