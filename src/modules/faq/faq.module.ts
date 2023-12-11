import { Module } from '@nestjs/common';
import { FaqController } from './controllers/faq.controller';
import { FaqService } from './services/faq.service';

@Module({
    controllers: [FaqController],
    providers: [FaqService],
})
export class FaqModule {}
