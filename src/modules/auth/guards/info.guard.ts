import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { INFOCOMPLETE } from '../decorators/bypass-info-complete.decorator';
import { VERIFIED } from '../decorators/bypass-verification.decorator';
import { AuthService } from '../services/auth.service';

@Injectable()
export class InfoCompleteGaurd implements CanActivate {
    constructor(
        private reflector: Reflector,
        private authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isAccountInformationComplete =
            this.reflector.getAllAndOverride<boolean>(INFOCOMPLETE, [
                context.getHandler(),
                context.getClass(),
            ]);
        if (isAccountInformationComplete) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        const userInfoIsComplete =
            await this.authService.isAccountInformationComplete(user.sub);
        if (userInfoIsComplete) {
            return true;
        }

        throw new UnauthorizedException('Your account info is not complete.');
    }
}
