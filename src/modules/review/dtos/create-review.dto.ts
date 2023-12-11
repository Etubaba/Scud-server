import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { RecordIsInDb } from 'src/common/decorators/record_is_in_db.decorator';

export class CreateReviewDto {
    @ApiProperty({
        description: 'The riders id',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @RecordIsInDb('user.id')
    reviewer_id: number;

    @ApiProperty({
        description: 'The driver id',
        example: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    @RecordIsInDb('user.id')
    reviewed_id: number;

    @ApiProperty({
        description: 'The rating',
        example: 1,
    })
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    comment: string;

    @IsOptional()
    @IsNumber()
    @RecordIsInDb('trip.id')
    trip_id?: number;
}
