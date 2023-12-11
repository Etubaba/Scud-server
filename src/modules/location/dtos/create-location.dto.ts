import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsLatitude,
    IsNotEmpty,
    IsNumber,
    IsString,
    ValidateNested,
} from 'class-validator';
import { IsNonPrimitiveArray } from 'src/common/decorators/is-non-primitive-array.decorator';
import { RecordIsActive } from 'src/common/decorators/record_active.decorator';

export class Coordinate {
    @IsNotEmpty()
    @IsLatitude()
    latitude: string;

    @IsNotEmpty()
    @IsLatitude()
    longitude: string;
}

export class CreateLocationDto {
    @ApiProperty({
        description: 'Name of Location',
        example: 'Lagos',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Location coordinates',
        example: `
            [
                {latitude: 1.900, latitude: 2.000}
            ]
        `,
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsNonPrimitiveArray()
    @ValidateNested({ each: true })
    @Type(() => Coordinate)
    coordinates: Coordinate[];

    @ApiProperty({
        description: 'Status of location',
        example: 'true or false',
    })
    @IsBoolean()
    is_active: boolean;

    @ApiProperty({
        description: 'Status of location',
        example: 'true or false',
    })
    @IsNumber()
    @IsNotEmpty()
    @RecordIsActive('city.is_active', 'id')
    city_id: number;
}
