import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';
import { Match } from '../../../common/decorators/match.decorator';

export class VerifyOtpDto {
    @ApiProperty({
        description: 'Otp sent to the user',
        example: '451269',
    })
    @IsNotEmpty()
    @IsString()
    otp: string;

    @ApiProperty({
        description: 'otp type',
        example: 'register',
    })
    @IsNotEmpty()
    @IsString()
    otp_type: string;
}
