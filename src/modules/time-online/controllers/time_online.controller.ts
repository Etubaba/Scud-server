import { Controller, Get, Param } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { TimeOnlineService } from '../services/time_online.service';

@Controller('timeonline')
export class TimeOnlineController {
    constructor(private readonly timeOnlineService: TimeOnlineService) {}
    @Get()
    list() {
        return this.timeOnlineService.list();
    }

    @Get(':id')
    get(@Param('id') id: string) {
        return this.timeOnlineService.get(+id);
    }

    @Get('find/user/:id')
    getByUser(@Param('id') id: string) {
        return this.timeOnlineService.getByDriver(+id);
    }

    @Get('user/logged-in')
    getForSelf(@AuthUser() user: User) {
        return this.timeOnlineService.getByDriver(+user.id);
    }
}
