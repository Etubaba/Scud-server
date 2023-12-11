import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVehicleTypeDto {
    @ApiProperty({
        description: 'Vehicle type name',
        example: 'Lite',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Vehicle type minimum year',
        example: '2023',
    })
    @IsString()
    @IsNotEmpty()
    minimum_year: string;

    @ApiProperty({
        description: 'Vehicle type maximum year',
        example: '2028',
    })
    @IsOptional()
    @IsString()
    maximum_year?: string;

    @ApiProperty({
        description: 'Promo status',
        example: true,
    })
    @IsBoolean()
    @IsNotEmpty()
    is_active: boolean;
}
