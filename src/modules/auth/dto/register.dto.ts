import { ApiProperty } from '@nestjs/swagger';
import { Provider, Gender } from '@prisma/client';
import {
    IsEmail,
    IsIn,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from 'class-validator';
import { IsInternationalFormat } from 'src/common/decorators/is_international_format.decorator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';
import { RecordIsInDb } from 'src/common/decorators/record_is_in_db.decorator';
import { PUBLIC_ROLES } from '../roles';

export class RegisterDto {
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
    //@RecordExists('user.phone')
    @IsPhoneNumber('NG')
    @IsInternationalFormat()
    phone: string;

    @ApiProperty({
        description: 'This is the login provider for the user',
        example: 'email',
    })
    @IsOptional()
    @IsIn(Object.values(Provider))
    provider: Provider;

    @ApiProperty({
        description: 'user gender',
        example: 'female',
    })
    @IsOptional()
    @IsIn(Object.values(Gender))
    gender: Gender;

    @ApiProperty({
        description: 'roles',
        example: 'rider',
        enum: Object.values(PUBLIC_ROLES),
    })
    @IsOptional()
    @IsIn(Object.values(PUBLIC_ROLES))
    role: string;

    @ApiProperty({
        description: "User's state id",
        example: 1,
    })
    @IsOptional()
    @IsNumber()
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
