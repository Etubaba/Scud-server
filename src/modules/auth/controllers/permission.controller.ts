import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Permissions } from '../decorators/permission.decorator';
import { PermissionsService } from '../services/permissions.service';

@Controller('permissions')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-permissions')
    list() {
        return this.permissionsService.list();
    }
}
