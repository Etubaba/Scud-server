import { Controller, Get, Query } from '@nestjs/common';
import { EarningsService } from '../services/earnings.service';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from '@prisma/client';
@Controller('earnings')
export class EarningsController {
    constructor(private readonly earningsService: EarningsService) {}
    @Get()
    async list(@AuthUser() user: User, @Query() query) {
        return this.earningsService.find(user.id, query);
    }
}
