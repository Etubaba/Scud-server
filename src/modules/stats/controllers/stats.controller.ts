import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { StatsService } from '../services/stats.service';

@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    list() {
        return this.statsService.list();
    }
}
