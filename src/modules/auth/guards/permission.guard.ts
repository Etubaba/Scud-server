import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/modules/users/users.service';
import { PERMISSION } from '../decorators/permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private usersServices: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const permissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSION,
            [context.getHandler(), context.getClass()],
        );
        if (!permissions) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        const hasPermissions = await this.usersServices.hasPermissions(
            user.sub,
            permissions,
        );

        return hasPermissions;
    }
}
