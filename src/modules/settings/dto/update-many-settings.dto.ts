import { settings } from './../settings';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsIn,
    ValidateNested,
} from 'class-validator';
import { IsSameLength } from 'src/common/decorators/same-length.decorator';

export class UpdateManySettings {
    @ApiProperty({
        description: 'key of the setting you are updating',
        example: 'minimum_referral_amount',
    })
    @IsNotEmpty()
    @IsArray()
    keys: string[];

    @ApiProperty({
        description: 'N20000',
        example: 200000,
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    @IsSameLength('keys')
    values: string[];
}
