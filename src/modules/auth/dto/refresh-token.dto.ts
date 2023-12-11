import { IsJWT, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
    @ApiProperty({
        description: 'the refresh token of the user',
        example: '1kdkttlllsjyyrr',
    })
    @IsNotEmpty()
    @IsJWT()
    refreshToken: string;
}
