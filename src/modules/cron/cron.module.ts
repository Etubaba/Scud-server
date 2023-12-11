import { Module } from '@nestjs/common';
import { CronService } from './services/cron.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [CronService],
    exports: [CronService],
})
export class CronModule {}
