import { PartialType } from '@nestjs/mapped-types';
import { CreateSupportQuestionDto } from './create-support-question.dto';

export class UpdateSupportQuestionDto extends PartialType(
    CreateSupportQuestionDto,
) {}
