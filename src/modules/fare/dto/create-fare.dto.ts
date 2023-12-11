import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';
import { RecordExistsFields } from 'src/common/decorators/record_exists_fields.decorator';
import { RecordIsInDb } from 'src/common/decorators/record_is_in_db.decorator';

export class CreateFareDto {
    @ApiProperty({
        description: 'Location id of the fare',
        example: '1 (representing Lagos)',
    })
    @IsNotEmpty()
    @IsNumber()
    location_id: number;

    @ApiProperty({
        description: 'Vehicle Type id',
        example: '1 (representing Premium)',
    })
    @IsNotEmpty()
    @IsNumber()
    @RecordIsInDb('vehicleType.id')
    @RecordExistsFields(['fare.vehicle_type_id', 'location_id'])
    vehicle_type_id: number;

    @ApiProperty({
        description: 'Base fare',
        example: '500',
    })
    @IsNotEmpty()
    @IsNumber()
    base_fare: number;

    @ApiProperty({
        description: 'Capacity of the vehicle Type',
        example: '4',
    })
    @IsNotEmpty()
    @IsNumber()
    capacity: number;

    @ApiProperty({
        description: 'Minimum Fare for uncompleted rides',
        example: '700',
    })
    @IsNotEmpty()
    @IsNumber()
    minimum_fare: number;

    @ApiProperty({
        description: 'Charge for each minute',
        example: '10',
    })
    @IsNotEmpty()
    @IsNumber()
    per_minutes: number;

    @ApiProperty({
        description: 'Charge for each kilometer ',
        example: '25',
    })
    @IsNotEmpty()
    @IsNumber()
    per_kilometer: number;

    @ApiProperty({
        description: 'Time to wait before adding waiting time charges',
        example: '20',
    })
    @IsNotEmpty()
    @IsNumber()
    waiting_time_limit: number;

    @ApiProperty({
        description: 'Charges to apply per minute after waiting time',
        example: '10',
    })
    @IsNotEmpty()
    @IsNumber()
    waiting_time_charges: number;

    @ApiProperty({
        description: 'Whether to or not apply peak fare',
        example: 'True',
    })
    @IsNotEmpty()
    @IsBoolean()
    apply_peak_fare: boolean;

    @ApiProperty({
        description: 'Whether to or not apply night fare',
        example: 'yes',
    })
    @IsNotEmpty()
    @IsBoolean()
    apply_fares: boolean;
}
