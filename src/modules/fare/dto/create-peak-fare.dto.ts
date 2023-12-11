import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
    IsDecimal,
    IsNotEmpty,
    IsNumber,
    IsString,
} from 'class-validator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';

export class CreatePeakFareDto {
    @ApiProperty({
        description: 'The id of the fare ',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    fare_id: number;

    @ApiProperty({
        description: 'Day for peak to be applied',
        example: 'Monday',
    })
    @IsNotEmpty()
    @IsString()
    day: string;

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
