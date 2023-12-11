import { ApiProperty } from '@nestjs/swagger';
import { Gender, Provider } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsEmail,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsPositive,
    IsString,
} from 'class-validator';
import { IsInternationalFormat } from 'src/common/decorators/is_international_format.decorator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';
import { RecordIsInDb } from 'src/common/decorators/record_is_in_db.decorator';

export class UpdateProfileDto {
    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
    })
    @IsOptional()
    @IsString()
    first_name: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
    })
    @IsOptional()
    @IsString()
    last_name: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'example@mail.com',
    })
    @IsOptional()
    @IsEmail()
    @IsString()
    @RecordExists('user.email')
    email: string;

    @ApiProperty({
        description: 'Phone number',
        example: '09033068587',
    })
    @IsOptional()
    @RecordExists('user.phone')
    @IsPhoneNumber('NG')
    @IsInternationalFormat()
    phone: string;

    @ApiProperty({
        description: 'This is the login provider for the user',
        example: 'email',
    })
    @IsOptional()
    provider: Provider;

    @ApiProperty({
        description: 'user gender',
        example: 'female',
    })
    @IsOptional()
    @IsIn(Object.values(Gender))
    gender: Gender;

    @ApiProperty({
        description: 'Max pickup distance for drivers (KM)',
        example: 10,
    })
    @IsOptional()
    @IsPositive()
    @IsNumber()
    max_pickup_distance: number;

    @ApiProperty({
        description: '',
        example: 1,
    })
    @IsOptional()
    @IsPositive()
    @IsNumber()
    @RecordIsInDb('state.id')
    state_id: number;

    @IsOptional()
    @IsPositive()
    @RecordIsInDb('vehicleType.id')
    vehicle_type_id: number;

    @ApiProperty({
        description: 'Residential Adddress',
        example: '1600 Amphitheatre Parkway Mountain View, CA 94043, USA',
    })
    @IsOptional()
    @IsString()
    address: string;
}
