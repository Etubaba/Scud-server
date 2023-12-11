import { Module } from '@nestjs/common';
import { LicenseService } from './services/license.service';
import { LicenseController } from './controllers/license.controller';
import { UsersService } from '../users/users.service';
import { MediaModule } from '../media/media.module';

@Module({
    imports: [MediaModule],
    controllers: [LicenseController],
    providers: [LicenseService, UsersService],
})
export class LicenseModule {}
