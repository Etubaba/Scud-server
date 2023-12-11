import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_GUEST_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Add your custom authentication logic here
        // for example, call super.logIn(request) to establish a session.
        const isGuest = this.reflector.getAllAndOverride<boolean>(
            IS_GUEST_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isGuest) {
            return true;
        }
        return super.canActivate(context);
    }

    handleRequest(error, user, info) {
        // You can throw an exception based on either "info" or "error" arguments
        if (error || !user) {
            throw error || new UnauthorizedException();
        }
        return user;
    }
}
