import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';

export class CreateVehicleBrandDto {
    @ApiProperty({
        description: 'The brand name',
        example: 'Toyota',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    @RecordExists('vehicleBrand.name')
    name: string;

    @ApiProperty({
        description: 'The active status of the brand',
        example: true,
        type: Boolean,
    })
    @IsOptional()
    @IsBoolean()
    is_active: boolean;
}
