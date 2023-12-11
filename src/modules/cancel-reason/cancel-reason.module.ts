import { Module } from '@nestjs/common';
import { CancelReasonController } from './controllers/cancel-reason.controller';
import { CancelReasonService } from './services/cancel-reason.service';

@Module({
    providers: [CancelReasonService],
    controllers: [CancelReasonController],
})
export class CancelReasonModule {}
