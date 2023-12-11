import { ApiProperty } from '@nestjs/swagger';
import { PaymentType } from '@prisma/client';
import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';
import { RecordIsInDb } from 'src/common/decorators/record_is_in_db.decorator';

export class CreatePromoDto {
    @ApiProperty({
        description: 'Unique code for the promo',
        example: 'ANIVERSARY10',
    })
    @IsNotEmpty()
    @IsString()
    @RecordExists('promo.code')
    code: string;

    @ApiProperty({
        description: 'Choose type of promo payment amount or percentage',
        example: 'amount',
    })
    @IsOptional()
    @IsEnum(PaymentType)
    promo_payment_type: PaymentType;

    @ApiProperty({
        description: 'Amount for the promo',
        example: '1000',
    })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'City where the promo is applied',
        example: 'Port Harcourt',
    })
    @IsNotEmpty()
    @IsNumber()
    @RecordIsInDb('city.id')
    city_id: number;

    @ApiProperty({
        description: 'Expiration date of promo',
        example: '2023-12-23',
    })
    @IsNotEmpty()
    @IsString()
    expiry: string;

    @ApiProperty({
        description: 'Specifies if promo is active or not',
        example: 'true',
    })
    @IsNotEmpty()
    @IsBoolean()
    is_active: boolean;

    @ApiProperty({
        description: 'Description of the promo',
        example: 'lorem ipsum',
    })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Number of rides the promo is applicable to',
        example: 12,
    })
    @IsOptional()
    @IsNumber()
    number_of_rides: number;

    @ApiProperty({
        description: 'Id of users who can use the promo',
        example: [1, 45, 23, 12],
    })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    user_ids: number[];
}
