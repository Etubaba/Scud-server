import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateIncentivesDto {
    @ApiProperty({
        description: 'Name of reward tier',
        example: 'Tier 1',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Description of tier',
        example: 'Tier 1 Description',
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        description:
            'Id of previously created tier that driver needs to complete to move to this tier',
        example: '1',
    })
    @IsOptional()
    @IsNumber()
    previous_tier_id: number;

    @ApiProperty({
        description: 'Number of rides to be completed',
        example: '20',
    })
    @IsNotEmpty()
    @IsNumber()
    rides: number;

    @ApiProperty({
        description: 'Number of days',
        example: '7',
    })
    @IsNotEmpty()
    @IsNumber()
    duration: number;

    @ApiProperty({
        description: 'Amount to be rewarded',
        example: '1000',
    })
    @IsNotEmpty()
    @IsNumber()
    reward: number;

    @ApiProperty({
        description: 'Status of cancel reason',
        example: 'true or false',
    })
    @IsBoolean()
    is_active: boolean;
}
