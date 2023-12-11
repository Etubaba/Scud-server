import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsString,
} from 'class-validator';
import { roles } from 'src/modules/auth/roles';

export class CreateCancelReasonDto {
    @ApiProperty({
        description: 'Reason a Ride can be cancelled',
        example: 'Driver cancelled ride',
    })
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiProperty({
        description: 'Status of cancel reason',
        example: 'true or false',
    })
    @IsBoolean()
    is_active: boolean;

    @ApiProperty({
        description:
            'This is a list of user groups(roles) names that this reason applies to',
        example: "['rider', 'driver']",
    })
    @IsNotEmpty()
    @IsArray()
    @IsIn(Object.values(roles), { each: true })
    groups: string[];

    @ApiProperty({
        description: 'Score point to be deducted from driver',
        example: 2,
    })
    @IsNumber()
    @IsNotEmpty()
    deductible_score: number;
}
