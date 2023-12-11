import { IsLatitude, IsLongitude, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsersLocationDto {
    @ApiProperty({
        description: '',
        example: '',
    })
    @IsNotEmpty()
    @IsLatitude()
    latitude: string;
    @ApiProperty({
        description: '',
        example: '',
    })
    @IsNotEmpty()
    @IsLongitude()
    longitude: string;
}
