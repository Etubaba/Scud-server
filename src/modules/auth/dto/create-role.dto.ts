import { ApiProperty } from '@nestjs/swagger';
import { IsArray, isNotEmpty, IsNotEmpty, IsString } from 'class-validator';
import { RecordExists } from 'src/common/decorators/record_exists.decorator';

export class CreateRoleDto {
    @ApiProperty({
        description: 'Name of the Role',
        example: 'Admin',
    })
    @IsNotEmpty()
    @IsString()
    @RecordExists('role.name')
    name: string;

    @ApiProperty({
        description: 'List of Permissions for this role',
        example: "['create-users', 'update-users']",
    })
    @IsNotEmpty()
    permissions: string[];
}
