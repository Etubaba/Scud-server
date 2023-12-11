import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RecordIsInDb } from 'src/common/decorators/record_is_in_db.decorator';

export class CreateSupportQuestionDto {
    @IsNumber()
    @IsNotEmpty()
    @RecordIsInDb('supportCategory.id')
    category_id: number;

    @IsString()
    @IsNotEmpty()
    question: string;

    @IsString()
    @IsNotEmpty()
    answer: string;
}
