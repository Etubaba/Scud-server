import { Global, Module } from '@nestjs/common';
import { MailTemplateController } from './controllers/mail-template.controller';
import { MailTemplateService } from './services/mail-template.service';
@Global()
@Module({
    controllers: [MailTemplateController],
    providers: [MailTemplateService],
})
export class MailTemplateModule {}
