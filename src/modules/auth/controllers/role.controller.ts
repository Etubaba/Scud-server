import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Permissions } from '../decorators/permission.decorator';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RolesService } from '../services/roles.service';

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create-roles')
    create(@Body() createUserDto: CreateRoleDto) {
        return this.rolesService.create(createUserDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('read-roles')
    list() {
        return this.rolesService.list();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('read-roles')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(+id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.CREATED)
    @Permissions('update-roles')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateRoleDto) {
        return this.rolesService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('delete-roles')
    remove(@Param('id') id: string) {
        return this.rolesService.remove(+id);
    }
}
