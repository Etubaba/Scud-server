import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSettings {
    @ApiProperty({
        description: 'key of the setting you are updating',
        example: 'minimum_referral_amount',
    })
    @IsNotEmpty()
    @IsString()
    key: string;

    @ApiProperty({
        description: 'N20000',
        example: 200000,
    })
    @IsNotEmpty()
    value: string;
}
