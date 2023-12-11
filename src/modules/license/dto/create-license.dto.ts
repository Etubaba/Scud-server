import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';
export class CreateLicenseDto {
    @ApiProperty({
        description: 'License number of the vehicle',
        example: 'kgkfp044',
    })
    @IsNotEmpty()
    @IsString()
    license_number: string;

    @ApiProperty({
        description: 'user id',
        example: '1232112',
    })
    @IsNotEmpty()
    user_id: number;

    @IsString()
    @IsNotEmpty()
    expiry: string;
}
