import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { OrmService } from 'src/database/orm.service';
import { roles } from 'src/modules/auth/roles';
import { RolesService } from 'src/modules/auth/services/roles.service';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AccountManagerService {
    constructor(
        private readonly ormService: OrmService,
        private readonly roleService: RolesService,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
    ) {}

    async list(filter: any): Promise<User[]> {
        const role = await this.roleService.findByName(roles.ACCOUNT_OFFICER);

        const query = {
            where: {
                roles: {
                    some: {
                        role_id: role.id,
                    },
                },
            },
        };

        if (
            filter['with-supervisors'] &&
            String(filter['with-supervisors']) === 'false'
        ) {
            query.where['AND'] = {
                supervisor: {
                    is: null,
                },
            };
        }

        return await this.usersService.findMany(query);
    }

    async assignToUser(userId: number) {
        const role = await this.roleService.findByName(roles.ACCOUNT_OFFICER);
        const managers = await this.usersService.findMany({
            where: {
                roles: {
                    some: {
                        role_id: role?.id,
                    },
                },
            },
            select: {
                drivers: true,
                id: true,
            },
        });

        if (!role || !managers) {
            throw new HttpException(
                'Failed to assign account officer to user',
                HttpStatus.BAD_REQUEST,
            );
        }
        // Get the manager with lowest count
        let managersCount: { id: number; count: number }[] = [];
        managers.forEach((manager) => {
            managersCount.push({
                id: manager.id,
                count: manager.drivers.length,
            });
        });
        managersCount = managersCount.sort((a, b) => a.count - b.count);
        const favorableManagerWithLowestCount = managersCount.shift();
        return await this.ormService.accountManagement.upsert({
            where: {
                user_id: userId,
            },
            create: {
                manager_id: favorableManagerWithLowestCount.id,
                user_id: userId,
            },
            update: {
                manager_id: favorableManagerWithLowestCount.id,
            },
        });
    }
}
