import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VERIFIED } from '../decorators/bypass-verification.decorator';
import { AuthService } from '../services/auth.service';

@Injectable()
export class VerificationGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isVerification = this.reflector.getAllAndOverride<boolean>(
            VERIFIED,
            [context.getHandler(), context.getClass()],
        );
        if (isVerification) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        const hasBeenVerification = await this.authService.isProviderVerified(
            user.sub,
        );
        if (hasBeenVerification) {
            return true;
        }

        throw new UnauthorizedException('Your account is not verified.');
    }
}
