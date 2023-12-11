import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';

export class CreateFaqDto {
    @ApiProperty({
        description: 'The faq question',
        example: 'How much do you charge for a ride',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    @RecordExists('faq.question')
    question: string;

    @ApiProperty({
        description: 'The faq answer',
        example: 'It varies',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    answer: string;
}
