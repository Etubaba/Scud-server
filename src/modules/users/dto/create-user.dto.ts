import { ApiProperty } from '@nestjs/swagger';
import { Gender, Provider } from '@prisma/client';
import {
    ArrayContains,
    IsArray,
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
import { roles } from 'src/modules/auth/roles';
export class CreateUserDto {
    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
    })
    @IsNotEmpty()
    @IsString()
    first_name: string;
    PAYSTACK_TEST_SECRET_KEY;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
    })
    @IsNotEmpty()
    @IsString()
    last_name: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'example@mail.com',
    })
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    @RecordExists('user.email')
    email: string;

    @ApiProperty({
        description: 'Phone number',
        example: '09033068587',
    })
    @IsNotEmpty()
    @RecordExists('user.phone')
    @IsPhoneNumber('NG')
    @IsInternationalFormat()
    phone: string;

    @ApiProperty({
        description: 'This is the login provider for the user',
        example: 'email',
    })
    @IsNotEmpty()
    provider: Provider;

    @ApiProperty({
        description: 'user gender',
        example: 'female',
    })
    @IsNotEmpty()
    @IsIn(Object.values(Gender))
    gender: Gender;

    @ApiProperty({
        description: 'user roles',
        example: "['admin', 'staff']",
        enum: Object.values(roles),
    })
    @IsArray()
    roles: string[];

    @ApiProperty({
        description: "User's state id",
        example: 1,
    })
    @IsNumber()
    @IsPositive()
    @RecordIsInDb('state.id')
    state_id: number;

    @ApiProperty({
        description: 'Residential Adddress',
        example: '1600 Amphitheatre Parkway Mountain View, CA 94043, USA',
    })
    @IsOptional()
    @IsString()
    address: string;
}
