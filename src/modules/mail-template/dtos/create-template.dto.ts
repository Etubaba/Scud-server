import { TemplateType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsBooleanString,
    IsIn,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class CreateTemplateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsIn(Object.values(TemplateType))
    template_type: TemplateType;

    @IsIn(['true', 'false'])
    @IsBooleanString()
    is_active: string;
}
