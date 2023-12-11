import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
} from 'class-validator';
import { IsNotOptionalIf } from 'src/common/decorators/is-optional.decorator';

export class CreateDiscountDto {
    @ApiProperty({
        description: 'The locations id ',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    location_id: number;

    @ApiProperty({
        description: 'if the discount is active',
        example: true,
    })
    @IsNotEmpty()
    @IsBoolean()
    is_active: boolean;

    @ApiProperty({
        description: 'if the discount is active',
        example: true,
    })
    @IsNotEmpty()
    @IsEnum(DiscountType)
    type: DiscountType;

    @ApiProperty({
        description: 'if the discount is active',
        example: true,
    })
    @IsNotOptionalIf((obj) => validateIf(obj, 'default'))
    @IsNotEmpty()
    @IsNumber()
    total: number;

    @ApiProperty({
        description: 'if the discount is active',
        example: true,
    })
    @IsNotOptionalIf((obj) => validateIf(obj, 'default', 'active', 'inactive'))
    @IsNotEmpty()
    @IsNumber()
    percentage: number;

    @ApiProperty({
        description: 'if the discount is active',
        example: true,
    })
    @IsNotOptionalIf((obj) => validateIf(obj, 'default'))
    @IsNotEmpty()
    @IsNumber()
    no_of_trips: number;

    @ApiProperty({
        description: 'The date the discount starts',
        example: '2021-04-21T00:00:00+01:00',
    })
    @IsNotEmpty()
    @IsDateString()
    start_date: string;

    @ApiProperty({
        description: 'The date the discount ends',
        example: '2021-04-28T00:00:00+01:00',
    })
    @IsNotEmpty()
    @IsDateString()
    end_date: string;
}

function validateIf(obj: { type: string }, ...types: DiscountType[]): boolean {
    const shouldValidate = types.includes(obj.type as DiscountType);
    return shouldValidate;
}
