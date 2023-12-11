import { IsBoolean } from 'class-validator';

export class UpdateTemplateDto {
    @IsBoolean()
    is_active: boolean;
}
