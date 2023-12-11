import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateLocationStatusDto {
    @ApiProperty({
        description: 'Status',
        example: 'true',
    })
    @IsBoolean()
    is_active: boolean;
}
