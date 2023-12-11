import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateNightFareDto {
    @ApiProperty({
        description: 'The id of the fare ',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    fare_id: number;

    @ApiProperty({
        description: 'Start time for the peak',
        example: '12:00am',
    })
    @IsNotEmpty()
    @IsString()
    start_time: string;

    @ApiProperty({
        description: 'When peak ends',
        example: '4:00am',
    })
    @IsNotEmpty()
    @IsString()
    end_time: string;

    @ApiProperty({
        description: 'The decimal multiplier to add to the fare',
        example: '1.2',
    })
    @IsNotEmpty()
    @IsNumber()
    multiplier: string;
}
