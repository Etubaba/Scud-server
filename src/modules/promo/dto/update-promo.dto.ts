import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsArray,
    ArrayNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { CreatePromoDto } from './create-promo.dto';

export class UpdatePromoDto extends PartialType(CreatePromoDto) {
    @ApiProperty({
        description: 'Id of users who can use the promo',
        example: [1, 45, 23, 12],
    })
    @IsNotEmpty()
    @IsOptional()
    @IsArray()
    user_ids: number[];

    @ApiProperty({
        description: 'Unique code for the promo',
        example: 'ANIVERSARY10',
    })
    @IsNotEmpty()
    @IsString()
    code: string;
}
