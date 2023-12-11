import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AccountManagerController } from './controllers/account-manager.controller';
import { SupervisorController } from './controllers/supervisor.controller';
import { AccountManagerService } from './services/account-manager.service';
import { SupervisorService } from './services/supervisor.service';
@Global()
@Module({
    exports: [AccountManagerService],
    providers: [AccountManagerService, SupervisorService],
    imports: [AuthModule],
    controllers: [SupervisorController, AccountManagerController],
})
export class AccountManagerModule {}
