import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSupportCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}
