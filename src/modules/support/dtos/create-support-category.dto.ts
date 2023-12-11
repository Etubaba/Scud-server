import { IsNotEmpty, IsString } from 'class-validator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';

export class CreateSupportCategoryDto {
    @IsString()
    @IsNotEmpty()
    @RecordExists('supportCategory.name')
    name: string;

    @IsString()
    @IsNotEmpty()
    question: string;

    @IsString()
    @IsNotEmpty()
    answer: string;
}
