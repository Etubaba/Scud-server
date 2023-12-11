import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject } from 'class-validator';
import { Coordinate } from 'src/modules/location/dtos/create-location.dto';

export class CheckPromoDto {
    @ApiProperty({
        description: 'The Pickup Location For the driver',
        example: {
            latitude: '5.66666',
            longitude: '1.334555',
        },
    })
    @IsNotEmpty()
    @IsObject()
    @Type(() => Coordinate)
    pickup: Coordinate;

    @ApiProperty({
        description: 'The Destination Location For the driver',
        example: {
            latitude: '5.66666',
            longitude: '1.334555',
        },
    })
    @IsNotEmpty()
    @IsObject()
    @Type(() => Coordinate)
    destination: Coordinate;
}
