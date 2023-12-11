import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateDriverPromoDto {
    @ApiProperty({
        description: 'Name of promo',
        example: 'Car promo',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Array of vehicle type id',
        example: [1, 2],
    })
    @IsArray()
    vehicle_type_ids: number[];

    @ApiProperty({
        description: 'Array of location id',
        example: [1, 2],
    })
    @IsArray()
    location_ids: number[];

    @ApiProperty({
        description: 'Number of trips required for driver to match',
        example: 20,
    })
    @IsNumber()
    @IsNotEmpty()
    trips: number;

    @ApiProperty({
        description: 'Online time required for driver to match',
        example: 50,
    })
    @IsNumber()
    @IsNotEmpty()
    online_hours: number;

    @ApiProperty({
        description: 'Promo expiration date',
        example: '2023-12-23',
    })
    @IsString()
    @IsNotEmpty()
    expires_at: string;

    @ApiProperty({
        description:
            'Acceptance rate required for driver to match (percentage)',
        example: 90,
    })
    @IsNumber()
    @IsNotEmpty()
    acceptance_rate: number;

    @ApiProperty({
        description:
            'Cancellation rate required for driver to match (percentage)',
        example: 5,
    })
    @IsNumber()
    @IsNotEmpty()
    cancellation_rate: number;

    @ApiProperty({
        description: 'Score required for driver to match (percentage)',
        example: 85,
    })
    @IsNumber()
    @IsNotEmpty()
    driver_score: number;

    @ApiProperty({
        description: 'Promo status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    is_active: boolean;
}
