import { PaymentMode } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsLatitude,
    IsNotEmpty,
    IsNumber,
    ValidateNested,
} from 'class-validator';
import { RecordIsActive } from 'src/common/decorators/record_active.decorator';
import { Coordinate } from 'src/modules/location/dtos/create-location.dto';

export class RideRequestDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => Coordinate)
    pickup: Coordinate;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => Coordinate)
    dropoff: Coordinate;

    @IsNotEmpty()
    @IsEnum(PaymentMode)
    mode: PaymentMode;

    @IsNotEmpty()
    @IsNumber()
    @RecordIsActive('vehicleType.is_active', 'id')
    vehicle_type_id: number;
}
