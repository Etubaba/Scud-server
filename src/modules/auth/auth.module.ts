import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { RolesController } from './controllers/role.controller';
import { PasswordHash } from './password.hash';
import { RolesService } from './services/roles.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { VerificationService } from './services/verification.service';
import { AuthController } from './controllers/auth.controller';
import { VerificationController } from './controllers/verification.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PermissionsService } from './services/permissions.service';
import { PermissionsController } from './controllers/permission.controller';

@Global()
@Module({
    imports: [JwtModule.register({}), NotificationsModule],
    providers: [
        AuthService,
        JwtStrategy,
        PasswordHash,

        RolesService,
        PermissionsService,
        VerificationService,
        PermissionsService,
    ],
    exports: [AuthService, PasswordHash, VerificationService, RolesService],
    controllers: [
        AuthController,
        RolesController,
        VerificationController,
        PermissionsController,
    ],
})
export class AuthModule {}
