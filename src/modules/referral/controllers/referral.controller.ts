import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ReferralService } from '../services/referral.service';

@Controller('referrals')
export class ReferralController {
    constructor(private readonly referralService: ReferralService) {}

    @Post()
    create(@Query('ref') ref: string, @Req() request) {
        const { sub, ..._ }: { sub: number; _: any } = request.user;
        return this.referralService.create(sub, ref);
    }

    @Get()
    list(@Req() request) {
        return this.referralService.list();
    }
}
