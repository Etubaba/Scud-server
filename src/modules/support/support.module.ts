import { Module } from '@nestjs/common';
import { SupportQuestionController } from './controllers/support-questions.controller';
import { SupportCategoriesController } from './controllers/support-categories.controller';
import { SupportQuestionService } from './services/support-questions.service';
import { SupportCategoriesService } from './services/support-categories.service';
import { MailService } from '../notifications/services/mail.service';
import { SettingsService } from '../settings/services/settings.service';

@Module({
    providers: [SupportQuestionService, SupportCategoriesService, MailService, SettingsService],
    controllers: [SupportQuestionController, SupportCategoriesController],
})
export class SupportModule {}
