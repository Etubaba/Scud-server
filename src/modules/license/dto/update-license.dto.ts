import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateLicenseDto } from './create-license.dto';

export class UpdateLicenseDto extends PartialType(CreateLicenseDto) {
    @ApiProperty({
        description: 'Verification status',
        example: 'pending',
    })
    @IsString()
    verification: string;
}
