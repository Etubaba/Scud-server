import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayNotEmpty,
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
} from 'class-validator';

export class AssignManagersDto {
    @ApiProperty({
        description: 'Supervisor id',
        type: 'number',
    })
    @IsNumber()
    @IsNotEmpty()
    supervisor_id: number;

    @ApiProperty({
        description: 'Id of every managers',
        type: 'array',
        items: {
            type: 'string',
        },
    })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    account_managers: number[];
}
