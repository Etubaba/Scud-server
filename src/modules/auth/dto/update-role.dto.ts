import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
    @ApiProperty({
        description: 'Name of the Role',
        example: 'Admin',
    })
    @IsNotEmpty()
    @IsString()
    @RecordExists('role.name')
    name: string;
}
