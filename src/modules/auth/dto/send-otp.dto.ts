import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';
import { Match } from '../../../common/decorators/match.decorator';

export class LoginOtpDto {
    @ApiProperty({
        description: 'Otp sent to the user',
        example: '451269',
    })
    @IsNotEmpty()
    @IsString()
    phone: string;
}
