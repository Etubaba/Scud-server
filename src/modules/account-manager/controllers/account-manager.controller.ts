import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Permissions } from 'src/modules/auth/decorators/permission.decorator';
import { AccountManagerService } from '../services/account-manager.service';

@Controller('account-managers')
export class AccountManagerController {
    constructor(
        private readonly accountManagerService: AccountManagerService,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('browse-account-manager')
    @ApiQuery({
        name: 'with-supervisors',
        type: Boolean,
    })
    list(@Query() query) {
        return this.accountManagerService.list(query);
    }
}
