import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateFaqDto } from './create-faq.dto';

export class UpdateFaqDto extends PartialType(CreateFaqDto) {
    @ApiProperty({
        description: 'The faq question',
        example: 'How much do you charge for a ride',
    })
    @IsNotEmpty()
    @IsString()
    question: string;
}
