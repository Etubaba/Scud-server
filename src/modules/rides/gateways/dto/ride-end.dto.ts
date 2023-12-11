import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Coordinate } from 'src/modules/location/dtos/create-location.dto';

export class RideEndDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => Coordinate)
    dropoff: Coordinate;
}
