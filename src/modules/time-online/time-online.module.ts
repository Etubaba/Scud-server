import { Module } from '@nestjs/common';
import { TimeOnlineService } from './services/time_online.service';
import { TimeOnlineController } from './controllers/time_online.controller';

@Module({
    providers: [TimeOnlineService],
    controllers: [TimeOnlineController],
    exports: [TimeOnlineService],
})
export class TimeOnlineModule {}
