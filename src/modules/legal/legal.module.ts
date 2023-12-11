import { Module } from '@nestjs/common';
import { TermsOfServicesService } from './services/terms-of-services.service';
import { TermsOfServicesController } from './controllers/terms-of-services.controller';

@Module({
    controllers: [TermsOfServicesController],
    providers: [TermsOfServicesService],
})
export class LegalModule {}
