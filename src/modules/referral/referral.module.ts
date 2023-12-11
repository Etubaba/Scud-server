import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { ReferralController } from './controllers/referral.controller';
import { ReferralService } from './services/referral.service';
@Module({
    imports: [AuthModule, UsersModule],
    controllers: [ReferralController],
    providers: [ReferralService, UsersService],
})
export class ReferralModule {}
