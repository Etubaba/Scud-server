import { Module } from '@nestjs/common';
import { StatsController } from './controllers/stats.controller';
import { StatsService } from './services/stats.service';

@Module({
    providers: [StatsService],
    controllers: [StatsController],
})
export class StatsModule {}
