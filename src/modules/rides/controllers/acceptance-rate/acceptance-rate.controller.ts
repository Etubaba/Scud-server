import { Controller, Get, Query } from '@nestjs/common';
import { AcceptanceRateService } from '../../services/acceptance-rate/acceptance-rate.service';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '@prisma/client';

@Controller('acceptancerate')
export class AcceptanceRateController {
    constructor(
        private readonly acceptanceRateService: AcceptanceRateService,
    ) {}

    @Get()
    async get(@AuthUser() user: User, @Query() query) {
        return this.acceptanceRateService.get(user.id, query);
    }
}
