import { TermsCategory } from '@prisma/client';
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateTermsOfServicesDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsBoolean()
    is_active: boolean;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(Object.values(TermsCategory))
    category: TermsCategory;
}
