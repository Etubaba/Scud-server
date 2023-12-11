import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { Coordinate } from 'src/modules/location/dtos/create-location.dto';
import { RecordIsActive } from 'src/common/decorators/record_active.decorator';
export class CalculateFareDto {
    // @IsNotEmpty()
    // @IsNumber()
    // @RecordIsActive('location.is_active', 'id')
    // location_id: number;

    @IsNotEmpty()
    @IsNumber()
    @RecordIsActive('vehicleType.is_active', 'id')
    vehicle_type_id: number;

    @IsNotEmpty()
    @IsObject()
    @Type(() => Coordinate)
    pickup: Coordinate;

    @IsNotEmpty()
    @IsObject()
    @Type(() => Coordinate)
    destination: Coordinate;
}
