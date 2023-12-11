import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsBoolean } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { RecordIsInDb } from 'src/common/decorators/record_is_in_db.decorator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: 'Max pickup distance for drivers (KM)',
        example: 10,
    })
    @IsOptional()
    @IsPositive()
    @IsNumber()
    max_pickup_distance: number;

    @ApiProperty({
        description: 'state id',
        example: 1,
    })
    @IsOptional()
    @IsPositive()
    @IsNumber()
    @RecordIsInDb('state.id')
    state_id: number;

    @IsOptional()
    @IsBoolean()
    is_active: boolean;

    @IsOptional()
    @IsPositive()
    @RecordIsInDb('vehicleType.id')
    vehicle_type_id: number;
}
