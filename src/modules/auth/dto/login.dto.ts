import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { roles } from '../roles';
import { OneIsNeeded } from 'src/common/decorators/one_is_needed.decorator';
import { Provider } from '@prisma/client';

export class LoginDto {
    @ApiProperty({
        description: 'Phone number of the user',
        example: '080333333333',
    })
    @OneIsNeeded('email')
    @IsOptional()
    phone: string;

    @ApiProperty({
        description: 'Phone number of the user',
        example: '080333333333',
    })
    @OneIsNeeded('phone')
    @IsEmail()
    @IsOptional()
    email: string;

    @ApiProperty({
        description: 'otp of the user',
        example: '123456',
    })
    otp: string;

    @ApiProperty({
        description: 'roles to login as',
        example: ['rider'],
        enum: Object.values(roles),
    })
    @IsOptional()
    @IsIn(Object.values(roles), {
        each: true,
    })
    roles: string[];

    @ApiProperty({
        description: 'The means for sending the otp',
        example: 'email',
        enum: Provider,
    })
    @IsIn(Object.values(Provider))
    provider: Provider;
}
